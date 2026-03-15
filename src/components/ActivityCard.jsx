const CAT_ICONS = {
  wandelen: '🥾',
  fietsen: '🚴',
  water: '🏊',
  kastelen: '🏰',
  eten: '🍷',
  overig: '✨',
};

const DIFF_COLORS = { makkelijk: '#4caf50', gemiddeld: '#ff9800', moeilijk: '#f44336' };

export default function ActivityCard({ activity, lang, tr }) {
  const title = activity.title?.[lang] || activity.title?.fr || '';
  const desc = activity.description?.[lang] || activity.description?.fr || '';

  return (
    <article className="activity-card">
      {activity.imageUrl && (
        <div className="card-img" style={{ backgroundImage: `url(${activity.imageUrl})` }} />
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-type">{CAT_ICONS[activity.category] || '✨'} {tr.activities.filter[activity.category] || activity.category}</span>
          {activity.difficulty && (
            <span className="card-diff" style={{ color: DIFF_COLORS[activity.difficulty] }}>
              {activity.difficulty}
            </span>
          )}
        </div>
        <h3 className="card-title">{title}</h3>
        {activity.location && <p className="card-location">📍 {activity.location}</p>}
        {activity.duration && <p className="card-duration">⏱ {activity.duration}</p>}
        <p className="card-desc">{desc.slice(0, 140)}{desc.length > 140 ? '…' : ''}</p>
        {activity.url && (
          <a href={activity.url} target="_blank" rel="noreferrer" className="card-link">
            {tr.activities.discover} ↗
          </a>
        )}
      </div>
    </article>
  );
}
