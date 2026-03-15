import { useState } from 'react';
import EventCard from '../components/EventCard';
import AdBanner from '../components/AdBanner';
import { useEvents } from '../hooks/useEvents';

const TYPES = ['all', 'festival', 'markt', 'sport', 'natuur', 'cultuur', 'overig'];

export default function EventsPage({ lang, tr }) {
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');
  const { events, loading } = useEvents(activeType);

  const filtered = events.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    const title = (e.title?.[lang] || e.title?.fr || '').toLowerCase();
    const loc = (e.location || '').toLowerCase();
    return title.includes(q) || loc.includes(q);
  });

  // Insert an ad every 6 cards
  const renderWithAds = () => {
    const items = [];
    filtered.forEach((e, i) => {
      items.push(<EventCard key={e.id} event={e} lang={lang} tr={tr} />);
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

      {/* Ad: top of page */}
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
        <input
          className="search-input"
          type="search"
          placeholder="🔍 Zoeken / Rechercher / Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
