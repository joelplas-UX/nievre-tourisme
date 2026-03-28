/**
 * POST /.netlify/functions/subscribe
 * Body: { email, postcode?, lang, radiusKm? }
 *
 * Slaat een nieuwe nieuwsbriefabonnee op in Firestore.
 * Geocodeert de postcode via Nominatim als die meegegeven wordt.
 * Stuurt een welkomstmail via Resend.
 *
 * Vereist: RESEND_API_KEY, FIREBASE_* env vars
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';

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

const SITE_URL = process.env.URL || 'https://nievre-tourisme.netlify.app';

async function geocodePostcode(postcode) {
  try {
    const query = `${postcode} France`;
    const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: query, format: 'json', limit: '1', countrycodes: 'fr',
    });
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nievre-tourisme/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {}
  return null;
}

async function sendWelcomeEmail(email, lang, token) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const unsubUrl = `${SITE_URL}/unsubscribe?token=${token}`;

  const subjects = {
    fr: '🌿 Bienvenue dans la newsletter Nièvre & Morvan',
    en: '🌿 Welcome to the Nièvre & Morvan newsletter',
    nl: '🌿 Welkom bij de Nièvre & Morvan nieuwsbrief',
  };
  const bodies = {
    fr: `<p>Bonjour,</p>
<p>Merci de vous être abonné(e) à notre newsletter ! Chaque semaine, vous recevrez les événements et activités à ne pas manquer dans la Nièvre et le Morvan.</p>
<p>À très bientôt 🌿</p>
<p style="margin-top:32px;font-size:12px;color:#999;">
  Vous recevez cet email parce que vous vous êtes inscrit(e) sur nievre-morvan.fr.<br>
  <a href="${unsubUrl}" style="color:#999;">Se désabonner</a>
</p>`,
    en: `<p>Hello,</p>
<p>Thank you for subscribing to our newsletter! Every week you'll receive the best events and activities in the Nièvre and Morvan region.</p>
<p>See you soon 🌿</p>
<p style="margin-top:32px;font-size:12px;color:#999;">
  You're receiving this because you signed up at nievre-morvan.fr.<br>
  <a href="${unsubUrl}" style="color:#999;">Unsubscribe</a>
</p>`,
    nl: `<p>Hallo,</p>
<p>Bedankt voor je aanmelding! Elke week ontvang je de beste evenementen en activiteiten in de Nièvre en Morvan.</p>
<p>Tot snel 🌿</p>
<p style="margin-top:32px;font-size:12px;color:#999;">
  Je ontvangt dit omdat je je aangemeld hebt op nievre-morvan.fr.<br>
  <a href="${unsubUrl}" style="color:#999;">Uitschrijven</a>
</p>`,
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Nièvre & Morvan <nieuwsbrief@nievre-morvan.fr>',
      to: email,
      subject: subjects[lang] || subjects.fr,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
        ${bodies[lang] || bodies.fr}
      </body></html>`,
    }),
    signal: AbortSignal.timeout(10000),
  });
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, postcode, lang = 'fr', radiusKm = 50 } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ongeldig e-mailadres' }) };
  }

  const db = getDb();
  const col = db.collection('morvan').doc('data').collection('subscribers');

  // Check of email al bestaat
  const existing = await col.where('email', '==', email.toLowerCase()).limit(1).get();
  if (!existing.empty) {
    const sub = existing.docs[0].data();
    if (sub.active) {
      return { statusCode: 200, body: JSON.stringify({ status: 'already_subscribed' }) };
    } else {
      // Reactief
      await existing.docs[0].ref.update({ active: true, reactivatedAt: Timestamp.now() });
      return { statusCode: 200, body: JSON.stringify({ status: 'reactivated' }) };
    }
  }

  // Geocodeer postcode
  let lat = null, lng = null;
  if (postcode) {
    const coords = await geocodePostcode(postcode);
    if (coords) { lat = coords.lat; lng = coords.lng; }
  }

  const token = randomUUID();

  await col.add({
    email: email.toLowerCase(),
    postcode: postcode || null,
    lat,
    lng,
    lang: ['fr', 'en', 'nl'].includes(lang) ? lang : 'fr',
    radiusKm: Math.min(Math.max(Number(radiusKm) || 50, 5), 200),
    active: true,
    token,
    subscribedAt: Timestamp.now(),
    lastSentAt: null,
  });

  // Welkomstmail (niet-blokkerend)
  sendWelcomeEmail(email, lang, token).catch(e =>
    console.warn('[subscribe] Welkomstmail mislukt:', e.message)
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'subscribed' }),
  };
};
