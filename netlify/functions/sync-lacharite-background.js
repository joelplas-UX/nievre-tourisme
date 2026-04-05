/**
 * sync-lacharite-background.js
 * Scrapt evenementen van lacharitesurloire-tourisme.com via WordPress REST API.
 *
 * Strategie:
 *  1. Haal posts op via /wp-json/wp/v2/posts?categories=297,291 (Culture, Théâtre)
 *  2. Strip HTML uit content, stuur naar Claude Haiku voor extractie
 *  3. Claude extraheert: titel, datum, locatie, prijs uit de post-tekst
 *  4. Sla op in Firestore — enrich-functie vertaalt later naar EN/NL
 */

import Anthropic from '@anthropic-ai/sdk';
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const BASE    = 'https://www.lacharitesurloire-tourisme.com';
const API     = `${BASE}/wp-json/wp/v2`;
const HEADERS = { 'User-Agent': 'NievreMorevan/1.0 (nievremorvan.com)', 'Accept': 'application/json' };

// Categorie-IDs: 297=Culture, 291=Théâtre, 295=Automne en Bourgogne, 327=Avec les enfants
const CATEGORIES = [297, 291, 295, 327];
const MAX_POSTS  = 20;

// ── Type classificatie op basis van titelwoorden ─────────────
function classifyType(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/festival/.test(text)) return 'festival';
  if (/concert|musique|live|chanson|jazz|rock|classique|orchestre|chorale|groupe|chanteur/.test(text)) return 'muziek';
  if (/marche|brocante|vide.?grenier|foire|salon|braderie|artisanat/.test(text)) return 'markt';
  if (/rando|randonnee|balade|trail|course|velo|kayak|escalade|sport|athletisme/.test(text)) return 'sport';
  if (/nature|foret|jardin|botanique|faune|flore|environnement/.test(text)) return 'natuur';
  if (/exposition|musee|patrimoine|theatre|cinema|spectacle|danse|cirque|lecture|conference|animation|arts?/.test(text)) return 'cultuur';
  return 'overig';
}

// ── Strip HTML naar platte tekst ─────────────────────────────
function stripHtml(html) {
  return (html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── Claude: extraheer datum/locatie/prijs uit post-tekst ─────
async function extractFromPost(title, text, postDate) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Extraheer event-informatie uit deze toeristische blogpost van La Charité-sur-Loire.
Post-titel: ${title}
Post-datum: ${postDate}

Tekst:
${text.slice(0, 3000)}

Geef ALLEEN dit JSON terug (geen uitleg):
{
  "title": "evenementtitel (uit de tekst, niet de blogposttitel)",
  "date": "YYYY-MM-DD of null",
  "dateText": "datum zoals in de tekst",
  "timeStart": "HH:MM of null",
  "location": "locatie/venue of null",
  "price": "prijs of null",
  "description": "korte beschrijving max 200 tekens"
}
Als het geen duidelijk evenement is: geef {"title": null}`,
    }],
  });

  try {
    const raw   = msg.content[0].text.trim();
    const start = raw.indexOf('{');
    const end   = raw.lastIndexOf('}') + 1;
    if (start === -1) return null;
    const obj = JSON.parse(raw.slice(start, end));
    return obj.title ? obj : null;
  } catch {
    return null;
  }
}

// ── Haal featured image op ───────────────────────────────────
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

    const catParam = CATEGORIES.join(',');
    const url = `${API}/posts?categories=${catParam}&per_page=${MAX_POSTS}&orderby=date&order=desc&_fields=id,title,date,content,featured_media,link`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`WP API HTTP ${res.status}`);
    const posts = await res.json();

    log.push(`${posts.length} posts opgehaald`);

    for (const post of posts) {
      const docId  = `lacharite_${post.id}`;
      const docRef = eventsCol.doc(docId);
      const snap   = await docRef.get();
      if (snap.exists) { skipped++; continue; }

      try {
        const text     = stripHtml(post.content?.rendered || '');
        const title    = stripHtml(post.title?.rendered || '');
        const postDate = post.date?.slice(0, 10) || '';

        const extracted = await extractFromPost(title, text, postDate);
        if (!extracted) { skipped++; continue; }

        // Datumcontrole
        let dateObj = null;
        if (extracted.date) {
          try { dateObj = new Date(extracted.date); } catch {}
        }
        if (dateObj && (dateObj < minDate || dateObj > maxDate)) { skipped++; continue; }

        const imageUrl = await fetchImage(post.featured_media);

        await docRef.set({
          title:       { fr: extracted.title || title, en: null, nl: null },
          description: { fr: extracted.description || null, en: null, nl: null },
          city:        'La Charité-sur-Loire',
          location:    extracted.location || 'La Charité-sur-Loire',
          date:        dateObj ? Timestamp.fromDate(dateObj) : null,
          dateText:    extracted.dateText || null,
          timeStart:   extracted.timeStart || null,
          timeEnd:     null,
          type:        classifyType(extracted.title || title),
          price:       extracted.price || null,
          imageUrl:    imageUrl || null,
          sourceUrl:   post.link,
          source:      'lacharite',
          hidden:      false,
          createdAt:   Timestamp.now(),
          updatedAt:   Timestamp.now(),
        });

        saved++;
        log.push(`  Opgeslagen: ${extracted.title}`);
      } catch (err) {
        log.push(`Fout bij post ${post.id}: ${err.message}`);
        errors++;
      }

      await new Promise(r => setTimeout(r, 800));
    }

    log.push(`Klaar: ${saved} opgeslagen, ${skipped} overgeslagen, ${errors} fouten`);
    await runRef.set({ source: 'lacharite', savedCount: saved, skippedCount: skipped, errorCount: errors, log, createdAt: Timestamp.now() });
    return { statusCode: 200, body: JSON.stringify({ saved, skipped, errors }) };

  } catch (err) {
    console.error('[sync-lacharite]', err.message);
    await runRef.set({ source: 'lacharite', error: err.message, log, createdAt: Timestamp.now() }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
