/**
 * Synchroniseert activiteiten/POIs vanuit OpenStreetMap (Overpass API)
 * voor de Nièvre / Morvan regio. Gebruikt Claude Haiku voor beschrijvingen.
 * Background function — loopt tot 15 min, geeft 202 terug aan caller.
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

// Overpass query: interessante POIs in département Nièvre (FR-58)
const OVERPASS_QUERY = `
[out:json][timeout:60];
area["ISO3166-2"="FR-58"]->.dep;
(
  node["tourism"~"attraction|viewpoint|museum|picnic_site"](area.dep);
  node["leisure"~"swimming_area|beach_resort"](area.dep);
  node["historic"~"castle|monument|ruins|fort"](area.dep);
  node["natural"~"peak|waterfall"](area.dep);
);
out body 100;
`;

function mapCategory(tags) {
  if (tags.leisure === 'swimming_area' || tags.leisure === 'beach_resort') return 'water';
  if (['castle', 'fort', 'ruins', 'monument'].includes(tags.historic) || tags.tourism === 'museum') return 'kastelen';
  if (tags.tourism === 'viewpoint' || tags.natural === 'peak' || tags.natural === 'waterfall') return 'wandelen';
  if (tags.tourism === 'picnic_site') return 'wandelen';
  return 'overig';
}

export const handler = async () => {
  const db = getDb();
  const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const startTime = Date.now();
  let added = 0;
  let updated = 0;
  const errors = [];

  try {
    // 1. Query Overpass API
    console.log('[sync-activities] Overpass API query...');
    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      signal: AbortSignal.timeout(90000),
    });

    if (!overpassRes.ok) throw new Error(`Overpass HTTP ${overpassRes.status}`);
    const overpassData = await overpassRes.json();

    const pois = overpassData.elements.filter(e => e.tags?.name);
    console.log(`[sync-activities] ${pois.length} POIs ontvangen`);

    // 2. Stuur in batches van 20 naar Claude voor beschrijvingen + vertalingen
    const BATCH_SIZE = 20;
    for (let i = 0; i < pois.length; i += BATCH_SIZE) {
      const batch = pois.slice(i, i + BATCH_SIZE);

      const poiList = batch.map(p => ({
        id: p.id,
        name: p.tags.name,
        type: p.tags.tourism || p.tags.leisure || p.tags.historic || p.tags.natural || 'poi',
        city: p.tags['addr:city'] || p.tags.locality || '',
      }));

      let descriptions = [];
      try {
        const msg = await claude.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `You are a tourism writer for the Nièvre and Morvan region in France.
For each POI below, write a short evocative description in French, English, and Dutch (max 180 chars each).
Use your knowledge of the region to write interesting descriptions.

Return a JSON array, one object per POI:
[{"id": <number>, "desc_fr": "...", "desc_en": "...", "desc_nl": "..."}]

POIs:
${JSON.stringify(poiList)}

Return ONLY valid JSON array, no markdown.`,
          }],
        }, { timeout: 45000 });

        const raw = msg.content[0]?.text?.trim() || '[]';
        try {
          descriptions = JSON.parse(raw);
        } catch {
          const match = raw.match(/\[[\s\S]*\]/);
          descriptions = match ? JSON.parse(match[0]) : [];
        }
      } catch (err) {
        console.warn(`[sync-activities] Claude batch ${i} fout:`, err.message);
        errors.push(`Claude batch ${i}: ${err.message}`);
      }

      const descMap = {};
      descriptions.forEach(d => { descMap[d.id] = d; });

      // 3. Schrijf naar Firestore
      await Promise.allSettled(batch.map(async poi => {
        const desc = descMap[poi.id] || {};
        const id = `osm_${poi.id}`;
        const ref = db.collection('morvan').doc('data').collection('activities').doc(id);
        const existing = await ref.get();
        if (existing.exists && existing.data().manuallyEdited) return;

        const data = {
          title: {
            fr: poi.tags.name,
            en: poi.tags['name:en'] || poi.tags.name,
            nl: poi.tags['name:nl'] || poi.tags.name,
          },
          description: {
            fr: desc.desc_fr || '',
            en: desc.desc_en || '',
            nl: desc.desc_nl || '',
          },
          category: mapCategory(poi.tags),
          location: poi.tags['addr:city'] || poi.tags.locality || '',
          lat: poi.lat ?? null,
          lng: poi.lon ?? null,
          url: poi.tags.website || poi.tags.url || '',
          imageUrl: null,
          source: 'openstreetmap',
          osmId: poi.id,
          permanent: true,
          updatedAt: Timestamp.now(),
        };

        if (!existing.exists) {
          data.createdAt = Timestamp.now();
          added++;
        } else {
          updated++;
        }

        await ref.set(data, { merge: true });
      }));
    }
  } catch (err) {
    console.error('[sync-activities] Fatale fout:', err.message);
    errors.push(err.message);
  }

  // Log de sync run
  await getDb().collection('morvan').doc('data').collection('activity_syncs').add({
    timestamp: Timestamp.now(),
    added,
    updated,
    errors,
    durationMs: Date.now() - startTime,
  });

  console.log(`[sync-activities] Klaar: ${added} nieuw, ${updated} bijgewerkt, ${errors.length} fouten`);
};
