/**
 * post-social-background.js
 * Plaatst dagelijks een willekeurige blog post of activiteit op Facebook & Instagram
 *
 * Trigger: dagelijks 08:00 UTC (10:00 CEST) via netlify.toml
 * Auth:    x-cron-token: CRON_SECRET_TOKEN
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function getDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// ─── Helper: Willekeurig item uit array ──────────────────────────────────
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Helper: Caption genereren via Claude ───────────────────────────────
async function generateCaption(type, title, description, url) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const client = new Anthropic({ apiKey });

  const prompt = type === 'blog'
    ? `Je bent een socialmedia expert voor toerisme in Nièvre, Frankrijk. Schrijf een aantrekkelijke, korte Instagram/Facebook caption (max 150 woorden) voor deze blogpost. Gebruik veel emojis, begin met een hook. Taal: Nederlands met Franse/Engelse elementen waar gepast.

Titel: ${title}
Beschrijving: ${description}
URL: ${url}

Geef ALLEEN de caption, niets anders.`
    : `Je bent een socialmedia expert voor toerisme in Nièvre, Frankrijk. Schrijf een aantrekkelijke, korte Instagram/Facebook caption (max 100 woorden) voor deze activiteit/atractie. Gebruik veel emojis, maak het intrigerend.

Naam: ${title}
Info: ${description}
URL: ${url}

Geef ALLEEN de caption, niets anders.`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text;
}

// ─── Helper: Post naar Facebook & Instagram via Graph API ───────────────
async function postToSocialMedia(caption, imageUrl) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const instagramId = process.env.INSTAGRAM_ACCOUNT_ID;
  const token = process.env.FEESTBOEK_ACCESS_TOKEN;

  const results = { facebook: null, instagram: null };

  try {
    // 1. Post naar Facebook pagina
    const fbResponse = await fetch(
      `https://graph.instagram.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: caption,
          link: imageUrl,
          access_token: token,
        }),
      }
    );

    if (fbResponse.ok) {
      const fbData = await fbResponse.json();
      results.facebook = { success: true, postId: fbData.id };
    } else {
      const error = await fbResponse.json();
      results.facebook = { success: false, error: error.error?.message };
    }
  } catch (error) {
    results.facebook = { success: false, error: error.message };
  }

  try {
    // 2. Post naar Instagram
    const igResponse = await fetch(
      `https://graph.instagram.com/v18.0/${instagramId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: token,
        }),
      }
    );

    if (igResponse.ok) {
      const igData = await igResponse.json();
      results.instagram = { success: true, mediaId: igData.id };
    } else {
      const error = await igResponse.json();
      results.instagram = { success: false, error: error.error?.message };
    }
  } catch (error) {
    results.instagram = { success: false, error: error.message };
  }

  return results;
}

// ─── Main handler ───────────────────────────────────────────────────────
export default async (req, res) => {
  // Auth: Laat toe als admin trigger, Netlify invoked, of cron token matcht
  const isAdmin = req.headers['x-admin-trigger'] === '1';
  const isNetlifyInvoked = !!req.headers['x-netlify-event']; // Netlify "Run now" of scheduled

  if (!isAdmin && !isNetlifyInvoked) {
    const cronToken = req.headers['x-cron-token'];
    if (cronToken !== process.env.CRON_SECRET_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const db = getDb();

  try {
    // 1. Fetch alle blog posts en activities
    const blogsSnap = await db.collection('morvan').doc('data').collection('blog_posts').limit(100).get();
    const activitiesSnap = await db.collection('morvan').doc('data').collection('activities').limit(100).get();

    const blogs = blogsSnap.docs.map(d => ({ id: d.id, type: 'blog', ...d.data() }));
    const activities = activitiesSnap.docs.map(d => ({ id: d.id, type: 'activity', ...d.data() }));

    if (blogs.length === 0 && activities.length === 0) {
      return res.status(400).json({ error: 'Geen blog posts of activiteiten gevonden' });
    }

    // 2. Selecteer willekeurig
    const allItems = [...blogs, ...activities];
    const selected = randomItem(allItems);

    // 3. Voorbereiding data
    let title, description, imageUrl, url, type;

    if (selected.type === 'blog') {
      title = selected.title;
      description = selected.excerpt || selected.description || selected.content?.substring(0, 200);
      imageUrl = selected.image || selected.featured_image || 'https://via.placeholder.com/1200x630';
      url = `https://nievre-tourisme.com/blog/${selected.id}`;
      type = 'blog';
    } else {
      title = selected.name || selected.title;
      description = selected.description || selected.excerpt || '';
      imageUrl = selected.image || selected.featured_image || 'https://via.placeholder.com/1200x630';
      url = `https://nievre-tourisme.com/activity/${selected.id}`;
      type = 'activity';
    }

    // 4. Caption genereren
    console.log(`[Social] Genereer caption voor: ${title}`);
    const caption = await generateCaption(type, title, description, url);

    // 5. Posten naar social media
    console.log(`[Social] Post naar Facebook & Instagram...`);
    const socialResults = await postToSocialMedia(caption, imageUrl);

    // 6. Log naar Firebase
    await db.collection('morvan').doc('data').collection('social_posts').add({
      timestamp: Timestamp.now(),
      type: selected.type,
      itemId: selected.id,
      title: title,
      caption: caption,
      imageUrl: imageUrl,
      url: url,
      results: socialResults,
      createdAt: new Date().toISOString(),
    });

    console.log('[Social] Succes!', JSON.stringify(socialResults));

    return res.status(200).json({
      success: true,
      posted: title,
      results: socialResults,
    });

  } catch (error) {
    console.error('[Social] Error:', error.message);

    // Log error naar Firebase
    const db = getDb();
    await db.collection('morvan').doc('data').collection('social_posts').add({
      timestamp: Timestamp.now(),
      error: error.message,
      stack: error.stack,
      createdAt: new Date().toISOString(),
    });

    return res.status(500).json({
      error: 'Post naar social media mislukt',
      message: error.message,
    });
  }
};
