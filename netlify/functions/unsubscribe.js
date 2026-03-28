/**
 * GET /.netlify/functions/unsubscribe?token=xxx
 *
 * Markeert abonnee als inactief via token (nooit email/wachtwoord nodig).
 * Geeft een HTML-bevestigingspagina terug.
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

function htmlPage(title, message, lang = 'fr') {
  const backLabel = { fr: 'Retour au site', en: 'Back to website', nl: 'Terug naar de site' };
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0; background: #f5f0e8; }
    .card { background: #fff; border-radius: 16px; padding: 48px 40px; max-width: 420px;
            text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { margin: 0 0 12px; font-size: 1.4rem; color: #2d2d2d; }
    p { color: #666; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; padding: 12px 28px; background: #3a7d44; color: #fff;
        border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🌿</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${SITE_URL}">${backLabel[lang] || backLabel.fr}</a>
  </div>
</body>
</html>`;
}

export const handler = async (event) => {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return {
      statusCode: 400, headers: { 'Content-Type': 'text/html' },
      body: htmlPage('Lien invalide', 'Ce lien de désabonnement est invalide ou expiré.'),
    };
  }

  const db = getDb();
  const col = db.collection('morvan').doc('data').collection('subscribers');

  const snap = await col.where('token', '==', token).limit(1).get();

  if (snap.empty) {
    return {
      statusCode: 404, headers: { 'Content-Type': 'text/html' },
      body: htmlPage('Introuvable', 'Ce lien de désabonnement est invalide ou a déjà été utilisé.'),
    };
  }

  const sub = snap.docs[0];
  const lang = sub.data().lang || 'fr';

  await sub.ref.update({ active: false, unsubscribedAt: Timestamp.now() });

  const titles = {
    fr: 'Vous êtes désinscrit(e)',
    en: 'You have unsubscribed',
    nl: 'Je bent uitgeschreven',
  };
  const messages = {
    fr: 'Vous ne recevrez plus notre newsletter. Vous pouvez vous réinscrire à tout moment depuis notre site.',
    en: 'You will no longer receive our newsletter. You can resubscribe at any time from our website.',
    nl: 'Je ontvangt onze nieuwsbrief niet meer. Je kunt je op elk moment opnieuw aanmelden via onze website.',
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: htmlPage(titles[lang] || titles.fr, messages[lang] || messages.fr, lang),
  };
};
