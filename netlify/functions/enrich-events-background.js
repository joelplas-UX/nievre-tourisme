/**
 * Zoekt ontbrekende foto's voor evenementen én activiteiten.
 * Background function — geeft direct 202 terug, loopt max 15 min.
 *
 * Vereiste env var (optioneel maar aanbevolen):
 *   FLICKR_API_KEY — gratis via https://www.flickr.com/services/apps/create/
 *
 * Strategie per item zonder imageUrl:
 *  1. Wikipedia FR-artikel op naam
 *  2. Wikipedia FR-artikel met stad
 *  3. Flickr (Creative Commons foto's) — echte reisfoto's van de Nièvre/Morvan
 *  4. Wikimedia Commons tekstzoekopdracht
 *  5. og:image uit de sourceUrl/url van het item (re-fetch)
 *
 * Verwerkt max 150 evenementen + 150 activiteiten per run.
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

const FETCH_OPTS = {
  headers: { 'User-Agent': 'nievre-morvan-tourisme/1.0 (contact@nievre-tourisme.netlify.app)' },
  signal: AbortSignal.timeout(8000),
};

// ── Wikipedia / Wikimedia helpers ─────────────────────────────────────────────

async function searchWikipediaImage(title, lang = 'fr') {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'query', titles: title, prop: 'pageimages',
      pithumbsize: '800', format: 'json', origin: '*',
    });
    const json = await (await fetch(url, FETCH_OPTS)).json();
    const page = Object.values(json.query?.pages || {})[0];
    if (page?.thumbnail?.source) {
      return page.thumbnail.source.replace(/\/\d+px-/, '/800px-');
    }
    return null;
  } catch { return null; }
}

async function searchCommonsImage(query) {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?` + new URLSearchParams({
      action: 'query', list: 'search', srsearch: query,
      srnamespace: '6', srlimit: '5', format: 'json', origin: '*',
    });
    const hits = (await (await fetch(searchUrl, FETCH_OPTS)).json()).query?.search || [];
    const photoHit = hits.find(h =>
      /\.(jpg|jpeg|png|webp)$/i.test(h.title) &&
      !/map|karte|plan|icon|logo|coat|wapen|blason|flag|vlag/i.test(h.title)
    );
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
 * Zoekt Creative Commons foto's op Flickr.
 * Licenties: CC BY (1), CC BY-SA (3), CC BY-ND (4), CC0/Publiek domein (9,10)
 * Vereist: FLICKR_API_KEY env var
 */
async function searchFlickrImage(query) {
  const key = process.env.FLICKR_API_KEY;
  if (!key) return null;
  try {
    // Zoek in "Nièvre" of "Morvan" context voor relevantie
    const searchQuery = query.includes('Nièvre') || query.includes('Morvan')
      ? query
      : `${query} Nièvre Morvan France`;

    const params = new URLSearchParams({
      method: 'flickr.photos.search',
      api_key: key,
      text: searchQuery,
      license: '1,3,4,5,6,9,10', // CC licenties + publiek domein
      media: 'photos',
      content_type: '1',           // alleen foto's (geen screenshots)
      sort: 'relevance',
      per_page: '5',
      extras: 'url_l,url_m,owner_name,license',
      format: 'json',
      nojsoncallback: '1',
    });

    const json = await (await fetch(
      `https://api.flickr.com/services/rest/?${params}`,
      FETCH_OPTS
    )).json();

    const photos = json.photos?.photo || [];
    // Pak de eerste foto met een bruikbare URL
    for (const photo of photos) {
      const url = photo.url_l || photo.url_m;
      if (url && url.startsWith('http')) return url;
    }
    return null;
  } catch { return null; }
}

/** Haalt og:image of eerste grote <img> op van een externe pagina */
async function fetchOgImage(pageUrl) {
  if (!pageUrl || !pageUrl.startsWith('http')) return null;
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NievreTourisme-Bot/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // og:image
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og?.[1]?.startsWith('http')) return og[1];

    // twitter:image
    const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (tw?.[1]?.startsWith('http')) return tw[1];

    return null;
  } catch { return null; }
}

/**
 * Zoekt foto via 5 stappen, stopt bij eerste treffer.
 */
async function findPhoto(titleFr, city, sourceUrl) {
  // 1. Wikipedia op naam (meest specifiek)
  const wp1 = await searchWikipediaImage(titleFr);
  if (wp1) return { url: wp1, source: 'wikipedia' };

  // 2. Wikipedia naam + stad
  if (city) {
    const wp2 = await searchWikipediaImage(`${titleFr} ${city}`);
    if (wp2) return { url: wp2, source: 'wikipedia' };
  }

  // 3. Flickr Creative Commons — echte reisfoto's
  const flickrQuery = city
    ? `${titleFr} ${city}`
    : `${titleFr} Nièvre`;
  const fl = await searchFlickrImage(flickrQuery);
  if (fl) return { url: fl, source: 'flickr' };

  // 4. Wikimedia Commons
  const commonsQueries = [
    `${titleFr} ${city || 'Nièvre'} France`,
    city ? `${city} Nièvre` : null,
  ].filter(Boolean);

  for (const q of commonsQueries) {
    const c = await searchCommonsImage(q);
    if (c) return { url: c, source: 'wikimedia' };
  }

  // 5. og:image van de bronpagina
  if (sourceUrl) {
    const og = await fetchOgImage(sourceUrl);
    if (og) return { url: og, source: 'og:image' };
  }

  return null;
}

// ── Verwerk collectie ─────────────────────────────────────────────────────────

async function processCollection(col, titleField, urlField, limit, results) {
  const snap = await col.limit(limit * 3).get(); // Laad meer, filter in JS
  const noPhoto = snap.docs.filter(d => {
    const data = d.data();
    return !data.imageUrl && !data.manuallyEdited;
  }).slice(0, limit);

  console.log(`[photo-enrich] ${noPhoto.length} items zonder foto in ${col.path.split('/').pop()}`);

  for (const docSnap of noPhoto) {
    const data = docSnap.data();
    const titleFr = data[titleField]?.fr || data.title?.fr || '';
    if (!titleFr) continue;

    try {
      const photo = await findPhoto(
        titleFr,
        data.location || '',
        data[urlField] || data.url || data.sourceUrl || '',
      );

      if (photo) {
        await docSnap.ref.update({
          imageUrl: photo.url,
          imageSource: photo.source,
          photoEnrichedAt: Timestamp.now(),
        });
        results.imaged++;
        console.log(`[photo-enrich] ✓ ${titleFr} → ${photo.source}`);
      } else {
        results.notFound++;
      }

      // Rate limit: ~4 req/sec
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      results.errors.push(`${docSnap.id}: ${err.message}`);
      console.error(`[photo-enrich] Fout bij ${docSnap.id}:`, err.message);
    }
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async () => {
  const startTime = Date.now();
  const db = getDb();

  const results = { imaged: 0, notFound: 0, errors: [] };

  try {
    const eventsCol    = db.collection('morvan').doc('data').collection('events');
    const activitiesCol = db.collection('morvan').doc('data').collection('activities');

    // Verwerk evenementen en activiteiten
    await processCollection(eventsCol,     'title', 'sourceUrl', 150, results);
    await processCollection(activitiesCol, 'title', 'url',       150, results);

  } catch (err) {
    console.error('[photo-enrich] Fatale fout:', err.message);
    results.errors.push(err.message);
  }

  // Log
  try {
    await db.collection('morvan').doc('data').collection('activity_syncs').add({
      timestamp: Timestamp.now(),
      source: 'photo-enrich',
      added: results.imaged,
      updated: 0,
      skipped: results.notFound,
      errors: results.errors.slice(0, 20),
      durationMs: Date.now() - startTime,
    });
  } catch (e) {
    console.error('[photo-enrich] Log schrijven mislukt:', e.message);
  }

  console.log(`[photo-enrich] Klaar: ${results.imaged} foto's gevonden, ${results.notFound} niet gevonden, ${results.errors.length} fouten`);
};
