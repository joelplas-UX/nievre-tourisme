/**
 * Verstuurt de wekelijkse nieuwsbrief naar alle actieve abonnees.
 * Background function — geeft 202 terug, loopt max 15 min.
 * Cron: zie schedule-newsletter.js (elke donderdag 07:00 UTC)
 *
 * Vereiste env vars:
 *   RESEND_API_KEY — via resend.com (gratis: 3000 mails/maand)
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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
const FROM     = 'Nièvre & Morvan <nieuwsbrief@nievre-morvan.fr>';

// ── Haversine afstand (km) ─────────────────────────────────────────────────
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Inhoud ophalen ─────────────────────────────────────────────────────────
async function getUpcomingEvents(db, lat, lng, radiusKm) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 8);

  const snap = await db.collection('morvan').doc('data').collection('events')
    .where('date', '>=', Timestamp.fromDate(today))
    .where('date', '<=', Timestamp.fromDate(nextWeek))
    .where('hidden', '==', false)
    .orderBy('date')
    .limit(50)
    .get();

  let events = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Filtereer op afstand als abonnee een locatie heeft
  if (lat && lng) {
    events = events.filter(ev => {
      if (!ev.lat || !ev.lng) return true; // geen coords → altijd tonen
      return distKm(lat, lng, ev.lat, ev.lng) <= radiusKm;
    });
  }

  return events.slice(0, 6);
}

async function getActivities(db, lat, lng, radiusKm) {
  const snap = await db.collection('morvan').doc('data').collection('activities')
    .where('hidden', '!=', true)
    .limit(100)
    .get();

  let acts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(a => a.title?.fr);

  if (lat && lng) {
    acts = acts.filter(a => {
      if (!a.lat || !a.lng) return true;
      return distKm(lat, lng, a.lat, a.lng) <= radiusKm;
    });
  }

  // Sorteer: met foto eerst, dan willekeurig
  acts.sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0));
  return acts.slice(0, 4);
}

// ── HTML e-mail opbouw ─────────────────────────────────────────────────────
const LABELS = {
  fr: {
    subject: '🌿 Cette semaine en Nièvre & Morvan',
    eventsTitle: '📅 Événements de la semaine',
    activitiesTitle: '🥾 À faire dans la région',
    noEvents: 'Aucun événement cette semaine près de chez vous.',
    more: 'En savoir plus',
    discover: 'Découvrir',
    unsub: 'Se désabonner',
    unsubText: 'Vous recevez cet email parce que vous êtes abonné(e) à la newsletter Nièvre & Morvan.',
    viewAll: 'Voir tous les événements →',
    viewAllActivities: 'Voir toutes les activités →',
  },
  en: {
    subject: '🌿 This week in the Nièvre & Morvan',
    eventsTitle: '📅 This week\'s events',
    activitiesTitle: '🥾 Things to do in the region',
    noEvents: 'No events this week near you.',
    more: 'Learn more',
    discover: 'Discover',
    unsub: 'Unsubscribe',
    unsubText: 'You\'re receiving this because you subscribed to the Nièvre & Morvan newsletter.',
    viewAll: 'View all events →',
    viewAllActivities: 'View all activities →',
  },
  nl: {
    subject: '🌿 Deze week in de Nièvre & Morvan',
    eventsTitle: '📅 Evenementen van de week',
    activitiesTitle: '🥾 Te doen in de regio',
    noEvents: 'Geen evenementen deze week bij jou in de buurt.',
    more: 'Meer info',
    discover: 'Ontdekken',
    unsub: 'Uitschrijven',
    unsubText: 'Je ontvangt dit omdat je je aangemeld hebt voor de Nièvre & Morvan nieuwsbrief.',
    viewAll: 'Alle evenementen bekijken →',
    viewAllActivities: 'Alle activiteiten bekijken →',
  },
};

function formatDate(ts, lang) {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  const locale = lang === 'nl' ? 'nl-NL' : lang === 'en' ? 'en-GB' : 'fr-FR';
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long' });
}

function eventCard(ev, lang, l) {
  const title = ev.title?.[lang] || ev.title?.fr || '';
  const desc  = (ev.description?.[lang] || ev.description?.fr || '').slice(0, 150);
  const date  = formatDate(ev.date, lang);
  const img   = ev.imageUrl
    ? `<img src="${ev.imageUrl}" alt="${title}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;display:block;">`
    : `<div style="width:100%;height:120px;background:linear-gradient(135deg,#3a7d44,#2d6a38);border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;font-size:36px;">🌿</div>`;

  return `
<div style="background:#fff;border-radius:10px;overflow:hidden;margin-bottom:16px;border:1px solid #e8e0d0;">
  ${img}
  <div style="padding:16px;">
    <p style="margin:0 0 4px;font-size:13px;color:#3a7d44;font-weight:600;">${date}${ev.location ? ' · ' + ev.location : ''}</p>
    <h3 style="margin:0 0 8px;font-size:16px;color:#2d2d2d;">${title}</h3>
    ${desc ? `<p style="margin:0 0 12px;font-size:14px;color:#666;line-height:1.5;">${desc}…</p>` : ''}
    ${ev.sourceUrl ? `<a href="${ev.sourceUrl}" style="font-size:13px;color:#3a7d44;font-weight:600;">${l.more} →</a>` : ''}
  </div>
</div>`;
}

function activityCard(act, lang, l) {
  const title = act.title?.[lang] || act.title?.fr || '';
  const desc  = (act.description?.[lang] || act.description?.fr || '').slice(0, 120);
  const img   = act.imageUrl
    ? `<img src="${act.imageUrl}" alt="${title}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0;">`
    : `<div style="width:64px;height:64px;background:#e8f5e9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">🌿</div>`;

  return `
<div style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:#fff;border-radius:10px;margin-bottom:10px;border:1px solid #e8e0d0;">
  ${img}
  <div style="flex:1;min-width:0;">
    <h4 style="margin:0 0 4px;font-size:14px;color:#2d2d2d;">${title}</h4>
    ${desc ? `<p style="margin:0 0 6px;font-size:13px;color:#888;line-height:1.4;">${desc}…</p>` : ''}
    ${act.url ? `<a href="${act.url}" style="font-size:12px;color:#3a7d44;font-weight:600;">${l.discover} →</a>` : ''}
  </div>
</div>`;
}

function buildHtml(events, activities, lang, unsubUrl) {
  const l = LABELS[lang] || LABELS.fr;
  const eventsHtml = events.length
    ? events.map(ev => eventCard(ev, lang, l)).join('')
    : `<p style="color:#888;font-style:italic;">${l.noEvents}</p>`;
  const activitiesHtml = activities.map(a => activityCard(a, lang, l)).join('');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px;">
      <div style="font-size:32px;margin-bottom:8px;">🌿</div>
      <h1 style="margin:0;font-size:22px;color:#2d2d2d;">Nièvre &amp; Morvan</h1>
    </div>

    <!-- Evenementen -->
    <h2 style="font-size:18px;color:#3a7d44;margin:0 0 16px;">${l.eventsTitle}</h2>
    ${eventsHtml}
    <p style="text-align:center;margin:8px 0 32px;">
      <a href="${SITE_URL}/evenements" style="font-size:14px;color:#3a7d44;">${l.viewAll}</a>
    </p>

    <!-- Activiteiten -->
    <h2 style="font-size:18px;color:#3a7d44;margin:0 0 12px;">${l.activitiesTitle}</h2>
    ${activitiesHtml}
    <p style="text-align:center;margin:8px 0 32px;">
      <a href="${SITE_URL}/activites" style="font-size:14px;color:#3a7d44;">${l.viewAllActivities}</a>
    </p>

    <!-- Footer -->
    <div style="border-top:1px solid #ddd;padding-top:20px;text-align:center;font-size:12px;color:#999;">
      <p style="margin:0 0 8px;">${l.unsubText}</p>
      <a href="${unsubUrl}" style="color:#999;">${l.unsub}</a>
    </div>

  </div>
</body>
</html>`;
}

// ── E-mail versturen via Resend ─────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY ontbreekt');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt.slice(0, 200)}`);
  }
  return await res.json();
}

// ── Hoofd handler ──────────────────────────────────────────────────────────
export const handler = async () => {
  const startTime = Date.now();
  const db = getDb();
  const col = db.collection('morvan').doc('data').collection('subscribers');

  let sent = 0, skipped = 0;
  const errors = [];

  if (!process.env.RESEND_API_KEY) {
    console.error('[newsletter] RESEND_API_KEY ontbreekt — afbreken');
    return;
  }

  // Laad alle actieve abonnees
  const snap = await col.where('active', '==', true).get();
  console.log(`[newsletter] ${snap.docs.length} actieve abonnees`);

  for (const docSnap of snap.docs) {
    const sub = docSnap.data();
    const lang = sub.lang || 'fr';
    const l = LABELS[lang] || LABELS.fr;

    try {
      const [events, activities] = await Promise.all([
        getUpcomingEvents(db, sub.lat, sub.lng, sub.radiusKm || 50),
        getActivities(db, sub.lat, sub.lng, sub.radiusKm || 50),
      ]);

      // Stuur alleen als er minstens één evenement of activiteit is
      if (!events.length && !activities.length) { skipped++; continue; }

      const unsubUrl = `${SITE_URL}/.netlify/functions/unsubscribe?token=${sub.token}`;
      const html = buildHtml(events, activities, lang, unsubUrl);

      await sendEmail(sub.email, l.subject, html);
      await docSnap.ref.update({ lastSentAt: Timestamp.now() });
      sent++;

      console.log(`[newsletter] ✓ ${sub.email} (${events.length} events, ${activities.length} acts)`);

      // Rate limit Resend: max 2 req/sec op free tier
      await new Promise(r => setTimeout(r, 600));

    } catch (err) {
      console.error(`[newsletter] Fout bij ${sub.email}:`, err.message);
      errors.push(`${sub.email}: ${err.message}`);
    }
  }

  // Log
  await db.collection('morvan').doc('data').collection('newsletter_runs').add({
    timestamp: Timestamp.now(),
    subscribers: snap.docs.length,
    sent,
    skipped,
    errors: errors.slice(0, 20),
    durationMs: Date.now() - startTime,
  });

  console.log(`[newsletter] Klaar: ${sent} verzonden, ${skipped} overgeslagen, ${errors.length} fouten`);
};
