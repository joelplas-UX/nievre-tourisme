/**
 * sync-bourgondie-background.js
 * Scrapet wekelijks de agenda van bourgondietoerist.nl (Nederlandstalig).
 *
 * Belangrijk: die site bestrijkt HEEL Bourgondië. Deze functie neemt ALLEEN
 * evenementen over die in de Nièvre (departement 58) of het Morvan liggen —
 * Beaune/Dijon/Sens/Auxerre/Le Creusot/Mâcon e.d. worden overgeslagen.
 *
 * Strategie:
 *  1. Haal /agenda op (statische HTML) met browser-headers
 *  2. HTML → tekst met de gedeelde htmlToText helper
 *  3. Claude Haiku structureert + filtert op Nièvre/Morvan + vertaalt NL→FR/EN
 *  4. Sla op in Firestore morvan/data/events met stabiel ID bourgondie_{slug}
 *
 * Trigger: wekelijkse cron (donderdag 06:20 UTC) via netlify.toml
 * Auth:    x-admin-trigger:'1'  OF  x-cron-token: CRON_SECRET_TOKEN
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { htmlToText } from './_shared/scraper.js';

// ── Firebase init ──────────────────────────────────────────────
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

// ── Anthropic ──────────────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const AGENDA_URL = 'https://bourgondietoerist.nl/agenda';
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
};

// ── Extractie + Nièvre/Morvan-filter via Claude Haiku ─────────
function buildPrompt(text) {
  const today = new Date().toISOString().split('T')[0];
  return `Je bent een toerisme-data-extractor. Hieronder staat de tekst van de agenda-pagina van bourgondietoerist.nl (Nederlandstalig). Deze site bestrijkt HEEL Bourgondië.

BELANGRIJK — regio-filter:
Neem UITSLUITEND evenementen op die liggen in de Nièvre (Frans departement 58) of in het Morvan.
Bekende Nièvre/Morvan-plaatsen (niet uitputtend): Nevers, Château-Chinon, Clamecy, Decize,
Cosne-Cours-sur-Loire, Corbigny, Lormes, Luzy, Moulins-Engilbert, Saint-Honoré-les-Bains,
Château-du-Nozet, Pouilly-sur-Loire, La Charité-sur-Loire, Varzy, Lac des Settons, Saut de Gouloux,
Ouroux-en-Morvan, Montsauche-les-Settons, Bibracte/Mont Beuvray, Vézelay (thematisch bij het Morvan: TOESTAAN).
SLA OVER (buiten de regio): Beaune, Dijon, Sens, Auxerre, Chablis, Le Creusot, Autun, Mâcon,
Chalon-sur-Saône, Saint-Fargeau, Chaumont-Laguiche, Saint-Bonnet-de-Joux en alles in de departementen 21, 71 en 89 (behalve Vézelay).
Bij twijfel of een plaats in de Nièvre/Morvan ligt: NIET opnemen.

Vandaag is ${today}. Neem alleen evenementen op die op of na vandaag (nog) plaatsvinden.

Geef een JSON-array terug. Elk object heeft (gebruik null bij onbekend):
- title_nl, title_fr, title_en: string (origineel is Nederlands; vertaal naar FR en EN)
- description_nl, description_fr, description_en: string (max 300 tekens)
- date_iso: "YYYY-MM-DD"
- end_date_iso: "YYYY-MM-DD" of null
- location: string (plaats/dorp)
- lat: number of null (vul coördinaten in voor bekende Nièvre/Morvan-plaatsen)
- lng: number of null
- type: "festival"|"muziek"|"markt"|"sport"|"natuur"|"cultuur"|"overig"
- detail_slug: string of null (de slug uit de detail-URL /agenda/{slug}, bv. "festival-des-grands-lacs-du-morvan")

Regels:
- Geef ALLEEN geldige JSON terug, geen markdown, geen uitleg
- Geef [] terug als er geen Nièvre/Morvan-evenementen zijn

PAGINA-TEKST:
${text.slice(0, 50000)}`;
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  // Token-beveiliging (zelfde patroon als de andere sync-functies)
  const token = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  const isNetlifyInvoked = !!event?.headers?.['x-netlify-event'];
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1' && !isNetlifyInvoked) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  const start = Date.now();
  let saved = 0, skipped = 0;
  const log = [];

  try {
    // 1. Haal agenda-pagina op
    log.push(`Ophalen: ${AGENDA_URL}`);
    const res = await fetch(AGENDA_URL, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const text = htmlToText(html);
    log.push(`HTML ${Math.round(html.length / 1024)}KB → tekst ${Math.round(text.length / 1024)}KB`);

    // 2. Claude Haiku: structureer + filter op Nièvre/Morvan
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: buildPrompt(text) }],
    }, { timeout: 90000 });

    const raw = msg.content[0]?.text?.trim() || '[]';
    let extracted;
    try {
      extracted = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      extracted = match ? JSON.parse(match[0]) : [];
    }
    log.push(`${extracted.length} Nièvre/Morvan-evenement(en) uit Claude`);

    // 3. Schrijf naar Firestore
    const col = db.collection('morvan').doc('data').collection('events');
    const now = Timestamp.now();

    for (const ev of extracted) {
      if (!ev.date_iso || !ev.title_nl) { skipped++; continue; }

      const slug = ev.detail_slug ? slugify(ev.detail_slug) : slugify(`${ev.date_iso}-${ev.title_nl}`);
      const id = `bourgondie_${slug}`;
      const ref = col.doc(id);

      // Handmatig bewerkte events niet overschrijven
      const existing = await ref.get();
      if (existing.exists && existing.data().manuallyEdited) { skipped++; continue; }

      const dateObj = new Date(ev.date_iso);
      if (isNaN(dateObj.getTime())) { skipped++; continue; }

      const detailUrl = ev.detail_slug
        ? `https://bourgondietoerist.nl/agenda/${slugify(ev.detail_slug)}`
        : AGENDA_URL;

      const data = {
        title: {
          fr: ev.title_fr || ev.title_nl,
          en: ev.title_en || ev.title_nl,
          nl: ev.title_nl,
        },
        description: {
          fr: ev.description_fr || '',
          en: ev.description_en || '',
          nl: ev.description_nl || '',
        },
        date:       Timestamp.fromDate(dateObj),
        endDate:    ev.end_date_iso ? Timestamp.fromDate(new Date(ev.end_date_iso)) : null,
        location:   ev.location || '',
        lat:        ev.lat ?? null,
        lng:        ev.lng ?? null,
        type:       ev.type || 'overig',
        sourceUrl:  detailUrl,
        sourceName: 'Bourgondië Toerist',
        source:     'bourgondie',
        imageUrl:   null,
        featured:   false,
        hidden:     false,
        updatedAt:  now,
      };
      if (!existing.exists) data.createdAt = now;

      await ref.set(data, { merge: true });
      if (existing.exists) skipped++; else saved++;
    }

    log.push(`Klaar: ${saved} nieuw, ${skipped} overgeslagen`);
    await runRef.set({
      timestamp:  now,
      createdAt:  now,
      source:     'bourgondie',
      eventsFound: extracted.length,
      eventsAdded: saved,
      savedCount: saved,
      skippedCount: skipped,
      log,
      durationMs: Date.now() - start,
    });

    return { statusCode: 200, body: JSON.stringify({ saved, skipped }) };

  } catch (err) {
    console.error('[sync-bourgondie]', err.message);
    await runRef.set({
      source: 'bourgondie',
      error:  err.message,
      log,
      createdAt: Timestamp.now(),
    }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
