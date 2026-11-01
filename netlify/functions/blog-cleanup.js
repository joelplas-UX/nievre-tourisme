/**
 * blog-cleanup.js — eenmalige/omkeerbare opschoonactie voor de blog.
 *
 * Context: de wekelijkse AI-generator produceerde 50+ dunne, generieke posts
 * (en enkele met feitelijke fouten). Google markeerde de site daardoor als
 * "content van weinig waarde". Deze functie zet alle auto-gegenereerde posts
 * op `published: false` BEHALVE een kleine keep-lijst met sterke onderwerpen,
 * zodat alleen verzorgde content zichtbaar blijft.
 *
 * VEILIG & OMKEERBAAR: verwijdert niets. Alleen `published` wordt gewijzigd.
 * Opnieuw publiceren kan altijd via /admin of door published weer op true te zetten.
 *
 * Trigger (vanuit admin): POST /.netlify/functions/blog-cleanup
 *   headers: x-admin-trigger: '1'   (of x-cron-token: CRON_SECRET_TOKEN)
 * Optioneel body: { "restore": true } → zet de keep-lijst weer op published:true
 *                 { "dryRun": true }  → toont alleen wat er zou wijzigen
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

// Posts die zichtbaar blijven (sterke, verifieerbare onderwerpen).
const KEEP = new Set([
  'velo-canal-nivernais-mai-2026',
  'baignade-lac-settons-ete',
  'fleurs-sauvages-morvan-printemps',
  'automne-morvan-couleurs-feuillages',
  'villages-medievaux-nievre-printemps',
  'vignobles-nivernais-automne-degustation',
  'automne-morvan-champignons-forets',
]);

export const handler = async (event) => {
  const token = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let opts = {};
  try { opts = JSON.parse(event.body || '{}'); } catch { /* geen body */ }
  const dryRun  = opts.dryRun === true;
  const restore = opts.restore === true;

  const col = db.collection('morvan').doc('data').collection('blog_posts');
  const snap = await col.get();

  const toUnpublish = [];
  const toKeep = [];

  snap.forEach(doc => {
    const p = doc.data();
    const isAuto = p.source === 'auto';
    if (KEEP.has(p.slug)) { toKeep.push(p.slug); return; }
    // Alleen auto-posts verbergen; handmatige content nooit aanraken
    if (isAuto && p.published !== false) toUnpublish.push(doc.id);
  });

  if (dryRun) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        dryRun: true, total: snap.size,
        zouVerbergen: toUnpublish.length, behouden: toKeep,
      }, null, 2),
    };
  }

  // Schrijf in batches (max 500 per batch)
  let changed = 0;
  const ids = restore ? [] : toUnpublish;
  for (let i = 0; i < ids.length; i += 450) {
    const batch = db.batch();
    for (const id of ids.slice(i, i + 450)) {
      batch.update(col.doc(id), { published: false });
      changed++;
    }
    await batch.commit();
  }

  // restore: zet de keep-lijst (terug) op published:true
  let restored = 0;
  if (restore) {
    const batch = db.batch();
    snap.forEach(doc => {
      if (KEEP.has(doc.data().slug)) { batch.update(doc.ref, { published: true }); restored++; }
    });
    await batch.commit();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      total: snap.size,
      verborgen: changed,
      behouden: toKeep,
      hersteld: restored,
    }, null, 2),
  };
};
