/**
 * Synchroniseert evenementen en uitjes vanuit koikispass.com (Nièvre).
 * Gebruikt de WordPress REST API (/wp-json/wp/v2/posts) — geen HTML scraping nodig.
 * Claude Haiku extraheert individuele evenementen uit de wekelijkse roundup-posts.
 *
 * Background function — geeft direct 202 terug, loopt max 15 min.
 * Deduplicatie: stabiele doc ID = koiki_{postId}_{index}
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';

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

const WP_API = 'https://www.koikispass.com/wp-json/wp/v2';

// Categorieën die evenementen en uitjes bevatten
const TARGET_CATEGORIES = [335, 321]; // Sortir, Voyager local
const POSTS_PER_PAGE = 10;

// Haal featured image URL op via media endpoint
async function fetchFeaturedImage(mediaId) {
  if (!mediaId) return null;
  try {
    const res = await fetch(`${WP_API}/media/${mediaId}?_fields=source_url,media_details`);
    if (!res.ok) return null;
    const data = await res.json();
    // Voorkeur: medium_large of large formaat
    return (
      data.media_details?.sizes?.['medium_large']?.source_url ||
      data.media_details?.sizes?.['large']?.source_url ||
      data.source_url ||
      null
    );
  } catch {
    return null;
  }
}

// Strip HTML tags voor Claude input
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Claude extraheert individuele evenementen uit een WordPress blogpost
async function extractEventsFromPost(client, post) {
  const text = stripHtml(post.content?.rendered || '');
  const title = post.title?.rendered || '';
  const postDate = post.date ? new Date(post.date) : new Date();

  if (!text || text.length < 100) return [];

  const prompt = `Je bent een evenementen-extractor voor een toeristische website over de Nièvre (Frankrijk).

Hieronder staat de tekst van een Franstalige blogpost van koikispass.com met de titel: "${title}"
Publicatiedatum van de post: ${postDate.toISOString().slice(0, 10)}

Extraheer ALLE individuele evenementen/activiteiten die in deze post worden vermeld.
Voor elk evenement, geef een JSON object met deze velden:
- title_fr: string (originele Franse titel)
- title_en: string (Engelse vertaling)
- title_nl: string (Nederlandse vertaling)
- description_fr: string (korte beschrijving FR, max 200 tekens)
- description_en: string (korte beschrijving EN, max 200 tekens)
- description_nl: string (korte beschrijving NL, max 200 tekens)
- date_start: string ISO (YYYY-MM-DD) of null als onduidelijk
- date_end: string ISO (YYYY-MM-DD) of null
- location: string (stad/venue of null)
- type: een van: "festival" | "cultuur" | "muziek" | "sport" | "markt" | "natuur" | "overig"
- source_url: string of null (website/ticketlink als vermeld)
- price: string of null (bijv. "€8" of "Gratis")

Geef ALLEEN een geldige JSON array terug, zonder uitleg of markdown code block.
Als er geen duidelijke evenementen zijn, geef een lege array [].

Tekst:
${text.slice(0, 4000)}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0]?.text?.trim() || '[]';
    // Verwijder mogelijke markdown code block
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn(`Claude extractie mislukt voor post ${post.id}:`, err.message);
    return [];
  }
}

// Zet geëxtraheerd evenement om naar Firestore document
function buildEventDoc(event, post, postImageUrl, index) {
  let dateStart = null;
  let dateEnd = null;

  if (event.date_start) {
    try { dateStart = Timestamp.fromDate(new Date(event.date_start)); } catch {}
  }
  if (event.date_end) {
    try { dateEnd = Timestamp.fromDate(new Date(event.date_end)); } catch {}
  }

  // Als geen datum gevonden, gebruik post publicatiedatum + 7 dagen
  if (!dateStart) {
    const fallback = post.date ? new Date(post.date) : new Date();
    dateStart = Timestamp.fromDate(fallback);
  }

  return {
    title: {
      fr: event.title_fr || '',
      en: event.title_en || event.title_fr || '',
      nl: event.title_nl || event.title_fr || '',
    },
    description: {
      fr: event.description_fr || '',
      en: event.description_en || event.description_fr || '',
      nl: event.description_nl || event.description_fr || '',
    },
    date: dateStart,
    endDate: dateEnd,
    location: event.location || '',
    lat: null,
    lng: null,
    type: event.type || 'overig',
    sourceUrl: event.source_url || post.link || '',
    sourceName: 'koikispass.com',
    imageUrl: postImageUrl || null,
    price: event.price || null,
    featured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export const handler = async (event) => {
  // Geef direct 202 terug (background function)
  if (event.httpMethod === 'POST' || event.httpMethod === 'GET') {
    setTimeout(() => runSync(), 0);
    return { statusCode: 202, body: 'Koikispass sync gestart' };
  }
  // Cron trigger
  runSync().catch(console.error);
  return { statusCode: 202 };
};

async function runSync() {
  const db = getDb();
  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  const runStart = Date.now();
  const errors = [];
  let postsProcessed = 0;
  let eventsAdded = 0;
  let eventsSkipped = 0;

  console.log('▶ Koikispass sync gestart');

  try {
    // Haal recente posts op per doelcategorie
    const allPosts = [];
    for (const catId of TARGET_CATEGORIES) {
      const url = `${WP_API}/posts?categories=${catId}&per_page=${POSTS_PER_PAGE}&orderby=date&order=desc&_fields=id,title,date,content,featured_media,link`;
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`WP API cat ${catId}: HTTP ${res.status}`);
        continue;
      }
      const posts = await res.json();
      for (const p of posts) {
        if (!allPosts.find(existing => existing.id === p.id)) {
          allPosts.push(p);
        }
      }
    }

    console.log(`  Gevonden: ${allPosts.length} posts`);

    // Verwerk elke post
    for (const post of allPosts) {
      postsProcessed++;

      // Haal featured image op
      const imageUrl = await fetchFeaturedImage(post.featured_media);

      // Controleer of post al verwerkt is (check eerste event van deze post)
      const testDocId = `koiki_${post.id}_0`;
      const testSnap = await db
        .collection('morvan').doc('data').collection('events')
        .doc(testDocId).get();

      if (testSnap.exists) {
        console.log(`  Post ${post.id} al verwerkt, skip.`);
        eventsSkipped++;
        continue;
      }

      // Extraheer evenementen via Claude
      const events = await extractEventsFromPost(client, post);
      console.log(`  Post ${post.id}: ${events.length} evenementen geëxtraheerd`);

      if (!events.length) continue;

      // Sla op in Firestore
      const batch = db.batch();
      for (let i = 0; i < events.length; i++) {
        const docId = `koiki_${post.id}_${i}`;
        const docRef = db
          .collection('morvan').doc('data').collection('events')
          .doc(docId);
        const docData = buildEventDoc(events[i], post, imageUrl, i);
        batch.set(docRef, docData, { merge: true });
        eventsAdded++;
      }
      await batch.commit();

      // Kleine pauze om Claude rate limits te respecteren
      await new Promise(r => setTimeout(r, 800));
    }

    // Log scraping run
    await runRef.set({
      timestamp: Timestamp.now(),
      source: 'koikispass',
      durationMs: Date.now() - runStart,
      postsProcessed,
      eventsAdded,
      eventsSkipped,
      errors,
    });

    console.log(`✅ Koikispass sync klaar — ${eventsAdded} evenementen opgeslagen, ${eventsSkipped} posts overgeslagen`);
  } catch (err) {
    console.error('Koikispass sync fout:', err);
    errors.push(err.message);
    await runRef.set({
      timestamp: Timestamp.now(),
      source: 'koikispass',
      durationMs: Date.now() - runStart,
      postsProcessed,
      eventsAdded,
      eventsSkipped,
      errors,
    });
  }
}
