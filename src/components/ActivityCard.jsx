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

function ActivityModal({ activity, lang, tr, distanceKm, onClose }) {
  const title = activity.title?.[lang] || activity.title?.fr || '';
  const desc = activity.description?.[lang] || activity.description?.fr || '';
  const isPromoted = activity.promoted === true;
  const address = activity.address || activity.location || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="activity-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Sluiten">✕</button>

        {activity.imageUrl
          ? <div className="modal-img" style={{ backgroundImage: `url(${activity.imageUrl})` }} />
          : <div className="modal-img-placeholder"><PlaceholderSVG type={activity.category || 'overig'} /></div>
        }

        <div className="modal-body">
          <div className="card-meta" style={{ marginBottom: 8 }}>
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
            </span>
          </div>

          <h2 className="modal-title">{title || '—'}</h2>

          {address && <p className="modal-location">📍 {address}</p>}

          {activity.openingHours && (
            <p className="modal-info">🕐 {activity.openingHours}</p>
          )}

          {activity.duration && (
            <p className="modal-info">⏱ {activity.duration}</p>
          )}

          {desc && <p className="modal-desc">{desc}</p>}

          <div className="modal-actions">
            {activity.phone && (
              <a href={`tel:${activity.phone}`} className="card-contact">📞 {activity.phone}</a>
            )}
            {activity.email && (
              <a href={`mailto:${activity.email}`} className="card-contact">✉️ {activity.email}</a>
            )}
            {(activity.url || activity.sourceUrl) && (
              <a href={activity.url || activity.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: 8 }}>
                {tr.activities.discover} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityCard({ activity, lang, tr, distanceKm }) {
  const [modalOpen, setModalOpen] = useState(false);
  const title = activity.title?.[lang] || activity.title?.fr || '';
  const desc = activity.description?.[lang] || activity.description?.fr || '';
  const isPromoted = activity.promoted === true;

  const address = activity.address || '';
  const city = activity.location || '';
  const showAddress = address && address !== city && address.length > city.length;

  const DESC_LIMIT = 160;

  return (
    <>
      <article
        className={`activity-card${isPromoted ? ' promoted' : ''}`}
        onClick={() => setModalOpen(true)}
        style={{ cursor: 'pointer' }}
      >
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

          <h3 className="card-title">{title || '—'}</h3>

          {showAddress
            ? <p className="card-location">📍 {address}</p>
            : city && <p className="card-location">📍 {city}</p>
          }

          {activity.openingHours && (
            <p className="card-hours">
              🕐 {activity.openingHours.slice(0, 80)}{activity.openingHours.length > 80 ? '…' : ''}
            </p>
          )}

          {desc && (
            <p className="card-desc">
              {desc.length > DESC_LIMIT ? `${desc.slice(0, DESC_LIMIT)}…` : desc}
            </p>
          )}

          <div className="card-actions" onClick={e => e.stopPropagation()}>
            {activity.phone && (
              <a href={`tel:${activity.phone}`} className="card-contact">📞 {activity.phone}</a>
            )}
            {!activity.phone && activity.email && (
              <a href={`mailto:${activity.email}`} className="card-contact">✉️ {activity.email}</a>
            )}
            <button className="card-link" onClick={() => setModalOpen(true)}>
              {lang === 'fr' ? 'Détails' : lang === 'nl' ? 'Details' : 'Details'} →
            </button>
          </div>
        </div>
      </article>

      {modalOpen && (
        <ActivityModal
          activity={activity}
          lang={lang}
          tr={tr}
          distanceKm={distanceKm}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
