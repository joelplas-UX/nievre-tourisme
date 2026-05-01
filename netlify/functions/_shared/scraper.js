/**
 * Gedeelde scraper logica — gebruikt door:
 *  - scrape-events.js        (wekelijkse cron)
 *  - trigger-scrape-background.js  (handmatige trigger via admin panel)
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ─── Firebase Admin — initialiseer slechts één keer ──────────────────────────
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

// ─── Claude client ────────────────────────────────────────────────────────────
function getClaude() {
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
}

// ─── Fallback bronnen (als Firestore leeg is) ─────────────────────────────────
const FALLBACK_SOURCES = [
  { name: 'Nièvre Tourisme',             url: 'https://www.nievre-tourisme.com/agenda/' },
  { name: 'La Nièvre naturellement',     url: 'https://www.lanievrenaturellement.com/agenda/' },
  { name: 'Agenda Culturel 58',          url: 'https://58.agendaculturel.fr' },
  { name: 'Tourisme Pays du Roi Morvan', url: 'https://www.tourismepaysroimorvan.com/agenda/' },
  { name: 'Rives du Morvan',             url: 'https://www.rivesdumorvan.fr/agenda/' },
  { name: "Coeur de Nièvre",             url: 'https://www.tourismecoeurdenievre.com/agenda/' },
];

async function loadSources(db, mode = 'regular') {
  try {
    const snap = await db.collection('morvan').doc('data').collection('scrape_sources').get();
    if (snap.empty) return mode === 'incidental' ? [] : FALLBACK_SOURCES;
    let sources = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.enabled !== false);

    // Filter op mode:
    //   regular    → alleen vaste bronnen (incidental !== true)
    //   incidental → alleen incidentele bronnen (incidental === true)
    //   all        → alles
    if (mode === 'regular')    sources = sources.filter(s => !s.incidental);
    if (mode === 'incidental') sources = sources.filter(s => s.incidental === true);

    return sources.length > 0 ? sources : (mode === 'incidental' ? [] : FALLBACK_SOURCES);
  } catch (err) {
    console.warn('Firestore bronnen niet geladen, gebruik fallback:', err.message);
    return mode === 'incidental' ? [] : FALLBACK_SOURCES;
  }
}

// ─── HTML → plain text (maximale compressie voor Claude) ─────────────────────
function htmlToText(html) {
  return html
    // Verwijder blokken die geen leesbare inhoud bevatten
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Zet block-elementen om naar newlines (leesbare structuur bewaren)
    .replace(/<\/?(p|div|h[1-6]|li|br|tr|section|article|header|footer)[^>]*>/gi, '\n')
    // Strip alle overige HTML-tags
    .replace(/<[^>]+>/g, ' ')
    // HTML entities decoderen
    .replace(/&amp;/g,  '&').replace(/&lt;/g,   '<').replace(/&gt;/g,   '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g,    (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    // Whitespace opruimen
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Extractie prompt ─────────────────────────────────────────────────────────
function buildPrompt(html, sourceName, sourceUrl) {
  const today = new Date().toISOString().split('T')[0];
  const text = htmlToText(html);
  console.log(`[scraper] HTML→text: ${Math.round(html.length/1024)}KB → ${Math.round(text.length/1024)}KB`);
  const cleanHtml = text.slice(0, 50000);
  return `You are a tourism data extractor. Extract ALL upcoming events from the text below, scraped from "${sourceName}" (${sourceUrl}).
Today is ${today}. Only include events on or after today.

The text may be a dedicated events page OR a news article listing events (e.g. "que faire ce week-end", brocantes, fêtes). Extract every individual event mentioned, even if listed in a compact format like "Alligny-en-Morvan. Marché, 17h30, Le Bourg."

Return a JSON array. Each object must have (use null if unknown):
- title_fr, title_en, title_nl: string
- description_fr, description_en, description_nl: string (max 300 chars each)
- date_iso: "YYYY-MM-DD"
- end_date_iso: "YYYY-MM-DD" or null
- location: string (town/venue name)
- lat: number or null
- lng: number or null
- type: "festival"|"muziek"|"markt"|"sport"|"natuur"|"cultuur"|"overig"
- source_url: string (use the page URL: ${sourceUrl})
- image_url: string or null

Rules:
- Translate titles/descriptions to English and Dutch
- Fill lat/lng coordinates for well-known Nièvre/Morvan towns
- Return [] if no events found
- Return ONLY valid JSON, no markdown, no explanation

PAGE TEXT:
${cleanHtml}`;
}

// ─── ID voor deduplicatie ─────────────────────────────────────────────────────
function makeId(event) {
  const slug = (event.title_fr || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  return `${event.date_iso || 'nodate'}_${slug}`;
}

// ─── Hoofd scrape functie ─────────────────────────────────────────────────────
export async function runScrape({ mode = 'regular' } = {}) {
  const db = getDb();
  const claude = getClaude();
  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  const startTime = Date.now();
  let eventsFound = 0;
  let eventsAdded = 0;
  const errors = [];

  // ── Ruim verlopen events op ──────────────────────────────────────────────
  let eventsDeleted = 0;
  try {
    const now = Timestamp.now();
    const eventsCol = db.collection('morvan').doc('data').collection('events');
    const allSnap = await eventsCol.get();
    const deleteOps = allSnap.docs
      .map(d => ({ ref: d.ref, data: d.data() }))
      .filter(({ data }) => {
        if (data.manuallyEdited) return false;
        const relevantDate = data.endDate || data.date;
        return relevantDate && relevantDate.toMillis() < now.toMillis();
      });
    await Promise.all(deleteOps.map(({ ref }) => ref.delete()));
    eventsDeleted = deleteOps.length;
    console.log(`[scraper] ${eventsDeleted} verlopen events verwijderd`);
  } catch (err) {
    console.warn('[scraper] Cleanup mislukt:', err.message);
  }

  const sources = await loadSources(db, mode);
  console.log(`[scraper] ${sources.length} bronnen geladen (mode: ${mode})`);

  const sourceLogs = [];

  for (const source of sources) {
    const sourceLog = { name: source.name, url: source.url };
    try {
      console.log(`[scraper] Fetching: ${source.name} — ${source.url}`);

      const res = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });
      sourceLog.httpStatus = res.status;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();
      const text = htmlToText(html);
      sourceLog.htmlKb  = Math.round(html.length / 1024);
      sourceLog.textKb  = Math.round(text.length / 1024);
      sourceLog.textSample = text.slice(0, 300);   // eerste 300 chars voor diagnose
      console.log(`[scraper] ${source.name}: ${sourceLog.htmlKb}KB → ${sourceLog.textKb}KB text`);

      const msg = await claude.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(html, source.name, source.url) }],
      }, { timeout: 60000 });

      const raw = msg.content[0]?.text?.trim() || '[]';
      sourceLog.claudeSample = raw.slice(0, 200);  // eerste 200 chars van Claude-antwoord
      let extracted;
      try {
        extracted = JSON.parse(raw);
      } catch {
        const match = raw.match(/\[[\s\S]*\]/);
        extracted = match ? JSON.parse(match[0]) : [];
      }

      sourceLog.eventsFound = extracted.length;
      eventsFound += extracted.length;
      console.log(`[scraper] ${source.name}: ${extracted.length} evenementen`);

      // Schrijf naar Firestore (parallel)
      const writeResults = await Promise.allSettled(
        extracted
          .filter(ev => ev.date_iso && ev.title_fr)
          .map(async ev => {
            const id = makeId(ev);
            const ref = db.collection('morvan').doc('data').collection('events').doc(id);
            const existing = await ref.get();
            if (existing.exists && existing.data().manuallyEdited) return 'skipped';

            const data = {
              title: { fr: ev.title_fr || '', en: ev.title_en || ev.title_fr || '', nl: ev.title_nl || ev.title_fr || '' },
              description: { fr: ev.description_fr || '', en: ev.description_en || '', nl: ev.description_nl || '' },
              date: Timestamp.fromDate(new Date(ev.date_iso)),
              endDate: ev.end_date_iso ? Timestamp.fromDate(new Date(ev.end_date_iso)) : null,
              location: ev.location || '',
              lat: ev.lat || null,
              lng: ev.lng || null,
              type: ev.type || 'overig',
              sourceUrl: ev.source_url || source.url,
              sourceName: source.name,
              imageUrl: ev.image_url || null,
              featured: false,
              hidden: false,
              updatedAt: Timestamp.now(),
            };

            if (!existing.exists) data.createdAt = Timestamp.now();
            await ref.set(data, { merge: true });
            return existing.exists ? 'updated' : 'added';
          })
      );
      eventsAdded += writeResults.filter(r => r.status === 'fulfilled' && r.value === 'added').length;
      sourceLogs.push(sourceLog);

    } catch (err) {
      console.error(`[scraper] Fout bij ${source.name}:`, err.message);
      errors.push(`${source.name}: ${err.message}`);
      sourceLog.error = err.message;
      sourceLogs.push(sourceLog);
    }
  }

  // Log de run
  const now = Timestamp.now();
  await runRef.set({
    timestamp:  now,
    createdAt:  now,   // zodat het ook in de history-tabel (orderBy createdAt) verschijnt
    source:     `scraper (${mode})`,
    sourcesScraped: sources.length,
    eventsFound,
    eventsAdded,
    eventsDeleted,
    errors,
    sourceLogs,
    durationMs: Date.now() - startTime,
  });

  console.log(`[scraper] Klaar: ${eventsFound} gevonden, ${eventsAdded} nieuw, ${errors.length} fouten`);
  return { eventsFound, eventsAdded, errors };
}
