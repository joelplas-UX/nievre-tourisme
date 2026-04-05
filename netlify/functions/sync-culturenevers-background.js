/**
 * sync-culturenevers-background.js
 * Scrapt evenementen van culture.nevers.fr via WordPress REST API.
 *
 * Strategie:
 *  1. Haal event-lijst op via /wp-json/wp/v2/evenement (custom post type)
 *  2. Per event: fetch detailpagina en parse datum/tijd uit HTML
 *  3. Haal locatienaam op via evenement-lieu taxonomie
 *  4. Sla op in Firestore — enrich-functie vertaalt later naar EN/NL
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

const BASE    = 'https://culture.nevers.fr';
const API     = `${BASE}/wp-json/wp/v2`;
const HEADERS = { 'User-Agent': 'NievreMorevan/1.0 (nievremorvan.com)', 'Accept': 'application/json' };
const MAX_EVENTS = 40;

const FR_MONTHS_MAP = {
  janvier:1, fevrier:2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, aout:8, septembre:9, octobre:10, novembre:11, decembre:12,
};
const MONTH_PAT = 'janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre';

function normalizeMonth(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ── HTML entities decoderen ───────────────────────────────────
function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&rsquo;/gi, '\u2019').replace(/&lsquo;/gi, '\u2018')
    .replace(/&rdquo;/gi, '\u201d').replace(/&ldquo;/gi, '\u201c')
    .replace(/&ndash;/gi, '\u2013').replace(/&mdash;/gi, '\u2014')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g,    (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// ── Type classificatie op basis van titelwoorden ─────────────
function classifyType(title = '') {
  const text = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/festival/.test(text)) return 'festival';
  if (/concert|musique|live|chanson|jazz|rock|classique|orchestre|chorale|groupe|chanteur/.test(text)) return 'muziek';
  if (/marche|brocante|vide.?grenier|foire|salon|braderie|artisanat/.test(text)) return 'markt';
  if (/rando|randonnee|balade|trail|course|velo|sport|athletisme/.test(text)) return 'sport';
  if (/nature|foret|jardin|botanique|faune|flore/.test(text)) return 'natuur';
  if (/exposition|musee|patrimoine|theatre|cinema|spectacle|danse|cirque|lecture|conference|animation|arts?/.test(text)) return 'cultuur';
  return 'overig';
}

// ── Parse datum uit HTML van culture.nevers.fr ────────────────
// De datum is gesplitst over aparte HTML-elementen:
//   "Avril 2026"  (maand+jaar in één element)
//   "Mercredi 22" (weekdag+dag in ander element)
//   "14:00 - 18:00" (tijd in li)
// Na stripping: "... Avril 2026 Mercredi 22 14:00 - 18:00 ..."
function parseDateFromHtml(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ');

  let day = null, month = null, year = null, timeStart = null, timeEnd = null;

  // Patroon A: "le 22 Avril 2026" of "22 Avril 2026"
  const mA = text.match(new RegExp(`(?:le\\s+)?(\\d{1,2})\\s+(${MONTH_PAT})\\s+(\\d{4})`, 'i'));
  if (mA) {
    day   = parseInt(mA[1]);
    month = FR_MONTHS_MAP[normalizeMonth(mA[2])];
    year  = parseInt(mA[3]);
  }

  // Patroon B: "Avril 2026" gevolgd (binnen 40 tekens) door dagcijfer
  if (!day) {
    const mB = text.match(new RegExp(`(${MONTH_PAT})\\s+(\\d{4})`, 'i'));
    if (mB) {
      month = FR_MONTHS_MAP[normalizeMonth(mB[1])];
      year  = parseInt(mB[2]);
      // Zoek dagcijfer (1-31) vlak voor of na de maand (window van 40 tekens)
      const start  = Math.max(0, mB.index - 40);
      const window = text.slice(start, mB.index + mB[0].length + 40);
      const mDay   = window.match(/\b([1-9]|[12]\d|3[01])\b/);
      if (mDay) day = parseInt(mDay[1]);
    }
  }

  // Patroon C: "22 avril" zonder jaar — gebruik huidig/volgend jaar
  if (!day) {
    const mC = text.match(new RegExp(`(\\d{1,2})\\s+(${MONTH_PAT})`, 'i'));
    if (mC) {
      day   = parseInt(mC[1]);
      month = FR_MONTHS_MAP[normalizeMonth(mC[2])];
      year  = new Date().getFullYear();
    }
  }

  if (!day || !month || !year) return { dateObj: null, timeStart: null, timeEnd: null };

  // Tijdstip: "14:00 - 18:00" of "14:00-18:00"
  const mT = text.match(/(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})/);
  if (mT) { timeStart = mT[1]; timeEnd = mT[2]; }
  else {
    const mT2 = text.match(/(\d{1,2})h(\d{2})/);
    if (mT2) timeStart = `${String(parseInt(mT2[1])).padStart(2,'0')}:${mT2[2]}`;
  }

  return { dateObj: new Date(year, month - 1, day), timeStart, timeEnd };
}

// ── Haal locatienaam op via taxonomie-ID ─────────────────────
const lieuxCache = {};
async function getLieuName(id) {
  if (!id) return null;
  if (lieuxCache[id]) return lieuxCache[id];
  try {
    const res = await fetch(`${API}/evenement-lieu/${id}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    lieuxCache[id] = data.name || null;
    return lieuxCache[id];
  } catch { return null; }
}

// ── Fetch event detailpagina en parse datum ───────────────────
async function fetchEventDetail(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': HEADERS['User-Agent'], 'Accept': 'text/html' } });
    if (!res.ok) return { dateObj: null, timeStart: null, timeEnd: null };
    const html = await res.text();
    return parseDateFromHtml(html);
  } catch {
    return { dateObj: null, timeStart: null, timeEnd: null };
  }
}

// ── Haal afbeelding op via media-endpoint ─────────────────────
async function fetchImage(mediaId) {
  if (!mediaId) return null;
  try {
    const res = await fetch(`${API}/media/${mediaId}?_fields=source_url,media_details`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    return data.media_details?.sizes?.medium_large?.source_url
      || data.media_details?.sizes?.large?.source_url
      || data.source_url || null;
  } catch { return null; }
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  const token     = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  let saved = 0, skipped = 0, errors = 0;
  const log = [];

  try {
    const eventsCol = db.collection('morvan').doc('data').collection('events');
    const now     = new Date();
    const minDate = new Date(now); minDate.setDate(now.getDate() - 7);
    const maxDate = new Date(now); maxDate.setDate(now.getDate() + 90);

    let page = 1, count = 0;

    while (count < MAX_EVENTS) {
      const url = `${API}/evenement?per_page=50&page=${page}&status=publish&_fields=id,title,link,featured_media,evenement-lieu`;
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) { log.push(`API pagina ${page} fout: ${res.status}`); break; }
      const items = await res.json();
      if (!items.length) break;

      log.push(`Pagina ${page}: ${items.length} events`);

      for (const item of items) {
        if (count >= MAX_EVENTS) break;

        const docId  = `culturenevers_${item.id}`;
        const docRef = eventsCol.doc(docId);
        const snap   = await docRef.get();
        if (snap.exists) { skipped++; continue; }

        try {
          // Detailpagina voor datum
          const { dateObj, timeStart, timeEnd } = await fetchEventDetail(item.link);

          // Datumcontrole
          if (dateObj && (dateObj < minDate || dateObj > maxDate)) { skipped++; continue; }

          // Locatie
          const lieuId = item['evenement-lieu']?.[0];
          const lieu   = await getLieuName(lieuId);

          // Afbeelding
          const imageUrl = await fetchImage(item.featured_media);

          const titleFr = decodeHtmlEntities(item.title?.rendered || '');
          await docRef.set({
            title:       { fr: titleFr, en: null, nl: null },
            description: { fr: null, en: null, nl: null },
            city:        'Nevers',
            location:    lieu || 'Nevers',
            date:        dateObj ? Timestamp.fromDate(dateObj) : null,
            timeStart:   timeStart || null,
            timeEnd:     timeEnd   || null,
            type:        classifyType(titleFr),
            price:       null,
            imageUrl:    imageUrl || null,
            sourceUrl:   item.link,
            source:      'culture_nevers',
            hidden:      false,
            createdAt:   Timestamp.now(),
            updatedAt:   Timestamp.now(),
          });

          saved++;
          count++;
        } catch (err) {
          log.push(`Fout bij event ${item.id}: ${err.message}`);
          errors++;
        }

        await new Promise(r => setTimeout(r, 500));
      }

      page++;
    }

    log.push(`Klaar: ${saved} opgeslagen, ${skipped} overgeslagen, ${errors} fouten`);
    await runRef.set({ source: 'culture_nevers', savedCount: saved, skippedCount: skipped, errorCount: errors, log, createdAt: Timestamp.now() });
    return { statusCode: 200, body: JSON.stringify({ saved, skipped, errors }) };

  } catch (err) {
    console.error('[sync-culturenevers]', err.message);
    await runRef.set({ source: 'culture_nevers', error: err.message, log, createdAt: Timestamp.now() }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
