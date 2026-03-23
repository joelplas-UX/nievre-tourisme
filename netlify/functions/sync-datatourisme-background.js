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

function extractLang(obj, lang) {
  if (!obj) return '';
  const val = obj[lang] || obj['fr'] || '';
  if (Array.isArray(val)) {
    const first = val[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') return first['@value'] || '';
    return '';
  }
  return typeof val === 'string' ? val : '';
}

function extractText(obj) {
  if (!obj) return { fr: '', en: '', nl: '' };
  return {
    fr: extractLang(obj, 'fr'),
    en: extractLang(obj, 'en') || extractLang(obj, 'fr'),
    nl: extractLang(obj, 'nl') || extractLang(obj, 'fr'),
  };
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

function extractContact(poi) {
  const contacts = poi.hasContact || [];
  const c = contacts[0] || {};
  return {
    phone:   c['schema:telephone'] || c.telephone || '',
    email:   c['schema:email']     || c.email     || '',
    website: Array.isArray(c['foaf:homepage'])
               ? c['foaf:homepage'][0]
               : (c['foaf:homepage'] || c.website || ''),
  };
}

function extractOpeningHours(poi) {
  const specs = poi.openingHoursSpecification || poi.hasOpeningHoursSpecification || [];
  if (!specs.length) return '';
  const first = specs[0];
  const desc = first['schema:description'] || first.description;
  if (desc) return extractLang(desc, 'fr');
  return '';
}

function mapCategory(types) {
  const t = types.join(' ').toLowerCase();
  if (/pool|beach|swimming|bathing|baignade|lac|plage/.test(t)) return 'water';
  if (/restaurant|food|wine|gastronomy|eatery|repas|cuisine/.test(t)) return 'eten';
  if (/cycling|bicycle|veloroute|velo|cycle/.test(t)) return 'fietsen';
  if (/castle|museum|cultural|heritage|religious|monument|memorial|chateau|eglise|chapel|abbaye/.test(t)) return 'kastelen';
  if (/walk|trek|hiking|natural|waterfall|peak|randonnee|nature|forest|foret/.test(t)) return 'wandelen';
  if (/sport|leisure|outdoor|loisir/.test(t)) return 'wandelen';
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
            description:  extractText(poi['dc:description']),
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
