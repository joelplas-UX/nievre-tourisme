/**
 * import-events.js
 * Importeert een JSON-array van evenementen in Firestore.
 *
 * Verwacht POST-body:
 *   { events: [ { title_fr, title_en, title_nl, description_fr, description_en,
 *                 description_nl, date_iso, end_date_iso, location, lat, lng,
 *                 type, source_url, image_url } ] }
 *
 * Zelfde formaat als de Claude-scraper uitvoert.
 * Beveiligd via x-admin-trigger: '1' header.
 */

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

function makeId(event) {
  const slug = (event.title_fr || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  return `${event.date_iso || 'nodate'}_${slug}`;
}

export const handler = async (event) => {
  // Auth
  if (event.headers?.['x-admin-trigger'] !== '1') {
    const token     = event.headers?.['x-cron-token'] || event.queryStringParameters?.token;
    const cronToken = process.env.CRON_SECRET_TOKEN;
    if (!cronToken || token !== cronToken) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let events;
  try {
    const body = JSON.parse(event.body || '{}');
    events = body.events;
    if (!Array.isArray(events) || events.length === 0) {
      return { statusCode: 400, body: 'Verwacht: { events: [...] }' };
    }
  } catch {
    return { statusCode: 400, body: 'Ongeldige JSON' };
  }

  const db = getDb();
  const eventsCol = db.collection('morvan').doc('data').collection('events');
  let added = 0, updated = 0, skipped = 0;
  const errors = [];

  for (const ev of events) {
    if (!ev.date_iso || !ev.title_fr) {
      skipped++;
      continue;
    }

    try {
      const id  = makeId(ev);
      const ref = eventsCol.doc(id);
      const existing = await ref.get();

      // Respecteer handmatig bewerkte events
      if (existing.exists && existing.data().manuallyEdited) {
        skipped++;
        continue;
      }

      const data = {
        title: {
          fr: ev.title_fr || '',
          en: ev.title_en || ev.title_fr || '',
          nl: ev.title_nl || ev.title_fr || '',
        },
        description: {
          fr: ev.description_fr || '',
          en: ev.description_en || '',
          nl: ev.description_nl || '',
        },
        date:    Timestamp.fromDate(new Date(ev.date_iso)),
        endDate: ev.end_date_iso ? Timestamp.fromDate(new Date(ev.end_date_iso)) : null,
        location:   ev.location   || '',
        lat:        ev.lat        || null,
        lng:        ev.lng        || null,
        type:       ev.type       || 'overig',
        sourceUrl:  ev.source_url || '',
        sourceName: ev.source_name || 'Handmatige import',
        imageUrl:   ev.image_url  || null,
        featured:   false,
        hidden:     false,
        updatedAt:  Timestamp.now(),
      };

      if (!existing.exists) {
        data.createdAt = Timestamp.now();
        added++;
      } else {
        updated++;
      }

      await ref.set(data, { merge: true });
    } catch (err) {
      errors.push(`${ev.title_fr}: ${err.message}`);
    }
  }

  // Log de import als scrape_run zodat hij in de history verschijnt
  try {
    const now = Timestamp.now();
    await db.collection('morvan').doc('data').collection('scrape_runs').add({
      timestamp:  now,
      createdAt:  now,
      source:     'handmatige_import',
      eventsFound: events.length,
      eventsAdded: added,
      eventsUpdated: updated,
      eventsSkipped: skipped,
      errors,
      durationMs: 0,
    });
  } catch { /* log mislukt, geen probleem */ }

  console.log(`[import-events] added=${added} updated=${updated} skipped=${skipped} errors=${errors.length}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ added, updated, skipped, errors }),
  };
};
