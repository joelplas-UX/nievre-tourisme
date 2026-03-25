import { useState, useEffect, useRef, useCallback } from 'react';
import ActivityCard from '../components/ActivityCard';
import AdBanner from '../components/AdBanner';
import { useActivities } from '../hooks/useActivities';
import { haversineKm, geocodePostcode } from '../utils/geo';

const CATS = ['all', 'wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overnachting', 'overig'];
const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export default function ActivitiesPage({ lang, tr }) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [userPostcode, setUserPostcode] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [maxKm, setMaxKm] = useState(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const observerRef = useRef(null);
  const { activities, loading } = useActivities(activeCat);

  useEffect(() => { setVisibleCount(24); }, [activeCat, search, sortBy, userCoords, maxKm]);

  const sentinelCallback = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisibleCount(c => c + 24);
    }, { threshold: 0.1 });
    observerRef.current.observe(node);
  }, []);

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
      setMaxKm(null);
      if (sortBy === 'nearby') setSortBy('name');
    }
  }, [userPostcode]);

  const postcodeLabel =
    lang === 'fr' ? '📍 Code postal' :
    lang === 'nl' ? '📍 Postcode' :
    '📍 Postcode';

  const SORT_OPTIONS = [
    { value: 'name',          label: lang === 'fr' ? 'Nom (A–Z)' : lang === 'nl' ? 'Naam (A–Z)' : 'Name (A–Z)' },
    { value: 'postcode_asc',  label: lang === 'fr' ? 'Code postal ↑' : lang === 'nl' ? 'Postcode ↑' : 'Postcode ↑' },
    { value: 'postcode_desc', label: lang === 'fr' ? 'Code postal ↓' : lang === 'nl' ? 'Postcode ↓' : 'Postcode ↓' },
    ...(userCoords ? [{ value: 'nearby', label: lang === 'fr' ? 'Les plus proches' : lang === 'nl' ? 'Dichtstbij' : 'Nearest first' }] : []),
  ];

  const getDistance = (a) => {
    if (userCoords && a.lat && a.lng)
      return haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
    return null;
  };

  const filtered = activities
    .filter(a => a.hidden !== true)
    .filter(a => !!(a.title?.[lang] || a.title?.fr))
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      const title = (a.title?.[lang] || a.title?.fr || '').toLowerCase();
      const loc = (a.location || '').toLowerCase();
      const pc = (a.postcode || '').toLowerCase();
      return title.includes(q) || loc.includes(q) || pc.includes(q);
    })
    .filter(a => {
      if (!maxKm || !userCoords) return true;
      if (!a.lat || !a.lng) return false;
      return haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) <= maxKm;
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
      if (sortBy === 'nearby') return 0;
      return (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0);
    });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const renderWithAds = () => {
    const items = [];
    visible.forEach((a, i) => {
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
          {userCoords && (
            <select
              className="sort-select"
              value={maxKm ?? ''}
              onChange={e => setMaxKm(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">{lang === 'fr' ? 'Toute distance' : lang === 'nl' ? 'Alle afstanden' : 'Any distance'}</option>
              {RADIUS_OPTIONS.map(km => <option key={km} value={km}>≤ {km} km</option>)}
            </select>
          )}
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
        <>
          <div className="cards-grid">
            {renderWithAds()}
            {filtered.length === 0 && <p className="empty">{tr.activities.noActivities}</p>}
          </div>
          {hasMore && (
            <div ref={sentinelCallback} className="lazy-sentinel">
              <span className="lazy-loading-indicator">⏳</span>
            </div>
          )}
          {!hasMore && filtered.length > 0 && (
            <p className="lazy-end">
              {lang === 'fr' ? `${filtered.length} activités affichées` :
               lang === 'nl' ? `${filtered.length} activiteiten geladen` :
               `${filtered.length} activities loaded`}
            </p>
          )}
        </>
      )}
    </main>
  );
}
