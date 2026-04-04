/**
 * sync-koikispass-background.js
 * Scrapt de evenementenagenda op koikispass.com/lagenda/
 *
 * Strategie:
 *  1. Haal listing pages op (/lagenda/?period=toutes_les_dates&page=N, max 5 pages)
 *  2. Extraheer event-URLs: /lagenda/{id}/{slug}/
 *  3. Sla over als ID al verwerkt is (koiki_processed collectie)
 *  4. Fetch detail page per event — parse datum, locatie, prijs, foto
 *  5. Filter: alleen events met postcode 58xxx (Nièvre)
 *  6. Claude Haiku: vertaal titel+beschrijving naar EN/NL, classificeer type
 *  7. Sla op in Firestore morvan/data/events met ID koiki_{id}
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ── Firebase init ──────────────────────────────────────────────
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const BASE        = 'https://www.koikispass.com';
const LISTING_URL = `${BASE}/lagenda/`;
const MAX_PAGES   = 5;
const MAX_EVENTS  = 30; // veiligheidsgrens per run

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Referer': 'https://www.google.com/',
};

// ── Stap 1: Extraheer event-URLs van listing pages ─────────────
async function findEventUrls() {
  const found = new Map(); // id → fullUrl

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${LISTING_URL}?period=toutes_les_dates&page=${page}/`;
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS });
      if (!res.ok) break;
      const html = await res.text();

      // Patroon: /lagenda/12345/slug-van-het-event/
      const regex = /href="(\/lagenda\/(\d+)\/[^"]+\/)"/gi;
      let match;
      let newOnPage = 0;
      while ((match = regex.exec(html)) !== null) {
        const [, path, id] = match;
        if (!found.has(id)) {
          found.set(id, BASE + path);
          newOnPage++;
        }
      }

      // Geen nieuwe events → stop met pagineren
      if (newOnPage === 0) break;
    } catch {
      break;
    }

    // Korte pauze tussen pagina's
    await new Promise(r => setTimeout(r, 500));
  }

  return [...found.entries()].map(([id, url]) => ({ id, url }));
}

// ── Stap 2: Haal detail page op ───────────────────────────────
async function fetchDetail(url) {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ── Stap 3: Parse detail page HTML ────────────────────────────
function parseDetail(html) {
  // Strip scripts/styles, zet over naar platte tekst
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Postcode — filter op Nièvre (58xxx)
  const postcodeMatch = clean.match(/\b(58\d{3})\b/);
  const postcode = postcodeMatch ? postcodeMatch[1] : null;

  // Stad (woord(en) na postcode)
  let city = null;
  if (postcode) {
    const cityMatch = clean.match(new RegExp(`${postcode}\\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ\\s-]{2,30}?)(?:\\s{2,}|$)`));
    city = cityMatch ? cityMatch[1].trim() : null;
  }

  // Datum + tijd: "4 avril 2026 à 20h30"
  const FR_MONTHS = {
    janvier:1, février:2, mars:3, avril:4, mai:5, juin:6,
    juillet:7, août:8, septembre:9, octobre:10, novembre:11, décembre:12,
  };
  let dateObj = null;
  let timeStart = null;
  const dateMatch = clean.match(
    /(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})(?:\s+[àa]\s+(\d{1,2})h(\d{2}))?/i
  );
  if (dateMatch) {
    const day   = parseInt(dateMatch[1]);
    const month = FR_MONTHS[dateMatch[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace('fevrier','février').replace('aout','août').replace('decembre','décembre')] ||
      Object.entries(FR_MONTHS).find(([k]) => k.startsWith(dateMatch[2].toLowerCase().slice(0,4)))?.[1];
    const year  = parseInt(dateMatch[3]);
    const hour  = dateMatch[4] != null ? parseInt(dateMatch[4]) : null;
    const min   = dateMatch[5] != null ? parseInt(dateMatch[5]) : 0;
    if (month) {
      dateObj = new Date(year, month - 1, day, hour ?? 0, min);
      if (hour !== null) {
        timeStart = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
      }
    }
  }

  // Prijs: "37,00 € à 49,00 €" of "Gratuit"
  let price = null;
  if (/gratuit/i.test(clean)) {
    price = 'Gratuit';
  } else {
    const priceMatch = clean.match(/(\d+[,.]\d{2})\s*€(?:\s*[àa]\s*(\d+[,.]\d{2})\s*€)?/);
    if (priceMatch) {
      price = priceMatch[2]
        ? `${priceMatch[1].replace(',','.')} € – ${priceMatch[2].replace(',','.')} €`
        : `${priceMatch[1].replace(',','.')} €`;
    }
  }

  // Afbeelding van agenda.koikispass.com
  const imgMatch = html.match(/src="(https?:\/\/agenda\.koikispass\.com\/[^"]+\.(jpg|jpeg|png|webp))"/i);
  const imageUrl = imgMatch ? imgMatch[1] : null;

  // Titel: eerste grote heading (h1)
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleFr = titleMatch
    ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
    : null;

  // Beschrijving: eerste alinea na strip (ruwe benadering)
  const descLines = clean.split(/\.(?:\s{2,}|\n)/).filter(l => l.length > 40).slice(0, 3);
  const descFr = descLines.join('. ').slice(0, 400) || null;

  return { postcode, city, dateObj, timeStart, price, imageUrl, titleFr, descFr, cleanText: clean };
}

// ── Stap 4: Claude → vertaling + type ─────────────────────────
async function translateAndClassify(titleFr, descFr) {
  if (!titleFr) return { titleEn: null, titleNl: null, descEn: null, descNl: null, type: 'overig' };

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Vertaal de volgende tekst van een Frans evenement en classificeer het type.

Titel (FR): ${titleFr}
Beschrijving (FR): ${descFr || ''}

Geef ALLEEN dit JSON terug:
{
  "title_en": "Engelse vertaling van de titel",
  "title_nl": "Nederlandse vertaling van de titel",
  "desc_en": "Korte Engelse beschrijving (max 200 tekens)",
  "desc_nl": "Korte Nederlandse beschrijving (max 200 tekens)",
  "type": "festival|concert|spectacle|sport|exposition|balade|foire|marche|vide-grenier|autre"
}`,
    }],
  });

  try {
    const raw = msg.content[0].text.trim();
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}') + 1;
    const obj   = JSON.parse(raw.slice(start, end));
    return {
      titleEn: obj.title_en || titleFr,
      titleNl: obj.title_nl || titleFr,
      descEn:  obj.desc_en  || null,
      descNl:  obj.desc_nl  || null,
      type:    obj.type     || 'autre',
    };
  } catch {
    return { titleEn: titleFr, titleNl: titleFr, descEn: null, descNl: null, type: 'autre' };
  }
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  // Token-beveiliging
  const token     = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  let saved = 0, skipped = 0, filtered = 0, errors = 0;
  const log = [];

  try {
    // 1. Zoek event-URLs op listing pages
    log.push('Listing pages ophalen…');
    const allEvents = await findEventUrls();
    log.push(`${allEvents.length} event-URL(s) gevonden`);

    // 2. Welke zijn al verwerkt?
    const processedSnap = await db
      .collection('morvan').doc('data').collection('koiki_processed').get();
    const processed = new Set(processedSnap.docs.map(d => d.id));

    // Datum-grenzen: max 7 dagen geleden t/m 90 dagen vooruit
    const now     = new Date();
    const minDate = new Date(now); minDate.setDate(minDate.getDate() - 7);
    const maxDate = new Date(now); maxDate.setDate(maxDate.getDate() + 90);

    let count = 0;
    for (const { id, url } of allEvents) {
      if (count >= MAX_EVENTS) break;

      if (processed.has(id)) {
        skipped++;
        continue;
      }

      try {
        // 3. Fetch + parse detail page
        const html   = await fetchDetail(url);
        const detail = parseDetail(html);

        // 4. Filter: alleen Nièvre (58xxx)
        if (!detail.postcode) {
          // Geen postcode gevonden — overslaan (kan ook buiten Nièvre zijn)
          await db.collection('morvan').doc('data').collection('koiki_processed')
            .doc(id).set({ url, reason: 'no_postcode', processedAt: Timestamp.now() });
          filtered++;
          continue;
        }
        if (!detail.postcode.startsWith('58')) {
          await db.collection('morvan').doc('data').collection('koiki_processed')
            .doc(id).set({ url, reason: 'outside_nievre', postcode: detail.postcode, processedAt: Timestamp.now() });
          filtered++;
          continue;
        }

        // 5. Datumcontrole
        if (detail.dateObj) {
          if (detail.dateObj < minDate || detail.dateObj > maxDate) {
            await db.collection('morvan').doc('data').collection('koiki_processed')
              .doc(id).set({ url, reason: 'date_out_of_range', processedAt: Timestamp.now() });
            filtered++;
            continue;
          }
        }

        // 6. Claude: vertaal + classificeer
        const translation = await translateAndClassify(detail.titleFr, detail.descFr);

        // 7. Sla op in Firestore
        const docId  = `koiki_${id}`;
        const docRef = db.collection('morvan').doc('data').collection('events').doc(docId);
        const existing = await docRef.get();
        if (!existing.exists) {
          await docRef.set({
            title: {
              fr: detail.titleFr || '',
              en: translation.titleEn || detail.titleFr || '',
              nl: translation.titleNl || detail.titleFr || '',
            },
            description: {
              fr: detail.descFr || null,
              en: translation.descEn || null,
              nl: translation.descNl || null,
            },
            city:      detail.city || null,
            location:  detail.city || null,
            date:      detail.dateObj ? Timestamp.fromDate(detail.dateObj) : null,
            timeStart: detail.timeStart || null,
            timeEnd:   null,
            type:      translation.type || 'autre',
            price:     detail.price || null,
            imageUrl:  detail.imageUrl || null,
            sourceUrl: url,
            source:    'koikispass',
            hidden:    false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          saved++;
          count++;
        }

        // Markeer als verwerkt
        await db.collection('morvan').doc('data').collection('koiki_processed')
          .doc(id).set({ url, processedAt: Timestamp.now() });

      } catch (err) {
        log.push(`Fout bij event ${id}: ${err.message}`);
        errors++;
      }

      // Pauze tussen events
      await new Promise(r => setTimeout(r, 1000));
    }

    log.push(`Klaar: ${saved} opgeslagen, ${skipped} al verwerkt, ${filtered} buiten Nièvre/datum, ${errors} fouten`);
    await runRef.set({
      source: 'koikispass',
      savedCount: saved,
      skippedCount: skipped,
      filteredCount: filtered,
      errorCount: errors,
      log,
      createdAt: Timestamp.now(),
    });

    return { statusCode: 200, body: JSON.stringify({ saved, skipped, filtered, errors }) };

  } catch (err) {
    console.error('[sync-koikispass]', err.message);
    await runRef.set({ source: 'koikispass', error: err.message, log, createdAt: Timestamp.now() }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
