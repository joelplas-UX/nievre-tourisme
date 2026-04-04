/**
 * sync-fas-background.js
 * Scrapt evenementen van vier FAS-platform toerismesites in de Nièvre.
 *
 * Ondersteunde sites (zelfde platform, zelfde JSON-LD structuur):
 *   - nevers-tourisme.com
 *   - morvansommetsetgrandslacs.com
 *   - tourisme.parcdumorvan.org
 *   - bourgogne-coeurdeloire.fr
 *
 * Strategie:
 *  1. Fetch agenda-HTML per site (paginering /agenda/page/N/)
 *  2. Extraheer Schema.org Event JSON-LD blokken
 *  3. Sla op in Firestore morvan/data/events met ID fas_{sitekey}_{slug}
 *     Titels/beschrijvingen in FR — enrich-functie vertaalt later naar EN/NL
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Referer': 'https://www.google.com/',
};

const FAS_SITES = [
  { key: 'nevers',      base: 'https://www.nevers-tourisme.com',          agenda: '/agenda/' },
  { key: 'morvan-sg',   base: 'https://www.morvansommetsetgrandslacs.com', agenda: '/agenda/' },
  { key: 'parc-morvan', base: 'https://tourisme.parcdumorvan.org',         agenda: '/agenda/' },
  { key: 'bourg-loire', base: 'https://www.bourgogne-coeurdeloire.fr',     agenda: '/agenda/' },
];

const MAX_PAGES   = 4;
const MAX_EVENTS  = 50; // veiligheidsgrens per run

// ── Extraheer JSON-LD Event-blokken uit HTML ──────────────────
function extractJsonLdEvents(html) {
  const events = [];
  const regex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data['@type'] === 'Event') {
        events.push(data);
      } else if (Array.isArray(data)) {
        events.push(...data.filter(d => d?.['@type'] === 'Event'));
      }
    } catch {}
  }
  return events;
}

// ── HOOFDLETTERS → Title Case ─────────────────────────────────
// FAS slaat addressLocality op in CAPS: "COSNE-COURS-SUR-LOIRE"
const LC_WORDS = new Set(['de','du','des','le','la','les','sur','sous','en','et','ou','lès','les']);
function titleCase(str) {
  if (!str) return str;
  // Splits op spaties en koppeltekens, bewaar het scheidingsteken
  return str.toLowerCase()
    .replace(/([a-zàâäéèêëîïôùûüç]+)/gi, (word, _, offset) => {
      const isFirst = offset === 0;
      if (!isFirst && LC_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}

// ── Maak stabiele Firestore ID ────────────────────────────────
function makeEventId(siteKey, ev) {
  const raw = `${siteKey}_${ev.name || ''}_${ev.startDate || ''}`;
  return 'fas_' + raw
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 80);
}

// ── Wikipedia-foto van het dorp ───────────────────────────────
async function getVillagePhoto(cityName) {
  if (!cityName) return null;
  try {
    const encoded = encodeURIComponent(cityName);
    const res = await fetch(
      `https://fr.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
      { headers: { 'User-Agent': 'NievreMorevan/1.0 (nievremorvan.com)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    return page?.thumbnail?.source || null;
  } catch { return null; }
}

// ── Datum ISO string → Date object ───────────────────────────
function parseIsoDate(str) {
  if (!str) return null;
  try { return new Date(str); } catch { return null; }
}

function extractTime(isoStr) {
  if (!isoStr || !isoStr.includes('T')) return null;
  return isoStr.slice(11, 16); // "HH:MM"
}

// ── Hoofd-handler ─────────────────────────────────────────────
export const handler = async (event) => {
  const token     = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const runRef = db.collection('morvan').doc('data').collection('scrape_runs').doc();
  let saved = 0, skipped = 0, errors = 0;
  const log = [];

  try {
    const eventsCol = db.collection('morvan').doc('data').collection('events');
    let count = 0;

    for (const site of FAS_SITES) {
      log.push(`▶ ${site.key} — ${site.base}`);

      for (let page = 1; page <= MAX_PAGES; page++) {
        if (count >= MAX_EVENTS) break;

        const pageUrl = page === 1
          ? `${site.base}${site.agenda}`
          : `${site.base}${site.agenda}page/${page}/`;

        let html;
        try {
          const res = await fetch(pageUrl, { headers: HEADERS });
          if (!res.ok) { log.push(`  Pagina ${page} HTTP ${res.status} — stop`); break; }
          html = await res.text();
        } catch (err) {
          log.push(`  Fetch fout pagina ${page}: ${err.message}`); break;
        }

        const jsonEvents = extractJsonLdEvents(html);
        if (jsonEvents.length === 0) { log.push(`  Pagina ${page}: geen events → stop`); break; }

        log.push(`  Pagina ${page}: ${jsonEvents.length} events gevonden`);

        const now     = new Date();
        const minDate = new Date(now); minDate.setDate(now.getDate() - 7);
        const maxDate = new Date(now); maxDate.setDate(now.getDate() + 90);

        for (const ev of jsonEvents) {
          if (count >= MAX_EVENTS) break;

          const docId = makeEventId(site.key, ev);
          const docRef = eventsCol.doc(docId);

          // Gemeenschappelijke velden — vroeg berekenen voor dedup-update
          const postcode = ev.location?.address?.postalCode;
          const rawCity  = ev.location?.address?.addressLocality || null;
          const city     = rawCity ? titleCase(rawCity) : null;
          const locName  = ev.location?.name ? titleCase(ev.location.name) : city;
          const address  = ev.location?.address?.streetAddress
            ? titleCase(ev.location.address.streetAddress) : null;

          // Sla over als al bestaat — update wel locatie als die ontbreekt
          const snap = await docRef.get();
          if (snap.exists) {
            const existing = snap.data();
            const updates = {};
            if (!existing.city && city) {
              updates.city = city; updates.location = locName; updates.address = address;
            }
            if (!existing.imageUrl && city) {
              const wikiPhoto = await getVillagePhoto(city);
              if (wikiPhoto) { updates.imageUrl = wikiPhoto; updates.imageSource = 'wikipedia_village'; }
            }
            if (Object.keys(updates).length) {
              updates.updatedAt = Timestamp.now();
              await docRef.update(updates);
            }
            skipped++; continue;
          }

          // Datumcontrole
          const dateObj = parseIsoDate(ev.startDate);
          if (dateObj && (dateObj < minDate || dateObj > maxDate)) { skipped++; continue; }

          // Postcode-filter voor bourgogne-coeurdeloire (dekt ook Cher)
          if (site.key === 'bourg-loire' && postcode && !postcode.startsWith('58')) {
            skipped++; continue;
          }

          const price = ev.offers?.[0]?.price != null
            ? `${ev.offers[0].price} ${ev.offers[0].priceCurrency || 'EUR'}`
            : null;

          let imageUrl = ev.image?.url || ev.image?.contentUrl
            || (typeof ev.image === 'string' ? ev.image : null);

          // Geen afbeelding in JSON-LD → Wikipedia-foto van het dorp
          if (!imageUrl && city) {
            imageUrl = await getVillagePhoto(city);
          }

          await docRef.set({
            title:       { fr: ev.name || '', en: null, nl: null },
            description: { fr: ev.description || null, en: null, nl: null },
            city,
            location:    locName || null,
            address,
            postcode:    postcode || null,
            lat:         ev.location?.geo?.latitude  ? parseFloat(ev.location.geo.latitude)  : null,
            lng:         ev.location?.geo?.longitude ? parseFloat(ev.location.geo.longitude) : null,
            date:        dateObj ? Timestamp.fromDate(dateObj) : null,
            endDate:     ev.endDate ? Timestamp.fromDate(new Date(ev.endDate)) : null,
            timeStart:   extractTime(ev.startDate),
            timeEnd:     extractTime(ev.endDate),
            type:        'overig',
            price,
            imageUrl,
            imageSource: imageUrl ? 'fas' : null,
            sourceUrl:   pageUrl,
            source:      `fas_${site.key}`,
            hidden:      false,
            createdAt:   Timestamp.now(),
            updatedAt:   Timestamp.now(),
          });

          saved++;
          count++;
        }

        await new Promise(r => setTimeout(r, 600));
      }
    }

    log.push(`Klaar: ${saved} opgeslagen, ${skipped} overgeslagen, ${errors} fouten`);
    await runRef.set({ source: 'fas', savedCount: saved, skippedCount: skipped, errorCount: errors, log, createdAt: Timestamp.now() });
    return { statusCode: 200, body: JSON.stringify({ saved, skipped, errors }) };

  } catch (err) {
    console.error('[sync-fas]', err.message);
    await runRef.set({ source: 'fas', error: err.message, log, createdAt: Timestamp.now() }).catch(() => {});
    return { statusCode: 500, body: err.message };
  }
};
