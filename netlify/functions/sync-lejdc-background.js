/**
 * sync-lejdc-background.js
 * Scrapet dagelijks de "Que faire dans la Nièvre" artikelen van lejdc.fr.
 *
 * Strategie:
 *  1. Haal /loisirs/idees-de-sortie op met browser-headers (anti-bot bypass)
 *  2. Zoek links met "que-faire" + "nievre" in de URL
 *  3. Haal het artikel op, parse de HTML (dag → stad → beschrijving)
 *  4. Gebruik Claude Haiku om events te structureren
 *  5. Zoek Wikipedia-foto van het dorp als geen event-foto beschikbaar is
 *  6. Sla op in Firestore morvan/data/events met stable ID lejdc_{id}_{idx}
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

// ── Anthropic ──────────────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

// ── Browser headers om blokkering te omzeilen ─────────────────
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Referer': 'https://www.google.com/',
};

const BASE = 'https://www.lejdc.fr';
const LISTING_URL = `${BASE}/loisirs/idees-de-sortie`;

// ── Stap 1: Zoek recente "que faire" artikel-URLs ────────────
async function findQuefaireurls() {
  const res = await fetch(LISTING_URL, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Listing fetch fout: ${res.status}`);
  const html = await res.text();

  const found = new Map();
  let match;

  // Primaire regex: URLs met "que-faire" of "faire-dans-la-nievre"
  const regex = /href="(\/[^"]*(?:que-faire|faire-dans-la-nievre|que-faire-dans-la-nievre)[^"]*_(\d+)\/?[^"]*)"/gi;
  while ((match = regex.exec(html)) !== null) {
    const [, path, id] = match;
    const fullUrl = path.startsWith('http') ? path : BASE + path;
    if (!found.has(id)) found.set(id, fullUrl);
  }

  // Fallback: alle loisirs-links met hoog ID-nummer (> 14000000)
  if (found.size === 0) {
    const fallback = /href="(\/[^"]*\/loisirs\/[^"]*_(\d{8,})\/?[^"]*)"/gi;
    while ((match = fallback.exec(html)) !== null) {
      const [, path, id] = match;
      const fullUrl = path.startsWith('http') ? path : BASE + path;
      if (!found.has(id)) found.set(id, fullUrl);
    }
  }

  // Sorteer op ID (hoogste = meest recent) en pak de laatste 3
  return [...found.entries()]
    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    .slice(0, 3)
    .map(([id, url]) => ({ id, url }));
}

// ── Stap 2: Haal artikel op en extraheer ruwe HTML ────────────
async function fetchArticle(url) {
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Artikel fetch fout: ${res.status} — ${url}`);
  return res.text();
}

// ── Stap 3: Parse HTML naar blokken per dag/stad ─────────────
function parseArticleBlocks(html) {
  // Strip scripts en styles
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Vind gepubliceerde datum
  const dateMatch = html.match(/Publié le (\d{2}) ([a-zA-Zéû]+) (\d{4})/i);
  const publishedRaw = dateMatch ? dateMatch[0].replace('Publié le ', '') : null;

  return { text: clean, publishedRaw };
}

// ── Stap 4: Claude Haiku → gestructureerde events ────────────
async function extractEvents(text, publishedRaw, articleUrl) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Extraheer alle evenementen uit deze tekst van een Frans regionaal krantenartikel over de Nièvre.
Artikel gepubliceerd: ${publishedRaw || 'onbekend'}
Bron-URL: ${articleUrl}

Tekst:
${text.slice(0, 8000)}

Geef een JSON-array terug. Elk evenement heeft:
{
  "title": "kort beschrijvende titel",
  "description": "volledige beschrijving zoals in de tekst",
  "city": "naam van het dorp/de stad",
  "date": "YYYY-MM-DD of null als niet duidelijk",
  "dateText": "datum zoals in de tekst, bijv. 'Samedi 4 avril'",
  "timeStart": "HH:MM of null",
  "timeEnd": "HH:MM of null",
  "type": "marché|concert|spectacle|sport|exposition|balade|foire|vide-grenier|autre",
  "price": "prijs als tekst of null",
  "phone": "telefoonnummer of null",
  "website": "URL of null"
}

Regels:
- Geef ALLEEN de JSON-array terug, geen uitleg
- Sla nationale of niet-Nièvre-evenementen over
- Als datum niet zeker is: gebruik null
- Gebruik de gepubliceerde datum als basis voor datumberekening`,
    }],
  });

  const raw = msg.content[0].text.trim();
  const jsonStart = raw.indexOf('[');
  const jsonEnd = raw.lastIndexOf(']') + 1;
  if (jsonStart === -1) return [];
  return JSON.parse(raw.slice(jsonStart, jsonEnd));
}

// ── Stap 5: Wikipedia-foto van het dorp ──────────────────────
async function getVillagePhoto(cityName) {
  if (!cityName) return null;
  try {
    const encoded = encodeURIComponent(cityName);
    const apiUrl = `https://fr.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'NievreMorevan/1.0 (nievremorvan.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

// ── Datum string → JS Date ────────────────────────────────────
const FR_MONTHS = {
  janvier:1,février:2,mars:3,avril:4,mai:5,juin:6,
  juillet:7,août:8,septembre:9,octobre:10,novembre:11,décembre:12,
};
function parseDate(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{1,2})\s+([a-zéû]+)\s*(\d{4})?/i);
  if (!m) return null;
  const day = parseInt(m[1]);
  const month = FR_MONTHS[m[2].toLowerCase()];
  const year = m[3] ? parseInt(m[3]) : new Date().getFullYear();
  if (!month) return null;
  return new Date(year, month - 1, day);
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  // Token-beveiliging
  const token = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  let saved = 0, skipped = 0, errors = 0;
  const log = [];

  try {
    // 1. Vind recente artikelen
    log.push('Zoeken naar recente "que faire" artikelen…');
    const articles = await findQuefaireurls();

    if (articles.length === 0) {
      log.push('Geen artikelen gevonden');
      await runRef.set({ source: 'lejdc', savedCount: 0, log, createdAt: Timestamp.now() });
      return { statusCode: 200, body: JSON.stringify({ saved: 0 }) };
    }
    log.push(`${articles.length} artikel(en) gevonden`);

    // 2. Controleer welke al verwerkt zijn
    const processedSnap = await db
      .collection('morvan').doc('data').collection('lejdc_processed').get();
    const processed = new Set(processedSnap.docs.map(d => d.id));

    for (const { id: articleId, url } of articles) {
      if (processed.has(articleId)) {
        log.push(`Artikel ${articleId} al verwerkt, overgeslagen`);
        skipped++;
        continue;
      }

      log.push(`Verwerken: ${url}`);
      try {
        // 3. Haal artikel op
        const html = await fetchArticle(url);
        const { text, publishedRaw } = parseArticleBlocks(html);

        // 4. Extraheer events via Claude
        const events = await extractEvents(text, publishedRaw, url);
        log.push(`${events.length} events geëxtraheerd uit artikel ${articleId}`);

        // 5. Sla events op
        const batch = db.batch();
        for (let i = 0; i < events.length; i++) {
          const ev = events[i];
          const docId = `lejdc_${articleId}_${i}`;
          const docRef = db.collection('morvan').doc('data').collection('events').doc(docId);

          // Bestaand document overslaan
          const existing = await docRef.get();
          if (existing.exists) continue;

          // Datum verwerken
          const dateObj = parseDate(ev.date || ev.dateText);
          const dateTs  = dateObj ? Timestamp.fromDate(dateObj) : null;

          // Skip events in het verleden (> 7 dagen geleden)
          if (dateObj) {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (dateObj < weekAgo) continue;
          }

          // Foto: probeer Wikipedia-foto van het dorp
          let imageUrl = null;
          if (ev.city) {
            imageUrl = await getVillagePhoto(ev.city);
          }

          batch.set(docRef, {
            title:       { fr: ev.title, en: ev.title, nl: ev.title },
            description: { fr: ev.description, en: null, nl: null },
            city:        ev.city || null,
            location:    ev.city || null,
            date:        dateTs,
            dateText:    ev.dateText || null,
            timeStart:   ev.timeStart || null,
            timeEnd:     ev.timeEnd || null,
            type:        ev.type || 'overig',
            price:       ev.price || null,
            phone:       ev.phone || null,
            website:     ev.website || null,
            imageUrl,
            imageSource: imageUrl ? 'wikipedia_village' : null,
            sourceUrl:   url,
            source:      'lejdc',
            hidden:      false,
            createdAt:   Timestamp.now(),
            updatedAt:   Timestamp.now(),
          }, { merge: true });

          saved++;
        }
        await batch.commit();

        // Markeer artikel als verwerkt
        await db.collection('morvan').doc('data').collection('lejdc_processed')
          .doc(articleId).set({ url, processedAt: Timestamp.now() });

      } catch (err) {
        log.push(`Fout bij artikel ${articleId}: ${err.message}`);
        errors++;
      }

      // Korte pauze om de server niet te overbelasten
      await new Promise(r => setTimeout(r, 1500));
    }

    log.push(`Klaar: ${saved} events opgeslagen, ${skipped} overgeslagen, ${errors} fouten`);
    await runRef.set({
      source: 'lejdc',
      savedCount: saved,
      skippedCount: skipped,
      errorCount: errors,
      log,
      createdAt: Timestamp.now(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ saved, skipped, errors }),
    };

  } catch (err) {
    console.error('[sync-lejdc]', err.message);
    await runRef.set({
      source: 'lejdc',
      error: err.message,
      log,
      createdAt: Timestamp.now(),
    }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
