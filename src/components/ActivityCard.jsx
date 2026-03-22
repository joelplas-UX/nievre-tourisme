import PlaceholderSVG from './PlaceholderSVG';

const CAT_ICONS = {
  wandelen: '🥾',
  fietsen: '🚴',
  water: '🏊',
  kastelen: '🏰',
  eten: '🍷',
  overig: '✨',
};

export default function ActivityCard({ activity, lang, tr }) {
  const title = activity.title?.[lang] || activity.title?.fr || '';
  const desc = activity.description?.[lang] || activity.description?.fr || '';

  return (
    <article className="activity-card">
      {activity.imageUrl
        ? <div className="card-img" style={{ backgroundImage: `url(${activity.imageUrl})` }} />
        : <PlaceholderSVG type={activity.category || 'overig'} />
      }
      <div className="card-body">
        <div className="card-meta">
          <span className="card-type">
            {CAT_ICONS[activity.category] || '✨'} {tr.activities.filter[activity.category] || activity.category}
          </span>
          {activity.postcode && (
            <span className="card-postcode">{activity.postcode}</span>
          )}
        </div>

        <h3 className="card-title">{title}</h3>

        {activity.location && (
          <p className="card-location">📍 {activity.location}</p>
        )}
        {activity.duration && (
          <p className="card-duration">⏱ {activity.duration}</p>
        )}
        {activity.openingHours && (
          <p className="card-hours">🕐 {activity.openingHours.slice(0, 80)}{activity.openingHours.length > 80 ? '…' : ''}</p>
        )}
        {desc && (
          <p className="card-desc">{desc.slice(0, 140)}{desc.length > 140 ? '…' : ''}</p>
        )}

        <div className="card-actions">
          {activity.phone && (
            <a href={`tel:${activity.phone}`} className="card-contact">📞 {activity.phone}</a>
          )}
          {(activity.url || activity.sourceUrl) && (
            <a href={activity.url || activity.sourceUrl} target="_blank" rel="noreferrer" className="card-link">
              {tr.activities.discover} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
