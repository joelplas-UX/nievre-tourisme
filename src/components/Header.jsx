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

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">{tr.siteTitle}</span>
        </Link>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link${location.pathname === l.to ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <div className="lang-switcher">
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
          <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
