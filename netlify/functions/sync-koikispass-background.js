/**
 * sync-koikispass-background.js
 * Scrapt de evenementenagenda op koikispass.com/lagenda/
 *
 * Verbeterde strategie (v2):
 *  1. Haal listing pages op — detecteer max. paginanummer dynamisch
 *  2. Parse per event-card op de listing: ID, URL, commune-code, titel,
 *     stad, datum, afbeelding, categorie, korte beschrijving
 *  3. Filter op commune-58xxx (Nièvre) — betrouwbaarder dan postcode in detail
 *  4. Sla over als ID al verwerkt is (koiki_processed collectie)
 *  5. Fetch detail page per nieuw Nièvre-event — pak beschrijving, tijd, prijs
 *  6. Claude Haiku: vertaal titel+beschrijving naar EN/NL, verfijn type
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
const MAX_PAGES   = 25;   // site heeft ~18 pagina's, ruim genoeg
const MAX_EVENTS  = 100;  // max nieuwe events per run

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Referer': 'https://www.koikispass.com/',
};

const FR_MONTHS = {
  janvier:1, 'f\u00e9vrier':2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, 'ao\u00fbt':8, septembre:9, octobre:10, novembre:11, 'd\u00e9cembre':12,
};

// ── Datum parsen uit "mercredi 29 avril 2026" of "29 avril 2026 à 20h30" ──
function parseFrenchDate(raw) {
  if (!raw) return null;
  const m = raw.match(
    /(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})(?:.*?(\d{1,2})h(\d{2}))?/i
  );
  if (!m) return null;

  const day   = parseInt(m[1]);
  const year  = parseInt(m[3]);
  const hour  = m[4] != null ? parseInt(m[4]) : 0;
  const min   = m[5] != null ? parseInt(m[5]) : 0;

  // Maandnaam normaliseren (diacrieten verwijderen)
  const normalized = m[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const month = FR_MONTHS[m[2].toLowerCase()] ||
    Object.entries(FR_MONTHS).find(([k]) =>
      k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(normalized.slice(0, 4))
    )?.[1];

  if (!month) return null;

  const timeStart = m[4] != null
    ? `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`
    : null;

  return { dateObj: new Date(year, month - 1, day, hour, min), timeStart };
}

// ── Koikispass categorie-slug → ons type-systeem ─────────────
function mapCategory(slug) {
  if (!slug) return 'overig';
  const s = slug.toLowerCase();
  if (s.includes('concert') || s.includes('musique'))    return 'muziek';
  if (s.includes('festival') || s.includes('fete'))      return 'festival';
  if (s.includes('brocante') || s.includes('marche') || s.includes('vide')) return 'markt';
  if (s.includes('randonnee') || s.includes('sport') || s.includes('trail')) return 'sport';
  if (s.includes('nature') || s.includes('plein-air'))   return 'natuur';
  if (s.includes('exposition') || s.includes('spectacle') ||
      s.includes('theatre') || s.includes('cinema') ||
      s.includes('patrimoine') || s.includes('danse'))   return 'cultuur';
  return 'overig';
}

// ── Detecteer het laatste paginanummer ────────────────────────
function detectMaxPage(html) {
  // Zoek de "laatste pagina"-link: ...page=18">>&gt;&gt;</a>
  const lastMatch = html.match(/[?&]page=(\d+)[^"]*"[^>]*>(?:&gt;&gt;|>>|››|Dernière)/i);
  if (lastMatch) return parseInt(lastMatch[1]);

  // Fallback: hoogste paginanummer in pagination-blok
  const pageNums = [...html.matchAll(/[?&]page=(\d+)/gi)].map(m => parseInt(m[1]));
  return pageNums.length ? Math.max(...pageNums) : 5;
}

// ── Parse event-cards van een listing-pagina ──────────────────
function decodeEntities(str) {
  return (str || '')
    .replace(/&agrave;/gi,'à').replace(/&eacute;/gi,'é').replace(/&egrave;/gi,'è')
    .replace(/&ecirc;/gi,'ê').replace(/&euml;/gi,'ë').replace(/&ocirc;/gi,'ô')
    .replace(/&ucirc;/gi,'û').replace(/&ugrave;/gi,'ù').replace(/&ccedil;/gi,'ç')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;/gi,"'")
    .replace(/&nbsp;/gi,' ').replace(/&rsquo;/gi,'\u2019').replace(/&ndash;/gi,'\u2013')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function parseListingPage(html) {
  const events = [];

  // Split op het begin van elke card — robuuster dan een sluit-tag regex
  // (de kaarten eindigen op <a class="big"> gevolgd door </div>, geen 3× </div> op rij)
  const parts = html.split('<div class="bloc-agenda');

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];

    // Commune-code (commune-58086 etc.) — gebruikt voor Nièvre-filter
    const communeMatch = chunk.match(/commune-(\d{5})/);
    const communeCode  = communeMatch ? communeMatch[1] : null;

    // Event-URL + numeriek ID — URL is volledig (https://www.koikispass.com/lagenda/...)
    const urlMatch = chunk.match(/href="(https?:\/\/www\.koikispass\.com\/lagenda\/(\d+)\/[^"]+\/)"/);
    if (!urlMatch) continue;
    const url = urlMatch[1];
    const id  = urlMatch[2];

    // Titel (from .titre-agenda)
    const titleMatch = chunk.match(/class="titre-agenda"[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
    const titleFr = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;
    if (!titleFr) continue;

    // Stad (from .ville-agenda)
    const cityMatch = chunk.match(/class="ville-agenda"[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
    const city = cityMatch ? cityMatch[1].trim() : null;

    // Datum ("mercredi<span> 29 </span>avril 2026")
    const dateHtml = (chunk.match(/class="date-evenement"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    const dateRaw  = dateHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const dateParsed = parseFrenchDate(dateRaw);

    // Afbeelding — listing gebruikt src= (niet data-lazy-src)
    const imgMatch = chunk.match(/src="(https?:\/\/agenda\.koikispass\.com\/[^"]+\.(?:jpg|jpeg|png|webp))[^"]*"/i);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    // Categorie-slug (voor type-mapping)
    const catMatch = chunk.match(/\/lagenda\/categorie\/([^/"]+)\//);
    const categorySlug = catMatch ? catMatch[1] : null;

    // Korte beschrijving — HTML entities decoderen
    const descHtml = (chunk.match(/class="texte-agenda"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
    const descFr   = decodeEntities(
      descHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    ).slice(0, 400) || null;

    events.push({
      id, url, communeCode, titleFr, city,
      dateObj:   dateParsed?.dateObj   || null,
      timeStart: dateParsed?.timeStart || null,
      imageUrl, categorySlug, descFr,
    });
  }

  return events;
}

// ── Haal extra detail (beschrijving, prijs, tijd) van detail page ──
async function fetchDetailExtras(url) {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) return {};
    const html = await res.text();

    const clean = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Prijs
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

    // Langere beschrijving (alinea's van >60 tekens)
    const descLines = clean.split(/\.(?:\s{2,}|\n)/).filter(l => l.trim().length > 60).slice(0, 4);
    const fullDesc  = descLines.join('. ').slice(0, 600) || null;

    // Tijd (als niet al op listing)
    const timeMatch = clean.match(/\b(\d{1,2})h(\d{2})\b/);
    const timeStart = timeMatch
      ? `${String(parseInt(timeMatch[1])).padStart(2,'0')}:${timeMatch[2]}`
      : null;

    return { price, fullDesc, timeStart };
  } catch {
    return {};
  }
}

// ── Claude: vertaal + verfijn type ────────────────────────────
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

Geef ALLEEN dit JSON terug (geen uitleg):
{
  "title_en": "Engelse vertaling",
  "title_nl": "Nederlandse vertaling",
  "desc_en": "Korte Engelse beschrijving (max 200 tekens)",
  "desc_nl": "Korte Nederlandse beschrijving (max 200 tekens)",
  "type": "festival|muziek|markt|sport|natuur|cultuur|overig"
}`,
    }],
  });

  try {
    const raw   = msg.content[0].text.trim();
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}') + 1;
    const obj   = JSON.parse(raw.slice(start, end));
    return {
      titleEn: obj.title_en || titleFr,
      titleNl: obj.title_nl || titleFr,
      descEn:  obj.desc_en  || null,
      descNl:  obj.desc_nl  || null,
      type:    obj.type     || 'overig',
    };
  } catch {
    return { titleEn: titleFr, titleNl: titleFr, descEn: null, descNl: null, type: 'overig' };
  }
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  const token     = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  let saved = 0, skipped = 0, filteredDept = 0, filteredDate = 0, errors = 0;
  const log = [];

  // Datum-grenzen: 7 dagen geleden t/m 120 dagen vooruit
  const now     = new Date();
  const minDate = new Date(now); minDate.setDate(minDate.getDate() - 7);
  const maxDate = new Date(now); maxDate.setDate(maxDate.getDate() + 120);

  try {
    // ── Stap 1: Haal al verwerkte IDs op ──────────────────────
    const processedSnap = await db
      .collection('morvan').doc('data').collection('koiki_processed').get();
    const processed = new Set(processedSnap.docs.map(d => d.id));
    log.push(`${processed.size} events al verwerkt`);

    // ── Stap 2: Listing pages scrapen ─────────────────────────
    let maxPage = MAX_PAGES;
    const allListingEvents = [];

    for (let page = 1; page <= maxPage; page++) {
      const url = `${LISTING_URL}?period=toutes_les_dates&page=${page}`;
      try {
        const res = await fetch(url, { headers: FETCH_HEADERS });
        if (!res.ok) { log.push(`Listing p${page}: HTTP ${res.status}`); break; }
        const html = await res.text();

        // Detecteer max paginanummer op de eerste pagina
        if (page === 1) {
          maxPage = Math.min(detectMaxPage(html), MAX_PAGES);
          log.push(`Totaal ${maxPage} listing-pagina's gedetecteerd`);
        }

        const pageEvents = parseListingPage(html);
        log.push(`Pagina ${page}: ${pageEvents.length} cards gevonden`);

        // Voeg toe, sla al-verwerkte over
        for (const ev of pageEvents) {
          if (!processed.has(ev.id)) {
            allListingEvents.push(ev);
          }
        }

        // Geen nieuwe events meer op deze pagina → stop pagineren
        if (pageEvents.length === 0) break;

      } catch (err) {
        log.push(`Listing p${page} fout: ${err.message}`);
        break;
      }

      await new Promise(r => setTimeout(r, 400));
    }

    log.push(`${allListingEvents.length} nieuwe (nog niet verwerkte) events gevonden`);

    // ── Stap 3: Filter + verwerk nieuwe events ─────────────────
    let count = 0;

    for (const ev of allListingEvents) {
      if (count >= MAX_EVENTS) {
        log.push(`MAX_EVENTS (${MAX_EVENTS}) bereikt — volgende run pakt de rest`);
        break;
      }

      // Filter 1: département Nièvre (commune-58xxx)
      if (!ev.communeCode || !ev.communeCode.startsWith('58')) {
        filteredDept++;
        // Niet markeren als processed — volgende run pakt ze opnieuw op (snel te filteren)
        continue;
      }

      // Filter 2: datum
      if (ev.dateObj) {
        if (ev.dateObj < minDate || ev.dateObj > maxDate) {
          filteredDate++;
          await db.collection('morvan').doc('data').collection('koiki_processed')
            .doc(ev.id).set({ url: ev.url, reason: 'date_out_of_range', processedAt: Timestamp.now() });
          continue;
        }
      }

      try {
        // Stap 4: Detail page voor beschrijving, prijs en tijd
        const detail = await fetchDetailExtras(ev.url);

        // Gebruik langste beschrijving
        const descFr = (detail.fullDesc && detail.fullDesc.length > (ev.descFr?.length || 0))
          ? detail.fullDesc
          : ev.descFr;

        const timeStart = ev.timeStart || detail.timeStart || null;

        // Stap 5: Claude — vertaal + classificeer
        const translation = await translateAndClassify(ev.titleFr, descFr);

        // Type: Claude verfijnt, listing-categorie als fallback
        const type = translation.type !== 'overig'
          ? translation.type
          : mapCategory(ev.categorySlug);

        // Stap 6: Opslaan in Firestore
        const docId  = `koiki_${ev.id}`;
        const docRef = db.collection('morvan').doc('data').collection('events').doc(docId);
        const existing = await docRef.get();

        if (!existing.exists) {
          await docRef.set({
            title: {
              fr: ev.titleFr,
              en: translation.titleEn || ev.titleFr,
              nl: translation.titleNl || ev.titleFr,
            },
            description: {
              fr: descFr || null,
              en: translation.descEn || null,
              nl: translation.descNl || null,
            },
            city:      ev.city || null,
            location:  ev.city || null,
            date:      ev.dateObj ? Timestamp.fromDate(ev.dateObj) : null,
            timeStart,
            timeEnd:   null,
            type,
            price:     detail.price || null,
            imageUrl:  ev.imageUrl || null,
            sourceUrl: ev.url,
            source:    'koikispass',
            hidden:    false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          saved++;
          count++;
        } else {
          skipped++;
        }

        // Markeer als verwerkt
        await db.collection('morvan').doc('data').collection('koiki_processed')
          .doc(ev.id).set({ url: ev.url, processedAt: Timestamp.now() });

      } catch (err) {
        log.push(`Fout bij event ${ev.id}: ${err.message}`);
        errors++;
      }

      await new Promise(r => setTimeout(r, 800));
    }

    const summary = `Klaar: ${saved} opgeslagen, ${skipped} al in DB, ${filteredDept} buiten Nièvre, ${filteredDate} buiten datumrange, ${errors} fouten`;
    log.push(summary);

    await runRef.set({
      source: 'koikispass',
      savedCount: saved,
      skippedCount: skipped,
      filteredDeptCount: filteredDept,
      filteredDateCount: filteredDate,
      errorCount: errors,
      log,
      createdAt: Timestamp.now(),
    });

    return { statusCode: 200, body: JSON.stringify({ saved, skipped, filteredDept, filteredDate, errors }) };

  } catch (err) {
    console.error('[sync-koikispass]', err.message);
    await runRef.set({ source: 'koikispass', error: err.message, log, createdAt: Timestamp.now() }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
