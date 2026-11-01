/**
 * blog-rewrite.js — werkt de 7 behouden blogposts bij met herschreven,
 * redactionele content (zie _shared/blog-keepers.js).
 *
 * Behoudt slug, date, image en createdAt; vervangt title/excerpt/content/
 * category/readTime. Markeert de post als manuallyEdited + source:'editorial'
 * zodat geen automatisch proces hem nog aanraakt.
 *
 * Trigger: POST /.netlify/functions/blog-rewrite   header x-admin-trigger: '1'
 *   body { "dryRun": true } → toont alleen wat zou wijzigen
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { KEEPERS } from './_shared/blog-keepers.js';

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

export const handler = async (event) => {
  const token = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let opts = {};
  try { opts = JSON.parse(event.body || '{}'); } catch { /* geen body */ }
  const dryRun = opts.dryRun === true;

  const col = db.collection('morvan').doc('data').collection('blog_posts');
  const updated = [];
  const missing = [];

  for (const k of KEEPERS) {
    const snap = await col.where('slug', '==', k.slug).limit(1).get();
    if (snap.empty) { missing.push(k.slug); continue; }
    const ref = snap.docs[0].ref;

    if (!dryRun) {
      await ref.update({
        title:    k.title,
        excerpt:  k.excerpt,
        content:  k.content,
        category: k.category,
        readTime: k.readTime,
        published: true,
        manuallyEdited: true,
        source: 'editorial',
        updatedAt: Timestamp.now(),
      });
    }
    updated.push(k.slug);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ dryRun, bijgewerkt: updated, ontbreekt: missing }, null, 2),
  };
};
