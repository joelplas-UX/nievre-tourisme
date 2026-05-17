/**
 * write-blog-background.js
 * Genereert elke week 2 originele blogartikelen over de Nièvre & Morvan
 * via Claude en schrijft ze naar Firestore (morvan/data/blog_posts).
 *
 * Trigger: wekelijks cron (maandag 07:00 UTC) via netlify.toml
 * Auth:    x-admin-trigger: '1'  OF  x-cron-token: CRON_SECRET_TOKEN
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

// ─── Gecureerde afbeeldingen (Wikimedia Commons) ──────────────────────────
const IMAGES = [
  { tag: 'lac_settons',    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Lac_des_settons_-_barrage_03.jpg/1280px-Lac_des_settons_-_barrage_03.jpg' },
  { tag: 'morvan_vue',     url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/France_-_Bourgogne_-_Morvan_-_Bourgogne_-_Ni%C3%A8vre_-_Vue_depuis_le_mont_Moux_%28M%C3%A9diHAL_1266977%29.jpg/1280px-France_-_Bourgogne_-_Morvan_-_Bourgogne_-_Ni%C3%A8vre_-_Vue_depuis_le_mont_Moux_%28M%C3%A9diHAL_1266977%29.jpg' },
  { tag: 'canal_nivernais',url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Canal_du_Nivernais_DSC_0726.JPG/1280px-Canal_du_Nivernais_DSC_0726.JPG' },
  { tag: 'nevers',         url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Nevers_Cathedrale.jpg' },
  { tag: 'saut_gouloux',   url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Saut_du_Gouloux_%2833706270025%29.jpg/1280px-Saut_du_Gouloux_%2833706270025%29.jpg' },
  { tag: 'chateau_chinon', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/032_Paysage_du_Morvan_depuis_Ch%C3%A2teau-Chinon.jpg/1280px-032_Paysage_du_Morvan_depuis_Ch%C3%A2teau-Chinon.jpg' },
  { tag: 'vignes_bourgogne',url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Vineyard_in_Burgundy%2C_France.jpg/1280px-Vineyard_in_Burgundy%2C_France.jpg' },
  { tag: 'foret_sentier',  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/For%C3%AAt_domaniale_de_Desvres_Sentier_GR.jpg/1280px-For%C3%AAt_domaniale_de_Desvres_Sentier_GR.jpg' },
  { tag: 'canal_villiers', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Canal_du_Nivernais_in_Villiers-sur-Yonne_%281%29.jpg/1280px-Canal_du_Nivernais_in_Villiers-sur-Yonne_%281%29.jpg' },
  { tag: 'morvan_paysage', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ouroux-en-Morvan._Paysage_typique.JPG/1280px-Ouroux-en-Morvan._Paysage_typique.JPG' },
];

function imageUrl(tag) {
  return IMAGES.find(i => i.tag === tag)?.url ?? IMAGES[0].url;
}

// ─── Prompt ───────────────────────────────────────────────────────────────
function buildPrompt(month, existingTitles) {
  const today   = new Date().toISOString().split('T')[0];
  const seasons = {
    1:'hiver',2:'hiver',3:'printemps',4:'printemps',5:'printemps',
    6:'été',7:'été',8:'été',9:'automne',10:'automne',11:'automne',12:'hiver',
  };
  const season = seasons[month];

  const imageTags = IMAGES.map(i => i.tag).join(', ');

  return `Tu es Noah, rédacteur en chef du guide touristique indépendant "Nièvre & Morvan" (nievremorvan.com). Tu écris des articles de blog originaux, informatifs et engageants sur la Nièvre et le Parc Naturel Régional du Morvan.

Date d'aujourd'hui: ${today}. Saison: ${season}.

ARTICLES DÉJÀ PUBLIÉS (à ne pas reproduire):
${existingTitles.map(t => `- ${t}`).join('\n')}

MISSION: Génère 2 nouveaux articles de blog complets et originaux adaptés à la saison ${season}. Chaque article doit couvrir un sujet différent et ne pas recouper les articles existants.

RÈGLES DE CONTENU:
- Français: 700-900 mots, HTML avec balises <h2>, <ul>/<li>, <strong>, <a href="/activites">...</a>, <a href="/evenements">...</a>
- Chaque article doit contenir au moins 3 sections h2
- Inclure des informations pratiques concrètes (noms de lieux, distances, conseils)
- Ton: chaleureux, personnel, connaisseur de la région (pas de guide sec)
- Anglais et néerlandais: traductions fidèles et naturelles (même longueur)
- excerpt: 1-2 phrases accrocheuses (pas HTML)

CATEGORIES DISPONIBLES (choisir la plus pertinente):
fr: Randonnées | Gastronomie | Patrimoine | Nature | Séjours | Agenda | Pratique
en: Hiking | Gastronomy | Heritage | Nature | Stays | Events | Tips
nl: Wandelen | Gastronomie | Erfgoed | Natuur | Verblijf | Agenda | Tips

IMAGE_TAGS DISPONIBLES (choisir le plus pertinent pour chaque article):
${imageTags}

SLUG: en minuscules, tirets, max 45 caractères, en français, descriptif.

Retourne UNIQUEMENT un tableau JSON valide de 2 objets, chacun avec ces champs exacts:
{
  "slug": "string",
  "date": "${today}",
  "category": { "fr": "string", "en": "string", "nl": "string" },
  "readTime": number,
  "image_tag": "string",
  "title": { "fr": "string", "en": "string", "nl": "string" },
  "excerpt": { "fr": "string", "en": "string", "nl": "string" },
  "content": { "fr": "string HTML", "en": "string HTML", "nl": "string HTML" }
}

Retourne SEULEMENT le JSON, sans markdown, sans explication.`;
}

// ─── Handler ──────────────────────────────────────────────────────────────
export const handler = async (event) => {
  console.log('[write-blog] Started. Headers:', Object.keys(event.headers || {}));

  // Auth: Laat toe als admin trigger, cron token, of Netlify scheduled/invoked
  const isAdmin = event.headers?.['x-admin-trigger'] === '1';
  const isNetlifyCron = event.headers?.['x-netlify-cron'] === 'true'; // Netlify's scheduled functions

  console.log('[write-blog] Auth check - isAdmin:', isAdmin, 'isNetlifyCron:', isNetlifyCron);

  if (!isAdmin && !isNetlifyCron) {
    const token     = event.headers?.['x-cron-token'] || event.queryStringParameters?.token;
    const cronToken = process.env.CRON_SECRET_TOKEN;
    console.log('[write-blog] Token check - token:', token ? 'present' : 'missing', 'cronToken:', cronToken ? 'set' : 'not set');
    if (cronToken && token !== cronToken) {
      console.log('[write-blog] ❌ Auth failed');
      return { statusCode: 401, body: 'Unauthorized' };
    }
  }

  console.log('[write-blog] ✅ Auth passed');
  const db     = getDb();
  const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const start  = Date.now();

  // ── Haal bestaande titels op (vermijd duplicaten) ────────────────────────
  let existingTitles = [];
  try {
    const snap = await db
      .collection('morvan').doc('data').collection('blog_posts')
      .orderBy('date', 'desc').limit(30).get();
    existingTitles = snap.docs.map(d => d.data().title?.fr).filter(Boolean);
  } catch { /* geen probleem als leeg */ }

  const month  = new Date().getMonth() + 1;
  const prompt = buildPrompt(month, existingTitles);

  // ── Genereer posts via Claude ────────────────────────────────────────────
  let posts = [];
  try {
    const msg = await claude.messages.create({
      model:      'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages:   [{ role: 'user', content: prompt }],
    }, { timeout: 120000 });

    const raw = msg.content[0]?.text?.trim() || '[]';
    try {
      posts = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      posts = match ? JSON.parse(match[0]) : [];
    }
  } catch (err) {
    console.error('[write-blog] Claude fout:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return { statusCode: 500, body: 'Claude gaf geen geldige posts terug' };
  }

  // ── Schrijf naar Firestore ───────────────────────────────────────────────
  const col    = db.collection('morvan').doc('data').collection('blog_posts');
  const now    = Timestamp.now();
  let added    = 0;
  const errors = [];

  for (const p of posts) {
    if (!p.slug || !p.title?.fr || !p.content?.fr) {
      errors.push(`Ongeldig post-object (geen slug/title/content)`);
      continue;
    }

    // Dubbele slug voorkomen
    const ref = col.doc(p.slug);
    const existing = await ref.get();
    if (existing.exists) {
      console.log(`[write-blog] Slug al bestaat, sla over: ${p.slug}`);
      continue;
    }

    try {
      await ref.set({
        slug:      p.slug,
        date:      p.date || new Date().toISOString().split('T')[0],
        category:  p.category  || { fr: 'Découverte', en: 'Discovery', nl: 'Ontdekking' },
        readTime:  p.readTime  || 6,
        image:     imageUrl(p.image_tag),
        title:     p.title,
        excerpt:   p.excerpt   || { fr: '', en: '', nl: '' },
        content:   p.content,
        published: true,
        source:    'auto',
        createdAt: now,
        updatedAt: now,
      });
      console.log(`[write-blog] ✅ Geschreven: ${p.slug}`);
      added++;
    } catch (err) {
      console.error(`[write-blog] Firestore fout (${p.slug}):`, err.message);
      errors.push(`${p.slug}: ${err.message}`);
    }
  }

  // ── Log de run als scrape_run zodat hij in history verschijnt ────────────
  try {
    await db.collection('morvan').doc('data').collection('scrape_runs').add({
      timestamp:    now,
      createdAt:    now,
      source:       'blog_generator',
      eventsFound:  posts.length,
      eventsAdded:  added,
      eventsUpdated:0,
      eventsSkipped:posts.length - added - errors.length,
      errors,
      durationMs:   Date.now() - start,
    });
  } catch { /* log mislukt, geen probleem */ }

  console.log(`[write-blog] Klaar: ${added} posts geschreven, ${errors.length} fouten`);
  return {
    statusCode: 200,
    body: JSON.stringify({ added, errors, slugs: posts.map(p => p.slug) }),
  };
};
