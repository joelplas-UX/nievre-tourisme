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

const FR_MONTHS = {
  janvier:1, février:2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, août:8, septembre:9, octobre:10, novembre:11, décembre:12,
};

// ── Parse datum uit HTML: "Mercredi 22 — Avril 2026 — 14:00-18:00" ─
function parseDateFromHtml(html) {
  // Verwijder tags
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ');

  // Patroon: dag — Maand Jaar — HH:MM(-HH:MM)?
  const m = text.match(
    /(\d{1,2})\s*[—–-]\s*(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})(?:\s*[—–-]\s*(\d{2}:\d{2})(?:\s*-\s*(\d{2}:\d{2}))?)?/i
  );
  if (!m) {
    // Alternatief: "22 Avril 2026 à 14h00"
    const m2 = text.match(
      /(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})(?:\s+[àa]\s+(\d{1,2})h(\d{2}))?/i
    );
    if (!m2) return { dateObj: null, timeStart: null, timeEnd: null };
    const day   = parseInt(m2[1]);
    const month = FR_MONTHS[m2[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || null;
    const year  = parseInt(m2[3]);
    const hour  = m2[4] != null ? parseInt(m2[4]) : null;
    const min   = m2[5] != null ? parseInt(m2[5]) : 0;
    if (!month) return { dateObj: null, timeStart: null, timeEnd: null };
    return {
      dateObj:   new Date(year, month - 1, day, hour ?? 0, min),
      timeStart: hour !== null ? `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}` : null,
      timeEnd:   null,
    };
  }

  const day   = parseInt(m[1]);
  const month = FR_MONTHS[m[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || null;
  const year  = parseInt(m[3]);
  if (!month) return { dateObj: null, timeStart: null, timeEnd: null };
  return {
    dateObj:   new Date(year, month - 1, day),
    timeStart: m[4] || null,
    timeEnd:   m[5] || null,
  };
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

          await docRef.set({
            title:       { fr: item.title?.rendered || '', en: null, nl: null },
            description: { fr: null, en: null, nl: null },
            city:        'Nevers',
            location:    lieu || 'Nevers',
            date:        dateObj ? Timestamp.fromDate(dateObj) : null,
            timeStart:   timeStart || null,
            timeEnd:     timeEnd   || null,
            type:        'overig',
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
