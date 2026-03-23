import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import AdBanner from '../components/AdBanner';
import { useEvents } from '../hooks/useEvents';
import { haversineKm, geocodePostcode } from '../utils/geo';

const TYPES = ['all', 'festival', 'muziek', 'markt', 'sport', 'natuur', 'cultuur', 'overig'];

export default function EventsPage({ lang, tr }) {
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [userPostcode, setUserPostcode] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const { events, loading } = useEvents(activeType);

  useEffect(() => {
    const clean = userPostcode.replace(/\s/g, '');
    if (clean.length === 5) {
      setGeocoding(true);
      geocodePostcode(clean)
        .then(coords => {
          setUserCoords(coords);
          if (coords) setSortBy('nearby');
        })
        .catch(() => setUserCoords(null))
        .finally(() => setGeocoding(false));
    } else {
      setUserCoords(null);
      if (sortBy === 'nearby') setSortBy('date');
    }
  }, [userPostcode]);

  const postcodeLabel =
    lang === 'fr' ? '📍 Votre code postal' :
    lang === 'nl' ? '📍 Uw postcode' :
    '📍 Your postcode';

  const getDistance = (e) => {
    if (sortBy === 'nearby' && userCoords && e.lat && e.lng) {
      return haversineKm(userCoords.lat, userCoords.lng, e.lat, e.lng);
    }
    return null;
  };

  const filtered = events
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      const title = (e.title?.[lang] || e.title?.fr || '').toLowerCase();
      const loc = (e.location || '').toLowerCase();
      return title.includes(q) || loc.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'nearby' && userCoords) {
        const da = (a.lat && a.lng) ? haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) : Infinity;
        const db = (b.lat && b.lng) ? haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng) : Infinity;
        return da - db;
      }
      // default: sort by date ascending
      const da = a.date?.toDate?.() || (a.date ? new Date(a.date) : null);
      const db = b.date?.toDate?.() || (b.date ? new Date(b.date) : null);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    })
    .sort((a, b) => {
      if (sortBy === 'nearby') return 0;
      return (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0);
    });

  const renderWithAds = () => {
    const items = [];
    filtered.forEach((e, i) => {
      const distanceKm = getDistance(e);
      items.push(<EventCard key={e.id} event={e} lang={lang} tr={tr} distanceKm={distanceKm} />);
      if ((i + 1) % 6 === 0) {
        items.push(
          <div key={`ad-${i}`} className="grid-ad">
            <AdBanner type="infeed" adSlot={import.meta.env.VITE_AD_SLOT_INFEED} />
          </div>
        );
      }
    });
    return items;
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1>{tr.events.title}</h1>
        <p>{tr.events.subtitle}</p>
      </div>

      <div className="ad-section">
        <AdBanner type="leaderboard" adSlot={import.meta.env.VITE_AD_SLOT_LEADERBOARD} />
      </div>

      <div className="filters">
        <div className="filter-chips">
          {TYPES.map(type => (
            <button
              key={type}
              className={`chip${activeType === type ? ' active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              {tr.events.filter[type]}
            </button>
          ))}
        </div>
        <div className="filters-right">
          <div className="postcode-wrap">
            <input
              className="search-input postcode-input"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder={postcodeLabel}
              value={userPostcode}
              onChange={e => setUserPostcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            />
            {geocoding && <span className="postcode-status">⏳</span>}
            {!geocoding && userCoords && <span className="postcode-status postcode-ok">✓</span>}
            {!geocoding && userPostcode.length === 5 && !userCoords && <span className="postcode-status postcode-err">✗</span>}
          </div>
          <input
            className="search-input"
            type="search"
            placeholder="🔍 Zoeken / Rechercher / Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">⏳</div>
      ) : (
        <div className="cards-grid">
          {renderWithAds()}
          {filtered.length === 0 && <p className="empty">{tr.events.noEvents}</p>}
        </div>
      )}
    </main>
  );
}
