/**
 * Synchroniseert activiteiten vanuit DataTourisme API voor département Nièvre (INSEE 58).
 * Background function — loopt tot 15 min, geeft 202 terug aan caller.
 *
 * Velden die worden opgeslagen:
 *   title (fr/en/nl), description (fr/en/nl), postcode, address, city,
 *   lat, lng, phone, email, url, imageUrl, category, openingHours, source
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

const BASE_URL = 'https://api.datatourisme.fr/v1';
const PAGE_SIZE = 250;
const MAX_PAGES = 20; // veiligheidsgrens (5000 records)

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extraheert een string uit een DataTourisme taalveld.
 * Ondersteunt drie formaten:
 *   1. {"fr":"...", "en":"..."}          — eenvoudig object
 *   2. [{"@language":"fr","@value":"..."}]  — JSON-LD taal-getagde array
 *   3. "plain string"                     — enkelvoudige string
 */
function extractLang(obj, lang) {
  if (!obj) return '';

  // Formaat 3: plain string
  if (typeof obj === 'string') return obj;

  // Formaat 2: array van @language-getagde objecten of strings
  if (Array.isArray(obj)) {
    // Array van {"@language":"fr","@value":"..."} objecten
    const hasLangTag = obj.some(v => v?.['@language']);
    if (hasLangTag) {
      const match = obj.find(v => v?.['@language'] === lang);
      const fallback = obj.find(v => v?.['@language'] === 'fr') || obj[0];
      const item = match || fallback;
      if (!item) return '';
      if (typeof item === 'string') return item;
      return item['@value'] || '';
    }
    // Array van plain strings
    const first = obj[0];
    if (typeof first === 'string') return first;
    if (first?.['@value']) return first['@value'];
    return '';
  }

  // Formaat 1: {fr: ..., en: ...}
  const val = obj[lang] || obj['fr'] || Object.values(obj)[0] || '';
  if (Array.isArray(val)) {
    const first = val[0];
    if (typeof first === 'string') return first;
    if (first?.['@value']) return first['@value'];
    return '';
  }
  if (typeof val === 'string') return val;
  if (val?.['@value']) return val['@value'];
  return '';
}

function extractText(obj) {
  if (!obj) return { fr: '', en: '', nl: '' };
  return {
    fr: extractLang(obj, 'fr'),
    en: extractLang(obj, 'en') || extractLang(obj, 'fr'),
    nl: extractLang(obj, 'nl') || extractLang(obj, 'fr'),
  };
}

/**
 * Haalt beschrijving op. DataTourisme plaatst deze soms direct in
 * dc:description, soms genest in hasDescription[].dc:description,
 * soms als shortDescription of summary.
 */
function extractDescription(poi) {
  // Probeer alle bekende velden op het root-niveau
  const candidates = [
    poi['dc:description'],
    poi['schema:description'],
    poi['rdfs:comment'],
    poi['shortDescription'],
    poi['summary'],
  ];
  for (const c of candidates) {
    if (!c) continue;
    const t = extractText(c);
    if (t.fr || t.en) return t;
  }

  // Genest in hasDescription array
  const descs = poi.hasDescription || [];
  for (const d of (Array.isArray(descs) ? descs : [descs])) {
    if (!d) continue;
    const nestedCandidates = [
      d['dc:description'],
      d['schema:description'],
      d['rdfs:comment'],
      d['shortDescription'],
    ];
    for (const nc of nestedCandidates) {
      if (!nc) continue;
      const t = extractText(nc);
      if (t.fr || t.en) return t;
    }
  }
  return { fr: '', en: '', nl: '' };
}

function extractPhoto(poi) {
  try {
    const reps = poi.hasRepresentation || [];
    for (const rep of reps) {
      const resources = rep['ebucore:hasRelatedResource'] || rep.hasRelatedResource || [];
      for (const res of resources) {
        let url = res['ebucore:locator'] || res.locator;
        if (Array.isArray(url)) url = url[0];
        if (url && typeof url === 'string' && url.startsWith('http')) return url;
      }
    }
  } catch {}
  return null;
}

function extractLocation(poi) {
  const locs = poi.isLocatedAt || [];
  const loc = locs[0] || {};
  const addrs = loc.address || loc['schema:address'] || [];
  const addr = addrs[0] || {};
  const geos = loc.geo || loc['schema:geo'] || [];
  const geo = geos[0] || {};

  return {
    city:     addr['schema:addressLocality'] || addr.addressLocality || '',
    postcode: addr['schema:postalCode']      || addr.postalCode      || '',
    street:   Array.isArray(addr['schema:streetAddress'])
                ? addr['schema:streetAddress'][0]
                : (addr['schema:streetAddress'] || addr.streetAddress || ''),
    lat: parseFloat(geo['schema:latitude']  || geo.latitude)  || null,
    lng: parseFloat(geo['schema:longitude'] || geo.longitude) || null,
  };
}

function scalar(v) {
  if (!v) return '';
  if (Array.isArray(v)) return v[0] || '';
  return String(v);
}

function extractContact(poi) {
  const contacts = poi.hasContact || [];
  const c = contacts[0] || {};

  // Website: ook op root-niveau zoeken
  const website =
    scalar(c['foaf:homepage'] || c['schema:url'] || c.website || c.url) ||
    scalar(poi['foaf:homepage'] || poi['schema:url'] || poi.url);

  return {
    phone:   scalar(c['schema:telephone'] || c.telephone || c.phone),
    email:   scalar(c['schema:email']     || c.email),
    website,
  };
}

const DAY_LABELS = {
  Monday: 'ma', Tuesday: 'di', Wednesday: 'wo', Thursday: 'do',
  Friday: 'vr', Saturday: 'za', Sunday: 'zo',
};

function extractOpeningHours(poi) {
  const specs = poi.openingHoursSpecification || poi.hasOpeningHoursSpecification || [];
  if (!specs.length) return '';

  const first = specs[0];

  // Probeer tekst-beschrijving (FR)
  const desc = first['schema:description'] || first.description || first['rdfs:comment'];
  if (desc) {
    const text = extractLang(desc, 'fr');
    if (text) return text;
  }

  // Bouw uit gestructureerde data: validFrom → validThrough of dagen + tijden
  try {
    const parts = [];
    for (const spec of specs.slice(0, 4)) {
      const from  = spec['schema:validFrom']  || spec.validFrom;
      const to    = spec['schema:validThrough'] || spec.validThrough;
      const opens  = spec['schema:opens']  || spec.opens;
      const closes = spec['schema:closes'] || spec.closes;
      const days   = spec['schema:dayOfWeek'] || spec.dayOfWeek || [];

      const dayStr = [].concat(days)
        .map(d => DAY_LABELS[d.split('/').pop()] || d.split('/').pop())
        .join(', ');

      let part = '';
      if (from && to) part += `${from.slice(0, 10)} – ${to.slice(0, 10)}`;
      if (dayStr) part += (part ? ' · ' : '') + dayStr;
      if (opens && closes) part += ` ${opens.slice(0, 5)}–${closes.slice(0, 5)}`;
      if (part) parts.push(part);
    }
    return parts.join(' | ');
  } catch {}
  return '';
}

function mapCategory(types) {
  // Extraheer URI-fragmenten (bv. "#Museum" → "museum") en combineer met volledige string
  const frags = types.map(t => t.split('#').pop().split('/').pop().toLowerCase());
  const t = [...frags, ...types.map(s => s.toLowerCase())].join(' ');

  if (/pool|aquatic|swimming|bathing|baignade|plage|lac\b|swimmingpool|piscine/.test(t)) return 'water';
  if (/restaurant|food|gastronomy|eatery|repas|cuisine|winebar|foodestablishment|cafeteria|brasserie|winery|vineyard|cellar|cave/.test(t)) return 'eten';
  if (/cycling|bicycle|veloroute|velo|cycle|bikepath|cycleway/.test(t)) return 'fietsen';
  if (/castle|museum|cultural|heritage|religious|monument|memorial|chateau|eglise|chapel|abbaye|culturalsite|historicmonument|sacredsite|abbey|priory|ruin/.test(t)) return 'kastelen';
  if (/walk|trek|hiking|natural|waterfall|peak|randonnee|nature|forest|foret|naturalheritage|parkandgarden|garden|park|landscape/.test(t)) return 'wandelen';
  if (/sport|leisure|outdoor|loisir|sportsandleisure|activit/.test(t)) return 'wandelen';
  return 'overig';
}

// ── Hoofd handler ──────────────────────────────────────────────────────────

export const handler = async () => {
  const db = getDb();
  const startTime = Date.now();
  let written = 0;
  let skipped = 0;
  const errors = [];

  try {
    // Haal alle handmatig bewerkte IDs op in één query (geen read per POI nodig)
    const col = db.collection('morvan').doc('data').collection('activities');
    const manualSnap = await col.where('manuallyEdited', '==', true).get();
    const manualIds = new Set(manualSnap.docs.map(d => d.id));
    console.log(`[sync-dt] ${manualIds.size} handmatig bewerkte activiteiten worden overgeslagen`);

    let page = 1;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      const params = new URLSearchParams({
        filters: 'isLocatedAt.address.hasAddressCity.isPartOfDepartment.insee=58',
        page,
        page_size: PAGE_SIZE,
        lang: 'fr,en,nl',
      });

      const res = await fetch(`${BASE_URL}/catalog?${params}`, {
        headers: { 'X-API-Key': process.env.DATATOURISME_API_KEY },
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`DataTourisme HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }

      const json = await res.json();
      const objects = json.objects || [];
      console.log(`[sync-dt] Pagina ${page}: ${objects.length} POIs (totaal: ${json.meta?.totalCount})`);

      // Debug: log structuur van eerste POI op pagina 1
      if (page === 1 && objects.length > 0) {
        const sample = objects[0];
        console.log('[sync-dt] Sample POI root keys:', Object.keys(sample).join(', '));
        console.log('[sync-dt] rdfs:label:', JSON.stringify(sample['rdfs:label'])?.slice(0, 200));
        console.log('[sync-dt] dc:description:', JSON.stringify(sample['dc:description'])?.slice(0, 200));
        console.log('[sync-dt] hasDescription:', JSON.stringify(sample.hasDescription)?.slice(0, 300));
        console.log('[sync-dt] hasContact:', JSON.stringify(sample.hasContact)?.slice(0, 300));
        console.log('[sync-dt] @type:', JSON.stringify(sample['@type']));
        // Extracted waarden
        console.log('[sync-dt] title extracted:', JSON.stringify(extractText(sample['rdfs:label'])));
        console.log('[sync-dt] desc extracted:', JSON.stringify(extractDescription(sample)));
        console.log('[sync-dt] contact extracted:', JSON.stringify(extractContact(sample)));
      }

      if (objects.length === 0 || !json.meta?.next) hasMore = false;

      // Schrijf in batches van 500 (Firestore limiet)
      const batch = db.batch();
      let batchCount = 0;

      for (const poi of objects) {
        const id = `dt_${poi.uuid}`;
        if (manualIds.has(id)) { skipped++; continue; }

        try {
          const types = poi['@type'] || [];
          const location = extractLocation(poi);
          const contact = extractContact(poi);

          batch.set(col.doc(id), {
            title:        extractText(poi['rdfs:label']),
            description:  extractDescription(poi),
            category:     mapCategory(types),
            location:     location.city,
            postcode:     location.postcode,
            address:      [location.street, location.postcode, location.city].filter(Boolean).join(', '),
            lat:          location.lat,
            lng:          location.lng,
            phone:        contact.phone,
            email:        contact.email,
            url:          contact.website,
            imageUrl:     extractPhoto(poi),
            openingHours: extractOpeningHours(poi),
            source:       'datatourisme',
            dtId:         poi.uuid,
            dtTypes:      types.slice(0, 5),
            permanent:    true,
            updatedAt:    Timestamp.now(),
          }, { merge: true });

          batchCount++;
          written++;

          if (batchCount === 499) {
            await batch.commit();
            batchCount = 0;
          }
        } catch (err) {
          errors.push(`${poi.uuid}: ${err.message}`);
        }
      }

      if (batchCount > 0) await batch.commit();
      page++;
    }
  } catch (err) {
    console.error('[sync-dt] Fatale fout:', err.message);
    errors.push(err.message);
  }

  await getDb().collection('morvan').doc('data').collection('activity_syncs').add({
    timestamp:  Timestamp.now(),
    source:     'datatourisme',
    added:      written,
    updated:    0,
    skipped,
    errors:     errors.slice(0, 20),
    durationMs: Date.now() - startTime,
  });

  console.log(`[sync-dt] Klaar: ${written} geschreven, ${skipped} overgeslagen, ${errors.length} fouten`);
};
