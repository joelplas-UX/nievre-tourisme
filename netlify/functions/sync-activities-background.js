/**
 * Synchroniseert activiteiten/POIs en wandelroutes vanuit OpenStreetMap (Overpass API)
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

// ── Overpass queries ───────────────────────────────────────────────────────

// POIs: bezienswaardigheden, zwemplekken, kastelen, uitkijkpunten, etc.
const QUERY_POIS = `
[out:json][timeout:60];
area["ISO3166-2"="FR-58"]->.dep;
(
  node["tourism"~"attraction|viewpoint|museum|picnic_site"](area.dep);
  node["leisure"~"swimming_area|beach_resort"](area.dep);
  node["historic"~"castle|monument|ruins|fort"](area.dep);
  node["natural"~"peak|waterfall"](area.dep);
);
out body 150;
`;

// Wandelroutes: GR, GRP, PR en andere gemarkeerde routes in de Nièvre
const QUERY_HIKING = `
[out:json][timeout:90];
area["ISO3166-2"="FR-58"]->.dep;
(
  relation["route"="hiking"]["name"](area.dep);
  relation["route"="foot"]["name"](area.dep);
);
out center tags 200;
`;

// ── Helpers ────────────────────────────────────────────────────────────────

async function overpassFetch(query) {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  return res.json();
}

function mapPoiCategory(tags) {
  if (tags.leisure === 'swimming_area' || tags.leisure === 'beach_resort') return 'water';
  if (['castle', 'fort', 'ruins', 'monument'].includes(tags.historic) || tags.tourism === 'museum') return 'kastelen';
  if (tags.tourism === 'viewpoint' || tags.natural === 'peak' || tags.natural === 'waterfall') return 'wandelen';
  if (tags.tourism === 'picnic_site') return 'wandelen';
  return 'overig';
}

function formatDistance(tags) {
  const d = tags.distance || tags['osmc:distance'] || tags.length;
  if (!d) return null;
  const km = parseFloat(d);
  if (isNaN(km)) return d;
  return `${km} km`;
}

function formatDifficulty(tags) {
  const diff = tags.difficulty || tags['sac_scale'];
  if (!diff) return null;
  const map = {
    easy: 'Facile', moderate: 'Modéré', hard: 'Difficile',
    hiking: 'Facile', mountain_hiking: 'Modéré',
    demanding_mountain_hiking: 'Difficile', alpine_hiking: 'Très difficile',
  };
  return map[diff] || diff;
}

// ── Hoofdhandler ───────────────────────────────────────────────────────────

export const handler = async () => {
  const db = getDb();
  const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const startTime = Date.now();
  let added = 0;
  let updated = 0;
  const errors = [];

  try {
    // ── Stap 1: POIs ────────────────────────────────────────────────────────
    console.log('[sync-osm] POI query...');
    const poiData = await overpassFetch(QUERY_POIS);
    const pois = poiData.elements.filter(e => e.tags?.name);
    console.log(`[sync-osm] ${pois.length} POIs ontvangen`);

    const BATCH = 20;
    for (let i = 0; i < pois.length; i += BATCH) {
      const batch = pois.slice(i, i + BATCH);
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
            content: `Tourism writer for Nièvre & Morvan, France.
Write a short evocative description in French, English, Dutch (max 180 chars each).
Return JSON array only: [{"id":<n>,"desc_fr":"...","desc_en":"...","desc_nl":"..."}]
POIs: ${JSON.stringify(poiList)}`,
          }],
        }, { timeout: 45000 });
        const raw = msg.content[0]?.text?.trim() || '[]';
        try { descriptions = JSON.parse(raw); }
        catch { const m = raw.match(/\[[\s\S]*\]/); descriptions = m ? JSON.parse(m[0]) : []; }
      } catch (err) {
        errors.push(`Claude POI batch ${i}: ${err.message}`);
      }

      const descMap = {};
      descriptions.forEach(d => { descMap[d.id] = d; });

      await Promise.allSettled(batch.map(async poi => {
        const desc = descMap[poi.id] || {};
        const id = `osm_${poi.id}`;
        const ref = db.collection('morvan').doc('data').collection('activities').doc(id);
        const existing = await ref.get();
        if (existing.exists && existing.data().manuallyEdited) return;

        const data = {
          title: { fr: poi.tags.name, en: poi.tags['name:en'] || poi.tags.name, nl: poi.tags['name:nl'] || poi.tags.name },
          description: { fr: desc.desc_fr || '', en: desc.desc_en || '', nl: desc.desc_nl || '' },
          category: mapPoiCategory(poi.tags),
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
        if (!existing.exists) { data.createdAt = Timestamp.now(); added++; } else { updated++; }
        await ref.set(data, { merge: true });
      }));
    }

    // ── Stap 2: Wandelroutes ─────────────────────────────────────────────
    console.log('[sync-osm] Wandelroutes query...');
    const hikeData = await overpassFetch(QUERY_HIKING);
    const routes = hikeData.elements.filter(e => e.tags?.name && e.type === 'relation');
    console.log(`[sync-osm] ${routes.length} wandelroutes ontvangen`);

    for (let i = 0; i < routes.length; i += BATCH) {
      const batch = routes.slice(i, i + BATCH);
      const routeList = batch.map(r => ({
        id: r.id,
        name: r.tags.name,
        ref: r.tags.ref || '',
        distance: formatDistance(r.tags) || '',
        difficulty: formatDifficulty(r.tags) || '',
        operator: r.tags.operator || r.tags.network || '',
      }));

      let descriptions = [];
      try {
        const msg = await claude.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `Tourism writer for Nièvre & Morvan, France.
Write an evocative hiking route description in French, English, Dutch (max 220 chars each).
Mention landscape, highlights and difficulty if known.
Return JSON array only: [{"id":<n>,"desc_fr":"...","desc_en":"...","desc_nl":"..."}]
Routes: ${JSON.stringify(routeList)}`,
          }],
        }, { timeout: 45000 });
        const raw = msg.content[0]?.text?.trim() || '[]';
        try { descriptions = JSON.parse(raw); }
        catch { const m = raw.match(/\[[\s\S]*\]/); descriptions = m ? JSON.parse(m[0]) : []; }
      } catch (err) {
        errors.push(`Claude route batch ${i}: ${err.message}`);
      }

      const descMap = {};
      descriptions.forEach(d => { descMap[d.id] = d; });

      await Promise.allSettled(batch.map(async route => {
        const desc = descMap[route.id] || {};
        const id = `osm_route_${route.id}`;
        const ref = db.collection('morvan').doc('data').collection('activities').doc(id);
        const existing = await ref.get();
        if (existing.exists && existing.data().manuallyEdited) return;

        const tags = route.tags;
        const distance = formatDistance(tags);
        const difficulty = formatDifficulty(tags);

        // Bouw openingHours-veld her als wandelinfo
        const info = [
          tags.ref ? `Ref: ${tags.ref}` : null,
          distance ? `${distance}` : null,
          difficulty ? `Moeilijkheid: ${difficulty}` : null,
          tags.ascent ? `↑ ${tags.ascent}m` : null,
        ].filter(Boolean).join(' · ');

        const data = {
          title: {
            fr: tags.name,
            en: tags['name:en'] || tags.name,
            nl: tags['name:nl'] || tags.name,
          },
          description: { fr: desc.desc_fr || '', en: desc.desc_en || '', nl: desc.desc_nl || '' },
          category: 'wandelen',
          location: tags['addr:city'] || tags.locality || tags.from || '',
          lat: route.center?.lat ?? null,
          lng: route.center?.lon ?? null,
          url: tags.website || tags.url || '',
          openingHours: info || null,
          distance: distance || null,
          difficulty: difficulty || null,
          osmRef: tags.ref || null,
          osmNetwork: tags.network || tags.operator || null,
          imageUrl: null,
          source: 'openstreetmap',
          osmId: route.id,
          permanent: true,
          updatedAt: Timestamp.now(),
        };
        if (!existing.exists) { data.createdAt = Timestamp.now(); added++; } else { updated++; }
        await ref.set(data, { merge: true });
      }));
    }

  } catch (err) {
    console.error('[sync-osm] Fatale fout:', err.message);
    errors.push(err.message);
  }

  await getDb().collection('morvan').doc('data').collection('activity_syncs').add({
    timestamp: Timestamp.now(),
    source: 'openstreetmap',
    added,
    updated,
    skipped: 0,
    errors: errors.slice(0, 20),
    durationMs: Date.now() - startTime,
  });

  console.log(`[sync-osm] Klaar: ${added} nieuw, ${updated} bijgewerkt, ${errors.length} fouten`);
};
