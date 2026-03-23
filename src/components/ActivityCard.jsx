import { useState } from 'react';
import PlaceholderSVG from './PlaceholderSVG';

const CAT_ICONS = {
  wandelen: '🥾',
  fietsen: '🚴',
  water: '🏊',
  kastelen: '🏰',
  eten: '🍷',
  overig: '✨',
};

export default function ActivityCard({ activity, lang, tr, distanceKm }) {
  const [expanded, setExpanded] = useState(false);
  const title = activity.title?.[lang] || activity.title?.fr || '';
  const desc = activity.description?.[lang] || activity.description?.fr || '';
  const isPromoted = activity.promoted === true;

  // Show full address if it has more info than just the city
  const address = activity.address || '';
  const city = activity.location || '';
  const showAddress = address && address !== city && address.length > city.length;

  const DESC_LIMIT = 200;
  const descTruncated = desc.length > DESC_LIMIT && !expanded;

  return (
    <article className={`activity-card${isPromoted ? ' promoted' : ''}`}>
      {activity.imageUrl
        ? <div className="card-img" style={{ backgroundImage: `url(${activity.imageUrl})` }} />
        : <PlaceholderSVG type={activity.category || 'overig'} />
      }
      <div className="card-body">
        <div className="card-meta">
          <span className="card-type">
            {CAT_ICONS[activity.category] || '✨'} {tr.activities.filter[activity.category] || activity.category}
          </span>
          <span className="card-meta-right">
            {isPromoted && <span className="card-promoted-badge">⭐ Gepromoot</span>}
            {distanceKm != null && (
              <span className="card-distance">
                {distanceKm < 1 ? '<1 km' : `${Math.round(distanceKm)} km`}
              </span>
            )}
            {activity.postcode && (
              <span className="card-postcode">{activity.postcode}</span>
            )}
          </span>
        </div>

        <h3 className="card-title">{title}</h3>

        {showAddress
          ? <p className="card-location">📍 {address}</p>
          : city && <p className="card-location">📍 {city}</p>
        }

        {activity.openingHours && (
          <p className="card-hours">
            🕐 {activity.openingHours.slice(0, 100)}{activity.openingHours.length > 100 ? '…' : ''}
          </p>
        )}

        {activity.duration && (
          <p className="card-duration">⏱ {activity.duration}</p>
        )}

        {desc && (
          <p className="card-desc">
            {descTruncated ? `${desc.slice(0, DESC_LIMIT)}…` : desc}
            {desc.length > DESC_LIMIT && (
              <button className="card-expand-btn" onClick={() => setExpanded(v => !v)}>
                {expanded
                  ? (lang === 'fr' ? ' Moins' : lang === 'nl' ? ' Minder' : ' Less')
                  : (lang === 'fr' ? ' Lire plus' : lang === 'nl' ? ' Meer lezen' : ' Read more')}
              </button>
            )}
          </p>
        )}

        <div className="card-actions">
          {activity.phone && (
            <a href={`tel:${activity.phone}`} className="card-contact">📞 {activity.phone}</a>
          )}
          {!activity.phone && activity.email && (
            <a href={`mailto:${activity.email}`} className="card-contact">✉️ {activity.email}</a>
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
