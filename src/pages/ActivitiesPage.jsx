import { useState } from 'react';
import ActivityCard from '../components/ActivityCard';
import AdBanner from '../components/AdBanner';
import { useActivities } from '../hooks/useActivities';

const CATS = ['all', 'wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overig'];

export default function ActivitiesPage({ lang, tr }) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const { activities, loading } = useActivities(activeCat);

  const filtered = activities.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    const title = (a.title?.[lang] || a.title?.fr || '').toLowerCase();
    return title.includes(q);
  });

  const renderWithAds = () => {
    const items = [];
    filtered.forEach((a, i) => {
      items.push(<ActivityCard key={a.id} activity={a} lang={lang} tr={tr} />);
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
          {filtered.length === 0 && <p className="empty">{tr.activities.noActivities}</p>}
        </div>
      )}
    </main>
  );
}
