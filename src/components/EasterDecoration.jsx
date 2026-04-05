/**
 * EasterDecoration — subtiele vallende Paasemojis
 * Actief van 1 april t/m 12 april 2026, daarna automatisch uitgeschakeld.
 */

const EASTER_START = new Date('2026-04-01');
const EASTER_END   = new Date('2026-04-13'); // exclusief

const EMOJIS = ['🥚','🐣','🐰','🌸','🌷','🥚','🐣','🥚','🌸','🐰'];

function isEasterPeriod() {
  const now = new Date();
  return now >= EASTER_START && now < EASTER_END;
}

export default function EasterDecoration() {
  if (!isEasterPeriod()) return null;

  return (
    <div className="easter-decoration" aria-hidden="true">
      {EMOJIS.map((emoji, i) => (
        <span
          key={i}
          className="easter-item"
          style={{
            left: `${5 + i * 9.5}%`,
            animationDelay: `${i * 1.1}s`,
            animationDuration: `${7 + (i % 4) * 1.5}s`,
            fontSize: `${1.2 + (i % 3) * 0.4}rem`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
