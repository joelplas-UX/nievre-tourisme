import { useState, useEffect } from 'react';
import ActivityCard from '../components/ActivityCard';
import AdBanner from '../components/AdBanner';
import { useActivities } from '../hooks/useActivities';
import { haversineKm, geocodePostcode } from '../utils/geo';

const CATS = ['all', 'wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overig'];

export default function ActivitiesPage({ lang, tr }) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [userPostcode, setUserPostcode] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const { activities, loading } = useActivities(activeCat);

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
      if (sortBy === 'nearby') setSortBy('name');
    }
  }, [userPostcode]);

  const postcodeLabel =
    lang === 'fr' ? '📍 Votre code postal' :
    lang === 'nl' ? '📍 Uw postcode' :
    '📍 Your postcode';

  const SORT_OPTIONS = [
    { value: 'name',          label: lang === 'fr' ? 'Nom (A–Z)' : lang === 'nl' ? 'Naam (A–Z)' : 'Name (A–Z)' },
    { value: 'postcode_asc',  label: lang === 'fr' ? 'Code postal ↑' : lang === 'nl' ? 'Postcode ↑' : 'Postcode ↑' },
    { value: 'postcode_desc', label: lang === 'fr' ? 'Code postal ↓' : lang === 'nl' ? 'Postcode ↓' : 'Postcode ↓' },
    ...(userCoords ? [{
      value: 'nearby',
      label: lang === 'fr' ? 'Les plus proches' : lang === 'nl' ? 'Dichtstbij' : 'Nearest first',
    }] : []),
  ];

  const getDistance = (a) => {
    if (sortBy === 'nearby' && userCoords && a.lat && a.lng) {
      return haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
    }
    return null;
  };

  const filtered = activities
    .filter(a => a.hidden !== true)
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      const title = (a.title?.[lang] || a.title?.fr || '').toLowerCase();
      const loc = (a.location || '').toLowerCase();
      const pc = (a.postcode || '').toLowerCase();
      return title.includes(q) || loc.includes(q) || pc.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'nearby' && userCoords) {
        const da = (a.lat && a.lng) ? haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) : Infinity;
        const db = (b.lat && b.lng) ? haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng) : Infinity;
        return da - db;
      }
      if (sortBy === 'postcode_asc')  return (a.postcode || '').localeCompare(b.postcode || '');
      if (sortBy === 'postcode_desc') return (b.postcode || '').localeCompare(a.postcode || '');
      const ta = a.title?.[lang] || a.title?.fr || '';
      const tb = b.title?.[lang] || b.title?.fr || '';
      return ta.localeCompare(tb, 'fr');
    })
    .sort((a, b) => {
      if (sortBy === 'nearby') return 0; // distance sort already handles promoted naturally
      return (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0);
    });

  const renderWithAds = () => {
    const items = [];
    filtered.forEach((a, i) => {
      const distanceKm = getDistance(a);
      items.push(<ActivityCard key={a.id} activity={a} lang={lang} tr={tr} distanceKm={distanceKm} />);
      if ((i + 1) % 8 === 0) {
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
        <h1>{tr.activities.title}</h1>
        <p>{tr.activities.subtitle}</p>
      </div>

      <div className="ad-section">
        <AdBanner type="leaderboard" adSlot={import.meta.env.VITE_AD_SLOT_LEADERBOARD} />
      </div>

      <div className="filters">
        <div className="filter-chips">
          {CATS.map(cat => (
            <button
              key={cat}
              className={`chip${activeCat === cat ? ' active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {tr.activities.filter[cat]}
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
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">⏳</div>
      ) : (
        <div className="cards-grid">
          {renderWithAds()}
          {filtered.length === 0 && <p className="empty">{tr.activities.noActivities}</p>}
        </div>
      )}
    </main>
  );
}
