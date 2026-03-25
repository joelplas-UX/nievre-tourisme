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

const FETCH_OPTS = { headers: { 'User-Agent': 'nievre-morvan-tourisme/1.0 (contact@example.com)' }, signal: AbortSignal.timeout(8000) };

/** Zoekt hoofdafbeelding via Wikipedia-artikel (beste kwaliteit voor bekende plaatsen) */
async function searchWikipediaImage(title, lang = 'fr') {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'query', titles: title, prop: 'pageimages',
      pithumbsize: '800', format: 'json', origin: '*',
    });
    const json = await (await fetch(url, FETCH_OPTS)).json();
    const page = Object.values(json.query?.pages || {})[0];
    return page?.thumbnail?.source?.replace(/\/\d+px-/, '/800px-') || null;
  } catch { return null; }
}

/** Zoekt afbeeldingsbestand op Wikimedia Commons en geeft directe URL terug */
async function searchCommonsImage(query) {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
      action: 'query', list: 'search', srsearch: query,
      srnamespace: '6', srlimit: '5', format: 'json', origin: '*',
    });
    const hits = (await (await fetch(searchUrl, FETCH_OPTS)).json()).query?.search || [];
    // Sla bestanden over die geen foto zijn (svg, map, icon, logo)
    const photoHit = hits.find(h => /\.(jpg|jpeg|png|webp)$/i.test(h.title) &&
      !/map|karte|plan|icon|logo|coat|wapen|blason|flag|vlag/i.test(h.title));
    if (!photoHit) return null;
    const infoUrl = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
      action: 'query', titles: photoHit.title, prop: 'imageinfo',
      iiprop: 'url', iiurlwidth: '800', format: 'json', origin: '*',
    });
    const pages = Object.values((await (await fetch(infoUrl, FETCH_OPTS)).json()).query?.pages || {});
    return pages[0]?.imageinfo?.[0]?.thumburl || pages[0]?.imageinfo?.[0]?.url || null;
  } catch { return null; }
}

/**
 * Zoekt een passende foto in drie stappen:
 * 1. Wikipedia FR-artikel op naam (hoge kwaliteit voor bekende plekken)
 * 2. Wikipedia FR-artikel met stad
 * 3. Wikimedia Commons tekstzoekopdracht
 */
async function findPhoto(titleFr, city, category) {
  // Stap 1: Wikipedia op exacte naam
  const wpImg = await searchWikipediaImage(titleFr);
  if (wpImg) return { url: wpImg, source: 'wikipedia' };

  // Stap 2: Wikipedia met stadsnaam
  if (city) {
    const wpImg2 = await searchWikipediaImage(`${titleFr} ${city}`);
    if (wpImg2) return { url: wpImg2, source: 'wikipedia' };
  }

  // Stap 3: Commons — probeer naam + stad, dan categorie + stad
  const queries = [
    `${titleFr} ${city || 'Nièvre'} France`,
    city ? `${city} Nièvre ${category || ''}` : null,
  ].filter(Boolean);

  for (const q of queries) {
    const commonsImg = await searchCommonsImage(q);
    if (commonsImg) return { url: commonsImg, source: 'wikimedia' };
  }
  return null;
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
          const photo = await findPhoto(ai.title_fr, activity.location, activity.category);
          if (photo) {
            updates.imageUrl = photo.url;
            updates.imageSource = photo.source;
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
    // ── Herindelen: activiteiten met overnachting-types die verkeerd zijn gecategoriseerd ──
    const STAY_TYPES = /accommodation|hotel|bnb|bedandbreakfast|gite|gîte|chambre|camping|hostel|lodging|logement|hebergement|hébergement|résidence|residence|apartment|appartement|meuble|meublé|cottage|villa|chalet/i;
    const STAY_TITLE = /chambre|gîte|gite|hôtel|hotel|bnb|b&b|camping|hébergement|hebergement|logement|location|séjour|séjour|résidence|appartement/i;

    const recatSnap = await col.limit(2000).get();
    let recategorized = 0;

    for (const docSnap of recatSnap.docs) {
      const data = docSnap.data();
      if (data.category === 'overnachting') continue;

      const types = (data.dtTypes || []).join(' ');
      const titleFr = data.title?.fr || '';

      if (STAY_TYPES.test(types) || STAY_TITLE.test(titleFr)) {
        try {
          await docSnap.ref.update({ category: 'overnachting' });
          recategorized++;
        } catch (err) {
          errors.push(`recat ${docSnap.id}: ${err.message}`);
        }
      }
    }
    console.log(`[enrich] ${recategorized} activiteiten herindeling → overnachting`);
    enriched += recategorized;

  } catch (err) {
    console.error('[enrich] Fatale fout:', err.message);
    errors.push(err.message);
  }

  await writeLog();
  console.log(`[enrich] Klaar: ${enriched} verrijkt, ${imaged} afbeeldingen, ${errors.length} fouten`);
};
