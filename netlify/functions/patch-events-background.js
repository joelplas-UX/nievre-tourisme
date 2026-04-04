/**
 * patch-events-background.js
 * Herstelt bestaande events in Firestore die ontbrekende of incorrecte velden hebben:
 *
 *  1. culture_nevers events zonder datum → herhaalt detailpagina-parse
 *  2. Alle events met Frans/Engels type → mapt naar NL types
 *  3. FAS events zonder afbeelding → haalt Wikipedia-foto op
 *
 * Handmatig te triggeren via Admin (x-admin-trigger: 1).
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

const HEADERS_HTML = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9',
};

// ── Type normalisatie ─────────────────────────────────────────
const TYPE_MAP = {
  concert: 'muziek', musique: 'muziek', music: 'muziek',
  spectacle: 'cultuur', theatre: 'cultuur',
  exposition: 'cultuur', culture: 'cultuur',
  'marche': 'markt', foire: 'markt', brocante: 'markt', 'vide-grenier': 'markt',
  festival: 'festival', sport: 'sport',
  balade: 'natuur', rando: 'natuur', nature: 'natuur',
  autre: 'overig', other: 'overig',
};
const VALID_TYPES = new Set(['festival','muziek','markt','sport','natuur','cultuur','overig']);

function normalizeType(type) {
  if (!type) return null;
  const t = type.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (VALID_TYPES.has(t)) return null; // al geldig, geen update nodig
  return TYPE_MAP[t] || 'overig';
}

// ── Datumparser voor culture.nevers (zelfde als scraper) ──────
const FR_MONTHS_MAP = {
  janvier:1, fevrier:2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, aout:8, septembre:9, octobre:10, novembre:11, decembre:12,
};
const MONTH_PAT = 'janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre';

function normalizeMonth(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseDateFromHtml(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ');
  let day = null, month = null, year = null, timeStart = null, timeEnd = null;

  const mA = text.match(new RegExp(`(?:le\\s+)?(\\d{1,2})\\s+(${MONTH_PAT})\\s+(\\d{4})`, 'i'));
  if (mA) {
    day   = parseInt(mA[1]);
    month = FR_MONTHS_MAP[normalizeMonth(mA[2])];
    year  = parseInt(mA[3]);
  }
  if (!day) {
    const mB = text.match(new RegExp(`(${MONTH_PAT})\\s+(\\d{4})`, 'i'));
    if (mB) {
      month = FR_MONTHS_MAP[normalizeMonth(mB[1])];
      year  = parseInt(mB[2]);
      const start  = Math.max(0, mB.index - 40);
      const window = text.slice(start, mB.index + mB[0].length + 40);
      const mDay   = window.match(/\b([1-9]|[12]\d|3[01])\b/);
      if (mDay) day = parseInt(mDay[1]);
    }
  }
  if (!day || !month || !year) return null;

  const mT = text.match(/(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/);
  if (mT) { timeStart = mT[1]; timeEnd = mT[2]; }
  return { dateObj: new Date(year, month - 1, day), timeStart, timeEnd };
}

// ── Wikipedia-foto ────────────────────────────────────────────
async function getVillagePhoto(cityName) {
  if (!cityName) return null;
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cityName)}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
      { headers: { 'User-Agent': 'NievreMorevan/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    return page?.thumbnail?.source || null;
  } catch { return null; }
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  if (event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Alleen via admin te triggeren' };
  }

  const log = [];
  let patchedDates = 0, patchedTypes = 0, patchedPhotos = 0, errors = 0;

  try {
    const snap = await db.collection('morvan').doc('data').collection('events').get();
    const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));
    log.push(`${docs.length} events gevonden`);

    for (const ev of docs) {
      const updates = {};

      // 1. Type normalisatie
      const newType = normalizeType(ev.type);
      if (newType) { updates.type = newType; patchedTypes++; }

      // 2. Culture Nevers: datum ontbreekt
      if (!ev.date && ev.source === 'culture_nevers' && ev.sourceUrl) {
        try {
          const res = await fetch(ev.sourceUrl, { headers: HEADERS_HTML });
          if (res.ok) {
            const html   = await res.text();
            const parsed = parseDateFromHtml(html);
            if (parsed?.dateObj) {
              updates.date      = Timestamp.fromDate(parsed.dateObj);
              updates.timeStart = parsed.timeStart || null;
              updates.timeEnd   = parsed.timeEnd   || null;
              patchedDates++;
            }
          }
        } catch (err) {
          errors++;
          log.push(`Datum-fetch fout ${ev.id}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 400));
      }

      // 3. FAS events: foto ontbreekt
      if (!ev.imageUrl && ev.source?.startsWith('fas_') && ev.city) {
        try {
          const photo = await getVillagePhoto(ev.city);
          if (photo) {
            updates.imageUrl    = photo;
            updates.imageSource = 'wikipedia_village';
            patchedPhotos++;
          }
        } catch { errors++; }
        await new Promise(r => setTimeout(r, 300));
      }

      if (Object.keys(updates).length) {
        updates.updatedAt = Timestamp.now();
        await ev.ref.update(updates);
      }
    }

    log.push(`Klaar: ${patchedDates} datums, ${patchedTypes} types, ${patchedPhotos} foto's gepatcht, ${errors} fouten`);
    return { statusCode: 200, body: JSON.stringify({ patchedDates, patchedTypes, patchedPhotos, errors, log }) };

  } catch (err) {
    console.error('[patch-events]', err.message);
    return { statusCode: 500, body: err.message };
  }
};
