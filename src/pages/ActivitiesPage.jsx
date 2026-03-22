import { useState } from 'react';
import ActivityCard from '../components/ActivityCard';
import AdBanner from '../components/AdBanner';
import { useActivities } from '../hooks/useActivities';

const CATS = ['all', 'wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overig'];

export default function ActivitiesPage({ lang, tr }) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { activities, loading } = useActivities(activeCat);

  const SORT_OPTIONS = [
    { value: 'name',           label: lang === 'fr' ? 'Nom (A–Z)' : lang === 'nl' ? 'Naam (A–Z)' : 'Name (A–Z)' },
    { value: 'postcode_asc',   label: lang === 'fr' ? 'Code postal ↑' : lang === 'nl' ? 'Postcode ↑' : 'Postcode ↑' },
    { value: 'postcode_desc',  label: lang === 'fr' ? 'Code postal ↓' : lang === 'nl' ? 'Postcode ↓' : 'Postcode ↓' },
  ];

  const filtered = activities
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      const title = (a.title?.[lang] || a.title?.fr || '').toLowerCase();
      const loc = (a.location || '').toLowerCase();
      const pc = (a.postcode || '').toLowerCase();
      return title.includes(q) || loc.includes(q) || pc.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'postcode_asc')  return (a.postcode || '').localeCompare(b.postcode || '');
      if (sortBy === 'postcode_desc') return (b.postcode || '').localeCompare(a.postcode || '');
      const ta = a.title?.[lang] || a.title?.fr || '';
      const tb = b.title?.[lang] || b.title?.fr || '';
      return ta.localeCompare(tb, 'fr');
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
        <div className="filters-right">
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
