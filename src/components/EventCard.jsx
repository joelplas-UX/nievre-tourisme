import PlaceholderSVG from './PlaceholderSVG';

const TYPE_ICONS = {
  festival: '🎪',
  markt: '🛒',
  sport: '🏃',
  natuur: '🌿',
  cultuur: '🎭',
  muziek: '🎵',
  overig: '📅',
};

function formatDate(d, lang) {
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function EventCard({ event, lang, tr }) {
  const title = event.title?.[lang] || event.title?.fr || '';
  const desc = event.description?.[lang] || event.description?.fr || '';
  const date = event.date?.toDate?.() || (event.date ? new Date(event.date) : null);
  const endDate = event.endDate?.toDate?.() || (event.endDate ? new Date(event.endDate) : null);

  const isMultiDay = date && endDate && !isSameDay(date, endDate);

  const dateStr = date
    ? isMultiDay
      ? `${formatDate(date, lang)} → ${formatDate(endDate, lang)}`
      : formatDate(date, lang)
    : '';

  return (
    <article className={`event-card${isMultiDay ? ' event-card--multiday' : ''}`}>
      {event.imageUrl
        ? <div className="card-img" style={{ backgroundImage: `url(${event.imageUrl})` }} />
        : <PlaceholderSVG type={event.type || 'overig'} />
      }
      <div className="card-body">
        <div className="card-meta">
          <span className="card-type">{TYPE_ICONS[event.type] || '📅'} {tr.events.filter[event.type] || event.type}</span>
          <span className="card-date">
            {isMultiDay && <span className="card-multiday-badge">meerdere dagen</span>}
            {dateStr}
          </span>
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
