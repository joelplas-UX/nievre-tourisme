import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import AdBanner from '../components/AdBanner';
import { useEvents } from '../hooks/useEvents';
import { haversineKm, geocodePostcode } from '../utils/geo';

const TYPES = ['all', 'festival', 'muziek', 'markt', 'sport', 'natuur', 'cultuur', 'overig'];
const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

function getTimeFilters(lang) {
  const now = new Date();
  const today = new Date(now); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

  // Dit weekend: aankomende za/zo
  const dow = today.getDay(); // 0=zo,6=za
  const daysToSat = dow === 6 ? 0 : (6 - dow);
  const sat = new Date(today); sat.setDate(today.getDate() + daysToSat);
  const sun = new Date(sat); sun.setDate(sat.getDate() + 1);

  // Deze week: ma t/m zo
  const daysToMon = dow === 0 ? -6 : 1 - dow;
  const weekStart = new Date(today); weekStart.setDate(today.getDate() + daysToMon);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

  const labels = {
    fr: { all: 'Tous', today: "Aujourd'hui", tomorrow: 'Demain', dayafter: 'Après-demain', weekend: 'Ce week-end', week: 'Cette semaine' },
    en: { all: 'All', today: 'Today', tomorrow: 'Tomorrow', dayafter: 'Day after tomorrow', weekend: 'This weekend', week: 'This week' },
    nl: { all: 'Alles', today: 'Vandaag', tomorrow: 'Morgen', dayafter: 'Overmorgen', weekend: 'Dit weekend', week: 'Deze week' },
  };
  const l = labels[lang] || labels.en;

  return [
    { value: 'all',      label: l.all,      from: null,     to: null },
    { value: 'today',    label: l.today,    from: today,    to: today },
    { value: 'tomorrow', label: l.tomorrow, from: tomorrow, to: tomorrow },
    { value: 'dayafter', label: l.dayafter, from: dayAfter, to: dayAfter },
    { value: 'weekend',  label: l.weekend,  from: sat,      to: sun },
    { value: 'week',     label: l.week,     from: weekStart,to: weekEnd },
  ];
}

function eventMatchesTime(event, timeFilter) {
  if (!timeFilter || timeFilter.value === 'all') return true;
  const eDate = event.date?.toDate?.() || (event.date ? new Date(event.date) : null);
  const eEnd  = event.endDate?.toDate?.() || eDate;
  if (!eDate) return false;
  const eStart = new Date(eDate); eStart.setHours(0,0,0,0);
  const eEndDay = new Date(eEnd); eEndDay.setHours(0,0,0,0);
  const from = timeFilter.from;
  const to   = timeFilter.to;
  // Event overlapt met het gevraagde tijdvak
  return eStart <= to && eEndDay >= from;
}

export default function EventsPage({ lang, tr }) {
  const [activeType, setActiveType] = useState('all');
  const [timeKey, setTimeKey] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [userPostcode, setUserPostcode] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [maxKm, setMaxKm] = useState(null);
  const { events, loading } = useEvents(activeType);

  const timeFilters = getTimeFilters(lang);
  const activeTimeFilter = timeFilters.find(f => f.value === timeKey);

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
      if (sortBy === 'nearby') setSortBy('date');
    }
  }, [userPostcode]);

  const postcodeLabel =
    lang === 'fr' ? '📍 Code postal' :
    lang === 'nl' ? '📍 Postcode' :
    '📍 Postcode';

  const getDistance = (e) => {
    if (userCoords && e.lat && e.lng)
      return haversineKm(userCoords.lat, userCoords.lng, e.lat, e.lng);
    return null;
  };

  const filtered = events
    .filter(e => !!(e.title?.[lang] || e.title?.fr))
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      const title = (e.title?.[lang] || e.title?.fr || '').toLowerCase();
      const loc = (e.location || '').toLowerCase();
      return title.includes(q) || loc.includes(q);
    })
    .filter(e => eventMatchesTime(e, activeTimeFilter))
    .filter(e => {
      if (!maxKm || !userCoords) return true;
      if (!e.lat || !e.lng) return false;
      return haversineKm(userCoords.lat, userCoords.lng, e.lat, e.lng) <= maxKm;
    })
    .sort((a, b) => {
      if (sortBy === 'nearby' && userCoords) {
        const da = (a.lat && a.lng) ? haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) : Infinity;
        const db = (b.lat && b.lng) ? haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng) : Infinity;
        return da - db;
      }
      const today = new Date(); today.setHours(0,0,0,0);
      const startA = a.date?.toDate?.() || (a.date ? new Date(a.date) : null);
      const startB = b.date?.toDate?.() || (b.date ? new Date(b.date) : null);
      const endA = a.endDate?.toDate?.() || startA;
      const endB = b.endDate?.toDate?.() || startB;
      // Lopend meerdaags (gestart vóór vandaag, eindigt na vandaag) → na toekomstige events
      const ongoingA = startA && startA < today && endA >= today;
      const ongoingB = startB && startB < today && endB >= today;
      if (ongoingA && !ongoingB) return 1;
      if (ongoingB && !ongoingA) return -1;
      if (ongoingA && ongoingB) return endA - endB;
      if (!startA && !startB) return 0;
      if (!startA) return 1;
      if (!startB) return -1;
      return startA - startB;
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
        <div className="filter-chips" style={{ marginTop: 8 }}>
          {timeFilters.map(f => (
            <button
              key={f.value}
              className={`chip chip--time${timeKey === f.value ? ' active' : ''}`}
              onClick={() => setTimeKey(f.value)}
            >
              {f.label}
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
