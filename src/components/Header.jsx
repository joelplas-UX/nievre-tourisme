import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LANG_LABELS = { fr: '🇫🇷 FR', en: '🇬🇧 EN', nl: '🇳🇱 NL' };

export default function Header({ lang, setLang, tr }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const nav = tr.nav;

  const links = [
    { to: '/', label: nav.home },
    { to: '/evenements', label: nav.events },
    { to: '/activites', label: nav.activities },
    { to: '/blog', label: nav.blog },
    { to: '/region', label: nav.region },
  ];

  const close = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-icon">🌿</span>
          <span className="logo-text">{tr.siteTitle}</span>
        </Link>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
          {/* Taalkeuze bovenaan mobiel menu */}
          <div className="lang-switcher lang-switcher-menu">
            {['fr', 'en', 'nl'].map(l => (
              <button
                key={l}
                className={`lang-btn${lang === l ? ' active' : ''}`}
                onClick={() => { setLang(l); close(); }}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
          <div className="nav-divider" />
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link${location.pathname === l.to ? ' active' : ''}`}
              onClick={close}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          {/* Desktop: taalknoppen in header */}
          <div className="lang-switcher lang-switcher-desktop">
            {['fr', 'en', 'nl'].map(l => (
              <button
                key={l}
                className={`lang-btn${lang === l ? ' active' : ''}`}
                onClick={() => setLang(l)}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
