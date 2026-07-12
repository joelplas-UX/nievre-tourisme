import { useParams, Link, Navigate } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import EventCard from '../components/EventCard';
import { useSEO, useJsonLd, BASE_URL } from '../hooks/useSEO';
import { useEvents } from '../hooks/useEvents';
import { getPlace, PLACES, CATEGORY_LABELS } from '../data/places';

const UI = {
  fr: { back: 'Tous les lieux', practical: 'Infos pratiques', map: 'Localisation', events: 'Événements à proximité', seeAll: 'Voir tous les événements', explore: 'À découvrir aussi' },
  en: { back: 'All places', practical: 'Practical info', map: 'Location', events: 'Events nearby', seeAll: 'See all events', explore: 'Also worth discovering' },
  nl: { back: 'Alle plaatsen', practical: 'Praktische info', map: 'Locatie', events: 'Evenementen in de buurt', seeAll: 'Alle evenementen', explore: 'Ook de moeite waard' },
};

const STOPWORDS = new Set([
  'la', 'le', 'les', 'de', 'des', 'du', 'sur', 'en', 'cours', 'parc', 'naturel',
  'regional', 'canal', 'lac', 'saut', 'mont', 'morvan', 'bains', 'loire', 'saint', 'sainte',
]);

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Trefwoorden uit de slug om events op locatie te matchen (conservatief)
function matchKeywords(slug) {
  return slug.split('-').filter(w => w.length >= 4 && !STOPWORDS.has(w));
}

export default function PlaceDetailPage({ lang, tr }) {
  const { slug } = useParams();
  const place = getPlace(slug);
  const ui = UI[lang] || UI.fr;

  // Hooks moeten vóór een eventuele redirect draaien
  const { events } = useEvents('all');

  useSEO({
    title: place ? place.name[lang] || place.name.fr : undefined,
    description: place ? place.short[lang] || place.short.fr : undefined,
    path: place ? `/plaatsen/${place.slug}` : '/plaatsen',
    image: place?.image,
    lang,
    type: 'article',
  });

  useJsonLd(place ? {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.name[lang] || place.name.fr,
    description: place.short[lang] || place.short.fr,
    image: place.image,
    url: `${BASE_URL}/plaatsen/${place.slug}`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.coords.lat,
      longitude: place.coords.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Nièvre',
      addressCountry: 'FR',
    },
  } : null);

  if (!place) return <Navigate to="/plaatsen" replace />;

  const keywords = matchKeywords(place.slug);
  const nearby = keywords.length === 0 ? [] : events.filter(e => {
    const loc = normalize(e.location);
    return keywords.some(k => loc.includes(k));
  }).slice(0, 6);

  const { lat, lng } = place.coords;
  const bbox = `${(lng - 0.15).toFixed(3)}%2C${(lat - 0.1).toFixed(3)}%2C${(lng + 0.15).toFixed(3)}%2C${(lat + 0.1).toFixed(3)}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  const others = PLACES.filter(p => p.slug !== place.slug && p.category === place.category).slice(0, 3);
  const otherFallback = others.length ? others : PLACES.filter(p => p.slug !== place.slug).slice(0, 3);

  return (
    <main className="page place-detail">
      <div className="place-hero" style={{ backgroundImage: `url(${place.image})` }}>
        <div className="place-hero-overlay">
          <span className="place-hero-cat">
            {place.emoji} {CATEGORY_LABELS[place.category]?.[lang] || CATEGORY_LABELS[place.category]?.fr}
          </span>
          <h1>{place.name[lang] || place.name.fr}</h1>
        </div>
      </div>

      <div className="place-breadcrumb">
        <Link to="/plaatsen">← {ui.back}</Link>
      </div>

      <article className="place-body">
        <div
          className="place-content"
          dangerouslySetInnerHTML={{ __html: place.long[lang] || place.long.fr }}
        />

        {place.practical && (
          <aside className="place-practical">
            <h2>ℹ️ {ui.practical}</h2>
            <p>{place.practical[lang] || place.practical.fr}</p>
          </aside>
        )}
      </article>

      <section className="section">
        <h2 className="section-title">{ui.map}</h2>
        <div className="region-map-embed">
          <iframe
            title={`${ui.map} — ${place.name[lang] || place.name.fr}`}
            src={mapSrc}
            style={{ width: '100%', height: '380px', border: 0, borderRadius: '12px' }}
            loading="lazy"
          />
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="section">
          <h2 className="section-title">{ui.events}</h2>
          <div className="cards-grid">
            {nearby.map(e => (
              <EventCard key={e.id} event={e} lang={lang} tr={tr} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/evenements" className="btn btn-outline">{ui.seeAll}</Link>
          </div>
        </section>
      )}

      <div className="ad-section">
        <AdBanner type="leaderboard" adSlot={import.meta.env.VITE_AD_SLOT_LEADERBOARD} />
      </div>

      <section className="section">
        <h2 className="section-title">{ui.explore}</h2>
        <div className="cards-grid places-grid places-grid--small">
          {otherFallback.map(p => (
            <Link key={p.slug} to={`/plaatsen/${p.slug}`} className="place-card">
              <div
                className="place-card-img"
                style={{ backgroundImage: `url(${p.image})` }}
                role="img"
                aria-label={p.name[lang] || p.name.fr}
              />
              <div className="place-card-body">
                <span className="place-card-cat">
                  {p.emoji} {CATEGORY_LABELS[p.category]?.[lang] || CATEGORY_LABELS[p.category]?.fr}
                </span>
                <h3>{p.name[lang] || p.name.fr}</h3>
                <p>{p.short[lang] || p.short.fr}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
