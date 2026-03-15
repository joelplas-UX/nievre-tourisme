const TYPE_ICONS = {
  festival: '🎪',
  markt: '🛒',
  sport: '🏃',
  natuur: '🌿',
  cultuur: '🎭',
  overig: '📅',
};

export default function EventCard({ event, lang, tr }) {
  const title = event.title?.[lang] || event.title?.fr || '';
  const desc = event.description?.[lang] || event.description?.fr || '';
  const date = event.date?.toDate?.() || (event.date ? new Date(event.date) : null);

  const dateStr = date
    ? date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
        weekday: 'short', day: 'numeric', month: 'long',
      })
    : '';

  return (
    <article className="event-card">
      {event.imageUrl && (
        <div className="card-img" style={{ backgroundImage: `url(${event.imageUrl})` }} />
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-type">{TYPE_ICONS[event.type] || '📅'} {tr.events.filter[event.type] || event.type}</span>
          <span className="card-date">{dateStr}</span>
        </div>
        <h3 className="card-title">{title}</h3>
        {event.location && <p className="card-location">📍 {event.location}</p>}
        <p className="card-desc">{desc.slice(0, 140)}{desc.length > 140 ? '…' : ''}</p>
        {event.sourceUrl && (
          <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="card-link">
            {tr.events.more} ↗
          </a>
        )}
      </div>
    </article>
  );
}
