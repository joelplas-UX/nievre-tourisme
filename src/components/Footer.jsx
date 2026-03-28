import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';

export default function Footer({ tr, lang }) {
  return (
    <footer className="footer">
      <div className="footer-newsletter">
        <NewsletterSignup lang={lang} />
      </div>
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">{tr.siteTitle}</span>
        </div>
        <div className="footer-links">
          <Link to="/">{tr.nav.home}</Link>
          <Link to="/evenements">{tr.nav.events}</Link>
          <Link to="/activites">{tr.nav.activities}</Link>
          <Link to="/region">{tr.nav.region}</Link>
          <Link to="/proposer" className="footer-link-highlight">{tr.nav.submit}</Link>
        </div>
        <div className="footer-meta">
          <p>✅ {tr.footer.updated}</p>
          <p className="footer-sources">{tr.footer.sources}</p>
        </div>
      </div>
    </footer>
  );
}
