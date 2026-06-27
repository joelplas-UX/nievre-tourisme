/**
 * fix-blog-dates.mjs — eenmalige opschoonactie
 *
 * Corrigeert blogposts waarvan `date` in de toekomst staat (Claude verzon ooit
 * een seizoensdatum) terug naar de echte publicatiedatum = `createdAt`.
 *
 * Gebruik (vanuit projectroot):
 *   node scripts/fix-blog-dates.mjs            # dry-run, toont wat er zou wijzigen
 *   node scripts/fix-blog-dates.mjs --apply    # voert de wijzigingen door
 *
 * Vereist de Admin-SDK credentials in de omgeving (zelfde als de Netlify functions):
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * Tip: lokaal met `node --env-file=.env scripts/fix-blog-dates.mjs --apply`
 *      mits die drie keys in .env staan.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const APPLY = process.argv.includes('--apply');

function parisDate(d) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('❌ Ontbrekende credentials: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL en FIREBASE_PRIVATE_KEY zijn vereist.');
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const today = parisDate(new Date());
const col = db.collection('morvan').doc('data').collection('blog_posts');

const snap = await col.get();
const fixes = [];

snap.forEach((doc) => {
  const p = doc.data();
  if (!p.date || p.date <= today) return; // alleen toekomstige datums

  // Echte publicatiedatum = createdAt (val terug op vandaag als die ontbreekt)
  const created = p.createdAt?.toDate ? parisDate(p.createdAt.toDate()) : today;
  const newDate = created > today ? today : created; // nooit in de toekomst
  fixes.push({ id: doc.id, slug: p.slug, from: p.date, to: newDate });
});

if (fixes.length === 0) {
  console.log(`✅ Geen toekomst-gedateerde posts gevonden (vandaag = ${today}).`);
  process.exit(0);
}

console.log(`Gevonden ${fixes.length} post(s) met toekomst-datum (vandaag = ${today}):\n`);
for (const f of fixes) {
  console.log(`  ${f.from}  ->  ${f.to}   ${f.slug}`);
}

if (!APPLY) {
  console.log('\nDry-run. Voer uit met --apply om door te voeren.');
  process.exit(0);
}

console.log('\nDoorvoeren...');
for (const f of fixes) {
  await col.doc(f.id).update({ date: f.to });
  console.log(`  ✅ ${f.slug} -> ${f.to}`);
}
console.log(`\nKlaar: ${fixes.length} post(s) bijgewerkt.`);
process.exit(0);
