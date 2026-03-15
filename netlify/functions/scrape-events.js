/**
 * Netlify Background Function — runs weekly via cron
 * Scrapes tourism sites using fetch + Claude API for intelligent extraction
 * Writes results to Firestore /morvan/data/events
 *
 * To add a new source: add an object to SCRAPE_SOURCES below.
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ─── Firebase Admin init ───────────────────────────────────────────────────
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

// ─── Claude client ─────────────────────────────────────────────────────────
const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// ─── Sources ────────────────────────────────────────────────────────────────
// To add a new source: add one object here. selector = CSS hint for Claude.
const SCRAPE_SOURCES = [
  {
    name: 'Nièvre Tourisme',
    url: 'https://www.nievre-tourisme.com/agenda/',
    selector: 'article, .event, .agenda-item, .card',
  },
  {
    name: 'La Nièvre naturellement',
    url: 'https://www.lanievrenaturellement.com/agenda/',
    selector: '.event-item, article, .card-event',
  },
  {
    name: 'Agenda Culturel 58',
    url: 'https://58.agendaculturel.fr',
    selector: '.event, article, .listing-item',
  },
  {
    name: 'Tourisme Pays du Roi Morvan',
    url: 'https://www.tourismepaysroimorvan.com/agenda/',
    selector: 'article, .event',
  },
  {
    name: 'Rives du Morvan',
    url: 'https://www.rivesdumorvan.fr/agenda/',
    selector: '.event, article',
  },
  {
    name: 'Coeur de Nièvre',
    url: 'https://www.tourismecoeurdenievre.com/agenda/',
    selector: '.event, article, .programme',
  },
];

// ─── Extraction prompt ──────────────────────────────────────────────────────
function buildPrompt(html, sourceName, sourceUrl) {
  const today = new Date().toISOString().split('T')[0];
  return `You are a tourism data extractor. Extract ALL upcoming events from this HTML from the website "${sourceName}" (${sourceUrl}).
Today is ${today}. Only include events on or after today.

Return a JSON array of events. Each event object must have these fields (use null if unknown):
- title_fr: string (original French title)
- title_en: string (English translation)
- title_nl: string (Dutch translation)
- description_fr: string (French description, max 300 chars)
- description_en: string (English translation, max 300 chars)
- description_nl: string (Dutch translation, max 300 chars)
- date_iso: string (ISO 8601 date, e.g. "2026-07-14")
- end_date_iso: string|null
- location: string (town/venue name)
- lat: number|null (approximate latitude if you know the town)
- lng: number|null (approximate longitude if you know the town)
- type: one of "festival"|"markt"|"sport"|"natuur"|"cultuur"|"overig"
- source_url: string (direct link to the event page if available, otherwise "${sourceUrl}")
- image_url: string|null (absolute URL to event image if found)

Rules:
- Translate titles and descriptions to English and Dutch yourself
- For well-known towns in the Nièvre/Morvan, fill in approximate coordinates
- If no events are found, return []
- Return ONLY valid JSON, no markdown, no explanation

HTML:
${html.slice(0, 60000)}`;
}

// ─── Deduplication ──────────────────────────────────────────────────────────
function makeId(event) {
  const slug = (event.title_fr || '').toLowerCase().replace(/\s+/g, '-').slice(0, 40);
  const date = event.date_iso || 'nodate';
  return `${date}_${slug}`;
}

// ─── Main handler ────────────────────────────────────────────────────────────
export const handler = async () => {
  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  const startTime = Date.now();
  let eventsFound = 0;
  let eventsAdded = 0;
  const errors = [];

  for (const source of SCRAPE_SOURCES) {
    try {
      console.log(`Scraping: ${source.name} — ${source.url}`);

      // 1. Fetch HTML
      const res = await fetch(source.url, {
        headers: { 'User-Agent': 'NievreTourisme-Bot/1.0 (info@nievre-tourisme.fr)' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      // 2. Extract with Claude
      const msg = await claude.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(html, source.name, source.url) }],
      });

      const raw = msg.content[0]?.text?.trim() || '[]';
      let extracted;
      try {
        extracted = JSON.parse(raw);
      } catch {
        // Try to extract JSON array from response
        const match = raw.match(/\[[\s\S]*\]/);
        extracted = match ? JSON.parse(match[0]) : [];
      }

      eventsFound += extracted.length;
      console.log(`  → ${extracted.length} events found`);

      // 3. Write to Firestore (upsert by ID)
      const batch = db.batch();
      for (const ev of extracted) {
        if (!ev.date_iso || !ev.title_fr) continue;

        const id = makeId(ev);
        const ref = db.collection('morvan').doc('data').collection('events').doc(id);

        const existing = await ref.get();
        if (existing.exists && existing.data().manuallyEdited) continue; // don't overwrite admin edits

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

        if (!existing.exists) {
          data.createdAt = Timestamp.now();
          eventsAdded++;
        }

        batch.set(ref, data, { merge: true });
      }
      await batch.commit();

    } catch (err) {
      console.error(`Error scraping ${source.name}:`, err.message);
      errors.push(`${source.name}: ${err.message}`);
    }
  }

  // 4. Log the run
  await runRef.set({
    timestamp: Timestamp.now(),
    sourcesScraped: SCRAPE_SOURCES.length,
    eventsFound,
    eventsAdded,
    errors,
    durationMs: Date.now() - startTime,
  });

  console.log(`Done. ${eventsFound} events found, ${eventsAdded} added. ${errors.length} errors.`);
  return { statusCode: 200 };
};
