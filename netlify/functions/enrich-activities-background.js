/**
 * Verrijkt activiteiten zonder titel/beschrijving via:
 * 1. Claude Haiku — genereert FR/EN/NL titel + beschrijving op basis van POI-type en locatie
 * 2. Wikimedia Commons — zoekt een vrije afbeelding op basis van naam + locatie
 *
 * Vereiste env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, CLAUDE_API_KEY
 * Max activiteiten per run: 200 (background function limiet ~15 min)
 */

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

const CAT_LABELS = {
  wandelen: 'randonnée / nature / parc',
  fietsen: 'vélo / cyclotourisme',
  water: 'baignade / lac / piscine',
  kastelen: 'patrimoine / château / musée / église',
  eten: 'gastronomie / restaurant / cave à vin',
  overig: 'loisir / tourisme',
};

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.content?.[0]?.text || '';
}

async function enrichWithClaude(activity) {
  const catHint = CAT_LABELS[activity.category] || 'tourisme';
  const location = [activity.location, activity.postcode].filter(Boolean).join(' ');
  const existingFr = activity.title?.fr || '';
  const existingDesc = activity.description?.fr || '';

  const prompt = `Je suis un rédacteur touristique pour la Nièvre (Bourgogne, France).
Voici une activité ou un lieu touristique :
- Type : ${catHint}
- Localisation : ${location || 'Nièvre, France'}
${existingFr ? `- Nom existant (FR) : ${existingFr}` : ''}
${existingDesc ? `- Description existante (FR) : ${existingDesc.slice(0, 300)}` : ''}
${activity.address ? `- Adresse : ${activity.address}` : ''}

Génère un JSON avec ces champs (réponds UNIQUEMENT avec le JSON, sans markdown) :
{
  "title_fr": "Nom court du lieu (max 60 car.)",
  "title_en": "Short English name (max 60 chars)",
  "title_nl": "Korte Nederlandse naam (max 60 tekens)",
  "desc_fr": "Description 2-3 phrases en français, attrayante pour les visiteurs",
  "desc_en": "2-3 sentence description in English for visitors",
  "desc_nl": "2-3 zinnen beschrijving in het Nederlands voor bezoekers"
}`;

  const text = await callClaude(prompt);

  // Extraheer JSON uit de response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Geen JSON in Claude-response');
  return JSON.parse(jsonMatch[0]);
}

async function searchWikimediaImage(query) {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srnamespace: '6',
      srlimit: '3',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'nievre-morvan-tourisme/1.0 (contact@example.com)' },
      signal: AbortSignal.timeout(8000),
    });
    const json = await res.json();
    const hits = json.query?.search || [];
    if (!hits.length) return null;

    // Haal de directe URL op van het eerste resultaat
    const title = hits[0].title; // bv. "File:Château de Bazois.jpg"
    const infoUrl = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'imageinfo',
      iiprop: 'url',
      format: 'json',
      origin: '*',
    });
    const infoRes = await fetch(infoUrl, {
      headers: { 'User-Agent': 'nievre-morvan-tourisme/1.0 (contact@example.com)' },
      signal: AbortSignal.timeout(8000),
    });
    const infoJson = await infoRes.json();
    const pages = Object.values(infoJson.query?.pages || {});
    const url = pages[0]?.imageinfo?.[0]?.url;
    return url || null;
  } catch {
    return null;
  }
}

export const handler = async () => {
  const startTime = Date.now();
  let db;
  let enriched = 0;
  let imaged = 0;
  const errors = [];

  const writeLog = async () => {
    if (!db) return;
    try {
      await db.collection('morvan').doc('data').collection('activity_syncs').add({
        timestamp: Timestamp.now(),
        source: 'claude-enrich',
        added: enriched,
        updated: imaged,
        skipped: 0,
        errors: errors.slice(0, 20),
        durationMs: Date.now() - startTime,
      });
    } catch (e) {
      console.error('[enrich] Log schrijven mislukt:', e.message);
    }
  };

  try {
    db = getDb();
  } catch (e) {
    console.error('[enrich] Firebase Admin init mislukt:', e.message);
    errors.push('Firebase init: ' + e.message);
    // kan geen log schrijven zonder db
    return;
  }

  const col = db.collection('morvan').doc('data').collection('activities');

  if (!process.env.CLAUDE_API_KEY) {
    console.error('[enrich] CLAUDE_API_KEY niet ingesteld');
    errors.push('CLAUDE_API_KEY niet ingesteld');
    await writeLog();
    return;
  }

  try {
    // Haal activiteiten op die nog niet verrijkt zijn (geen enrichedBy veld)
    // We halen 300 op en filteren in code (Firestore ondersteunt geen "field bestaat niet" query)
    const snap = await col.limit(300).get();
    const toEnrich = snap.docs.filter(d => {
      const data = d.data();
      return !data.enrichedBy && (!data.title?.fr || data.title.fr.trim() === '');
    });

    console.log(`[enrich] ${snap.size} geladen, ${toEnrich.length} te verrijken`);

    for (const docSnap of toEnrich) {
      const activity = { id: docSnap.id, ...docSnap.data() };
      const updates = {};

      try {
        // AI-verrijking
        const ai = await enrichWithClaude(activity);
        updates.title = {
          fr: ai.title_fr || '',
          en: ai.title_en || '',
          nl: ai.title_nl || '',
        };
        updates.description = {
          fr: ai.desc_fr || '',
          en: ai.desc_en || '',
          nl: ai.desc_nl || '',
        };
        enriched++;

        // Afbeelding zoeken als er nog geen is
        if (!activity.imageUrl && ai.title_fr) {
          const imageQuery = `${ai.title_fr} ${activity.location || 'Nièvre'} France`;
          const imageUrl = await searchWikimediaImage(imageQuery);
          if (imageUrl) {
            updates.imageUrl = imageUrl;
            updates.imageSource = 'wikimedia';
            imaged++;
          }
        }

        updates.enrichedAt = Timestamp.now();
        updates.enrichedBy = 'claude-haiku';
        await docSnap.ref.update(updates);

        // Rate limit: ~3 req/sec voor Claude haiku
        await new Promise(r => setTimeout(r, 350));
      } catch (err) {
        errors.push(`${activity.id}: ${err.message}`);
        console.error(`[enrich] Fout bij ${activity.id}:`, err.message);
      }
    }

    // Verrijk activiteiten met titel maar zonder beschrijving
    const descSnap = await col.limit(300).get();
    const needDesc = descSnap.docs.filter(d => {
      const data = d.data();
      return data.title?.fr && data.title.fr.trim() !== ''
        && (!data.description?.fr || data.description.fr.trim() === '')
        && data.enrichedBy !== 'claude-haiku';
    });

    for (const docSnap of needDesc) {
      const activity = { id: docSnap.id, ...docSnap.data() };
      if (!activity.title?.fr) continue;
      const updates = {};

      try {
        const ai = await enrichWithClaude(activity);
        if (ai.desc_fr) {
          updates.description = {
            fr: ai.desc_fr || '',
            en: ai.desc_en || '',
            nl: ai.desc_nl || '',
          };
          // Vul ontbrekende vertalingen aan in bestaande titels
          if (!activity.title?.en) updates['title.en'] = ai.title_en || activity.title.fr;
          if (!activity.title?.nl) updates['title.nl'] = ai.title_nl || activity.title.fr;
          updates.enrichedAt = Timestamp.now();
          updates.enrichedBy = 'claude-haiku';
          await docSnap.ref.update(updates);
          enriched++;
        }
        await new Promise(r => setTimeout(r, 350));
      } catch (err) {
        errors.push(`${activity.id}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('[enrich] Fatale fout:', err.message);
    errors.push(err.message);
  }

  await writeLog();
  console.log(`[enrich] Klaar: ${enriched} verrijkt, ${imaged} afbeeldingen, ${errors.length} fouten`);
};
