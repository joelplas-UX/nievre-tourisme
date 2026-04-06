/**
 * patch-activities-background.js
 * Voegt Wikipedia-foto's toe aan bestaande activiteiten die nog geen afbeelding hebben.
 *
 * Handmatig te triggeren via Admin (x-admin-trigger: 1).
 * Background function — geeft 202 terug, loopt max 15 min.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

// ── Wikipedia-foto ophalen ────────────────────────────────────
async function tryWikipediaPhoto(name) {
  if (!name) return null;
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
      { headers: { 'User-Agent': 'NievreMorevan/1.0 (nievremorvan.com)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    if (page?.missing !== undefined) return null;
    return page?.thumbnail?.source || null;
  } catch { return null; }
}

async function getWikipediaPhoto(primaryName, fallbackCity) {
  const photo = await tryWikipediaPhoto(primaryName);
  if (photo) return { url: photo, source: 'wikipedia_poi' };
  if (fallbackCity && fallbackCity !== primaryName) {
    const cityPhoto = await tryWikipediaPhoto(fallbackCity);
    if (cityPhoto) return { url: cityPhoto, source: 'wikipedia_village' };
  }
  return null;
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  if (event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Alleen via admin te triggeren' };
  }

  // 202 Accepted — verwerking gaat door op achtergrond
  setTimeout(async () => {
    const log = [];
    let patched = 0, skipped = 0, errors = 0;

    try {
      const snap = await db.collection('morvan').doc('data').collection('activities').get();
      const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));
      log.push(`${docs.length} activiteiten gevonden`);

      for (const act of docs) {
        // Sla over: al een foto, of handmatig bewerkt
        if (act.imageUrl || act.manuallyEdited) { skipped++; continue; }

        const titleFr = act.title?.fr || '';
        const city    = act.location || '';
        const isNamedPoi = act.source === 'openstreetmap' && act.category !== 'wandelen';

        try {
          const wikiResult = await getWikipediaPhoto(isNamedPoi ? titleFr : null, city);
          if (wikiResult) {
            await act.ref.update({
              imageUrl:    wikiResult.url,
              imageSource: wikiResult.source,
              updatedAt:   Timestamp.now(),
            });
            patched++;
            log.push(`✓ ${titleFr} → ${wikiResult.source}`);
          } else {
            skipped++;
          }
        } catch (err) {
          errors++;
          log.push(`✗ ${act.id}: ${err.message}`);
        }

        // Beleefd wachten: Wikipedia heeft geen hard rate-limit maar we zijn netjes
        await new Promise(r => setTimeout(r, 200));
      }

      log.push(`Klaar: ${patched} foto's toegevoegd, ${skipped} overgeslagen, ${errors} fouten`);
      await db.collection('morvan').doc('data').collection('scrape_runs').add({
        source: 'patch_activities',
        patchedPhotos: patched,
        skipped,
        errors,
        log,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('[patch-activities]', err.message);
    }
  }, 0);

  return { statusCode: 202, body: '' };
};
