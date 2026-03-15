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

async function loadSources(db) {
  try {
    const snap = await db.collection('morvan').doc('data').collection('scrape_sources').get();
    if (snap.empty) return FALLBACK_SOURCES;
    const sources = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.enabled !== false);
    return sources.length > 0 ? sources : FALLBACK_SOURCES;
  } catch (err) {
    console.warn('Firestore bronnen niet geladen, gebruik fallback:', err.message);
    return FALLBACK_SOURCES;
  }
}

// ─── Extractie prompt ─────────────────────────────────────────────────────────
function buildPrompt(html, sourceName, sourceUrl) {
  const today = new Date().toISOString().split('T')[0];
  return `You are a tourism data extractor. Extract ALL upcoming events from this HTML from the website "${sourceName}" (${sourceUrl}).
Today is ${today}. Only include events on or after today.

Return a JSON array. Each object must have (use null if unknown):
- title_fr, title_en, title_nl: string
- description_fr, description_en, description_nl: string (max 300 chars each)
- date_iso: "YYYY-MM-DD"
- end_date_iso: "YYYY-MM-DD" or null
- location: string (town/venue)
- lat: number or null
- lng: number or null
- type: "festival"|"markt"|"sport"|"natuur"|"cultuur"|"overig"
- source_url: string
- image_url: string or null

Rules:
- Translate to English and Dutch
- Fill coordinates for well-known Nièvre/Morvan towns
- Return [] if no events found
- Return ONLY valid JSON, no markdown

HTML:
${html.slice(0, 40000)}`;
}

// ─── ID voor deduplicatie ─────────────────────────────────────────────────────
function makeId(event) {
  const slug = (event.title_fr || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  return `${event.date_iso || 'nodate'}_${slug}`;
}

// ─── Hoofd scrape functie ─────────────────────────────────────────────────────
export async function runScrape() {
  const db = getDb();
  const claude = getClaude();
  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  const startTime = Date.now();
  let eventsFound = 0;
  let eventsAdded = 0;
  const errors = [];

  const sources = await loadSources(db);
  console.log(`[scraper] ${sources.length} bronnen geladen`);

  for (const source of sources) {
    try {
      console.log(`[scraper] Fetching: ${source.name} — ${source.url}`);

      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'NievreTourisme-Bot/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      console.log(`[scraper] HTML ontvangen (${Math.round(html.length / 1024)}KB)`);

      const msg = await claude.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(html, source.name, source.url) }],
      }, { timeout: 60000 });

      const raw = msg.content[0]?.text?.trim() || '[]';
      let extracted;
      try {
        extracted = JSON.parse(raw);
      } catch {
        const match = raw.match(/\[[\s\S]*\]/);
        extracted = match ? JSON.parse(match[0]) : [];
      }

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

    } catch (err) {
      console.error(`[scraper] Fout bij ${source.name}:`, err.message);
      errors.push(`${source.name}: ${err.message}`);
    }
  }

  // Log de run
  await runRef.set({
    timestamp: Timestamp.now(),
    sourcesScraped: sources.length,
    eventsFound,
    eventsAdded,
    errors,
    durationMs: Date.now() - startTime,
  });

  console.log(`[scraper] Klaar: ${eventsFound} gevonden, ${eventsAdded} nieuw, ${errors.length} fouten`);
  return { eventsFound, eventsAdded, errors };
}
