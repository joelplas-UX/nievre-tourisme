/**
 * Synchroniseert evenementen vanuit OpenAgenda voor département Nièvre (58).
 * Background function — geeft direct 202 terug, loopt max 15 min.
 *
 * Vereiste env var: OPENAGENDA_API_KEY
 * Gratis aanmaken via: https://openagenda.com/developers
 *
 * Deduplicatie: stabiele doc ID = oag_{uid}
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

const BASE = 'https://api.openagenda.com/v2';
const PAGE_SIZE = 100;

// Nièvre centrum — filter binnen 80 km radius
const NIEVRE_LAT = 47.1;
const NIEVRE_LNG = 3.5;
const RADIUS_KM  = 80;

function getLang(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.fr || obj.en || Object.values(obj)[0] || '';
}

function mapCategory(keywords) {
  const kw = [...(keywords?.fr || []), ...(keywords?.en || [])].join(' ').toLowerCase();
  if (/festival/.test(kw)) return 'festival';
  if (/marché|marchés|march|foire/.test(kw)) return 'markt';
  if (/sport|athlé|vélo|course|trail/.test(kw)) return 'sport';
  if (/natur|environnement|randonnée|balade|forêt/.test(kw)) return 'natuur';
  if (/concert|musique|jazz|rock|chanson|spectacle musical/.test(kw)) return 'muziek';
  if (/exposition|théâtre|cinéma|conférence|patrimoine|danse|arts/.test(kw)) return 'cultuur';
  return 'overig';
}

function buildImageUrl(image) {
  if (!image) return null;
  if (typeof image === 'string' && image.startsWith('http')) return image;
  // OpenAgenda v2: { base, filename, variants }
  if (image.base && image.filename) {
    // Kies 1024w variant als die er is, anders origineel
    const variants = image.variants || {};
    const large = variants['1024w'] || variants['800w'] || variants['640w'];
    return large || `${image.base}${image.filename}`;
  }
  return null;
}

export const handler = async () => {
  const startTime = Date.now();
  const db = getDb();
  const key = process.env.OPENAGENDA_API_KEY;

  let added = 0;
  let updated = 0;
  const errors = [];

  const writeLog = async () => {
    try {
      await db.collection('morvan').doc('data').collection('scrape_runs').add({
        timestamp: Timestamp.now(),
        sourcesScraped: 1,
        eventsFound: added + updated,
        eventsAdded: added,
        eventsDeleted: 0,
        source: 'openagenda',
        errors: errors.slice(0, 20),
        durationMs: Date.now() - startTime,
      });
    } catch (e) {
      console.error('[openagenda] Log schrijven mislukt:', e.message);
    }
  };

  if (!key) {
    console.error('[openagenda] OPENAGENDA_API_KEY niet ingesteld');
    errors.push('OPENAGENDA_API_KEY niet ingesteld');
    await writeLog();
    return;
  }

  const col = db.collection('morvan').doc('data').collection('events');

  // Laad manuallyEdited IDs in één query
  let manualIds = new Set();
  try {
    const manualSnap = await col.where('manuallyEdited', '==', true).get();
    manualIds = new Set(manualSnap.docs.map(d => d.id));
  } catch (e) {
    errors.push('manualIds laden: ' + e.message);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUnix = Math.floor(today.getTime() / 1000);

  let after = null;
  let hasMore = true;
  let pageCount = 0;
  const MAX_PAGES = 20;

  try {
    while (hasMore && pageCount < MAX_PAGES) {
      const params = new URLSearchParams({
        key,
        size: PAGE_SIZE,
        'oaq[timings][gte]': todayUnix,
        'oaq[geo_distancefrom][latitude]':  NIEVRE_LAT,
        'oaq[geo_distancefrom][longitude]': NIEVRE_LNG,
        'oaq[geo_distancefrom][distance]':  `${RADIUS_KM}km`,
      });
      if (after) params.set('after', after);

      const res = await fetch(`${BASE}/events?${params}`, {
        headers: { 'User-Agent': 'nievre-morvan-tourisme/1.0' },
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`OpenAgenda HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }

      const json = await res.json();
      const events = json.events || [];
      after = json.after ?? null;
      hasMore = !!after && events.length === PAGE_SIZE;
      pageCount++;

      console.log(`[openagenda] Pagina ${pageCount}: ${events.length} evenementen (total: ${json.total})`);

      for (const ev of events) {
        try {
          const id = `oag_${ev.uid}`;
          if (manualIds.has(id)) continue;

          const titleFr = getLang(ev.title, 'fr');
          if (!titleFr) continue;

          // Eerste timing bepaalt datum; einde van laatste timing = eindDatum
          const timings = ev.timings || [];
          const firstBegin = timings[0]?.begin ? new Date(timings[0].begin) : null;
          const lastEnd   = timings[timings.length - 1]?.end
            ? new Date(timings[timings.length - 1].end) : null;

          const imageUrl = buildImageUrl(ev.image || ev.thumbnail);

          const ref = col.doc(id);
          const existing = await ref.get();

          const data = {
            title: {
              fr: titleFr,
              en: getLang(ev.title, 'en') || titleFr,
              nl: getLang(ev.title, 'nl') || titleFr,
            },
            description: {
              fr: getLang(ev.description || ev.longDescription, 'fr') || '',
              en: getLang(ev.description || ev.longDescription, 'en') || '',
              nl: getLang(ev.description || ev.longDescription, 'nl') || '',
            },
            date:    firstBegin ? Timestamp.fromDate(firstBegin) : null,
            endDate: lastEnd    ? Timestamp.fromDate(lastEnd)    : null,
            location: ev.location?.city || ev.location?.name || '',
            lat: ev.location?.latitude  ?? null,
            lng: ev.location?.longitude ?? null,
            type: mapCategory(ev.keywords),
            sourceUrl: ev.canonicalUrl
              || `https://openagenda.com/agendas/${ev.agenda?.uid}/events/${ev.uid}`,
            sourceName: ev.agenda?.title || 'OpenAgenda',
            imageUrl,
            source: 'openagenda',
            oagUid: ev.uid,
            featured: false,
            hidden: false,
            updatedAt: Timestamp.now(),
          };

          if (!existing.exists) { data.createdAt = Timestamp.now(); added++; }
          else { updated++; }

          await ref.set(data, { merge: true });
        } catch (err) {
          errors.push(`oag_${ev.uid}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.error('[openagenda] Fatale fout:', err.message);
    errors.push(err.message);
  }

  await writeLog();
  console.log(`[openagenda] Klaar: ${added} nieuw, ${updated} bijgewerkt, ${errors.length} fouten`);
};
