/**
 * Scrapet wandelroutes voor de Nièvre van Visorando.com.
 * Gebruikt Claude Haiku om routes te extraheren uit HTML.
 * Background function — geeft direct 202 terug, loopt max 15 min.
 *
 * Deduplicatie: stabiele doc ID = visorando_{slug}
 * Slaat al bestaande routes over tenzij ouder dan 30 dagen.
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function getDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// Pagina's om te scrapen (Nièvre wandelroutes)
const VISORANDO_PAGES = [
  'https://www.visorando.com/randonnee-nievre/',
  'https://www.visorando.com/randonnee-nievre/?p=2',
  'https://www.visorando.com/randonnee-morvan/',
];

const FETCH_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NievreTourisme-Bot/1.0; +https://nievre-tourisme.netlify.app)',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'Accept': 'text/html,application/xhtml+xml',
  },
  signal: AbortSignal.timeout(20000),
};

function buildExtractionPrompt(html, pageUrl) {
  return `Tu es un extracteur de données de randonnées. Voici du HTML de la page "${pageUrl}" de Visorando.

Extrais TOUTES les randonnées/itinéraires listés sur cette page.
Retourne un tableau JSON UNIQUEMENT (pas de markdown), chaque objet doit avoir :
- slug: string (extrait du href de la page de détail, ex: "randonnee-lac-des-settons")
- name_fr: string (nom de la randonnée en français)
- distance_km: number or null (distance en km)
- duration_h: number or null (durée estimée en heures)
- difficulty: "Facile"|"Modéré"|"Difficile"|"Très difficile" or null
- ascent_m: number or null (dénivelé positif en mètres)
- city: string (commune de départ ou région)
- image_url: string or null (URL absolue de l'image miniature)
- detail_url: string (URL absolue de la page de détail)

Retourne [] si aucune randonnée trouvée.

HTML (premiers 35000 chars):
${html.slice(0, 35000)}`;
}

function buildDescriptionPrompt(routes) {
  return `Rédacteur touristique pour la Nièvre & le Morvan, France.
Écris une description évocatrice pour chaque randonnée (max 220 caractères chacune) en français, anglais et néerlandais.
Mentionne le paysage, les points d'intérêt et la difficulté si connue.
Retourne JSON UNIQUEMENT: [{"slug":"...","desc_fr":"...","desc_en":"...","desc_nl":"..."}]
Randonnées: ${JSON.stringify(routes)}`;
}

export const handler = async () => {
  const startTime = Date.now();
  const db = getDb();
  const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const col = db.collection('morvan').doc('data').collection('activities');

  let added = 0;
  let updated = 0;
  const errors = [];

  // 30 dagen geleden — routes ouder dan dit worden bijgewerkt
  const refreshBefore = Timestamp.fromMillis(Date.now() - 30 * 24 * 3600 * 1000);

  try {
    for (const pageUrl of VISORANDO_PAGES) {
      console.log(`[visorando] Fetching: ${pageUrl}`);

      let html;
      try {
        const res = await fetch(pageUrl, FETCH_OPTS);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        html = await res.text();
        console.log(`[visorando] HTML: ${Math.round(html.length / 1024)}KB`);
      } catch (err) {
        errors.push(`fetch ${pageUrl}: ${err.message}`);
        continue;
      }

      // Stap 1: extraheer routes uit HTML
      let routes = [];
      try {
        const msg = await claude.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 3000,
          messages: [{ role: 'user', content: buildExtractionPrompt(html, pageUrl) }],
        }, { timeout: 60000 });

        const raw = msg.content[0]?.text?.trim() || '[]';
        try { routes = JSON.parse(raw); }
        catch { const m = raw.match(/\[[\s\S]*\]/); routes = m ? JSON.parse(m[0]) : []; }
      } catch (err) {
        errors.push(`claude extract ${pageUrl}: ${err.message}`);
        continue;
      }

      console.log(`[visorando] ${routes.length} routes gevonden op ${pageUrl}`);
      if (!routes.length) continue;

      // Filter: sla routes over die recent zijn bijgewerkt
      const toProcess = [];
      for (const r of routes) {
        if (!r.slug || !r.name_fr) continue;
        const id = `visorando_${r.slug}`;
        const existing = await col.doc(id).get();
        if (existing.exists && existing.data().updatedAt?.toMillis() > refreshBefore.toMillis()) {
          continue; // recent genoeg
        }
        toProcess.push({ ...r, id });
      }

      if (!toProcess.length) {
        console.log('[visorando] Alle routes al up-to-date');
        continue;
      }

      // Stap 2: genereer beschrijvingen in batch
      const routeSummaries = toProcess.map(r => ({
        slug: r.slug,
        name_fr: r.name_fr,
        distance: r.distance_km ? `${r.distance_km}km` : '',
        difficulty: r.difficulty || '',
        city: r.city || '',
      }));

      let descriptions = [];
      try {
        const msg2 = await claude.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 3000,
          messages: [{ role: 'user', content: buildDescriptionPrompt(routeSummaries) }],
        }, { timeout: 60000 });

        const raw2 = msg2.content[0]?.text?.trim() || '[]';
        try { descriptions = JSON.parse(raw2); }
        catch { const m = raw2.match(/\[[\s\S]*\]/); descriptions = m ? JSON.parse(m[0]) : []; }
      } catch (err) {
        errors.push(`claude desc batch: ${err.message}`);
      }

      const descMap = {};
      descriptions.forEach(d => { descMap[d.slug] = d; });

      // Stap 3: opslaan
      await Promise.allSettled(toProcess.map(async route => {
        const desc = descMap[route.slug] || {};
        const ref = col.doc(route.id);
        const existing = await ref.get();
        if (existing.exists && existing.data().manuallyEdited) return;

        // Bouw info-string voor openingHours
        const info = [
          route.distance_km ? `${route.distance_km} km` : null,
          route.duration_h   ? `~${route.duration_h}h`  : null,
          route.difficulty   ? `Moeilijkheid: ${route.difficulty}` : null,
          route.ascent_m     ? `↑ ${route.ascent_m}m`  : null,
        ].filter(Boolean).join(' · ');

        const data = {
          title: {
            fr: route.name_fr,
            en: route.name_fr, // Visorando is FR-only, Claude beschrijvingen zijn wel meertalig
            nl: route.name_fr,
          },
          description: {
            fr: desc.desc_fr || '',
            en: desc.desc_en || '',
            nl: desc.desc_nl || '',
          },
          category: 'wandelen',
          location: route.city || '',
          lat: null,
          lng: null,
          url: route.detail_url || '',
          imageUrl: route.image_url || null,
          openingHours: info || null,
          distance: route.distance_km ? `${route.distance_km} km` : null,
          difficulty: route.difficulty || null,
          source: 'visorando',
          permanent: true,
          updatedAt: Timestamp.now(),
        };

        if (!existing.exists) { data.createdAt = Timestamp.now(); added++; }
        else { updated++; }

        await ref.set(data, { merge: true });
      }));
    }
  } catch (err) {
    console.error('[visorando] Fatale fout:', err.message);
    errors.push(err.message);
  }

  await db.collection('morvan').doc('data').collection('activity_syncs').add({
    timestamp: Timestamp.now(),
    source: 'visorando',
    added,
    updated,
    skipped: 0,
    errors: errors.slice(0, 20),
    durationMs: Date.now() - startTime,
  });

  console.log(`[visorando] Klaar: ${added} nieuw, ${updated} bijgewerkt, ${errors.length} fouten`);
};
