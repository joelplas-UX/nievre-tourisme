import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cookie_consent'; // 'all' | 'necessary' | null

const COPY = {
  fr: {
    title: '🍪 Nous utilisons des cookies',
    text: 'Ce site utilise des cookies nécessaires à son fonctionnement et, avec votre consentement, des cookies publicitaires (Google AdSense). Vos données sont traitées conformément à notre',
    privacy: 'politique de confidentialité',
    acceptAll: 'Tout accepter',
    necessary: 'Nécessaire uniquement',
    manage: 'Gérer',
    manageTitle: 'Gérer mes préférences',
    cats: [
      { key: 'necessary', label: 'Cookies nécessaires', desc: 'Langue, consentement. Indispensables au fonctionnement.', locked: true },
      { key: 'ads', label: 'Cookies publicitaires', desc: 'Google AdSense — publicités personnalisées. Désactivable.', locked: false },
    ],
    save: 'Enregistrer mes préférences',
    cookieSettings: 'Gérer les cookies',
  },
  en: {
    title: '🍪 We use cookies',
    text: 'This site uses cookies essential to its operation and, with your consent, advertising cookies (Google AdSense). Your data is processed in accordance with our',
    privacy: 'privacy policy',
    acceptAll: 'Accept all',
    necessary: 'Necessary only',
    manage: 'Manage',
    manageTitle: 'Manage my preferences',
    cats: [
      { key: 'necessary', label: 'Necessary cookies', desc: 'Language, consent. Essential for the site to work.', locked: true },
      { key: 'ads', label: 'Advertising cookies', desc: 'Google AdSense — personalised ads. Can be disabled.', locked: false },
    ],
    save: 'Save my preferences',
    cookieSettings: 'Manage cookies',
  },
  nl: {
    title: '🍪 Wij gebruiken cookies',
    text: 'Deze site gebruikt cookies die noodzakelijk zijn voor het functioneren en, met jouw toestemming, advertentiecookies (Google AdSense). Je gegevens worden verwerkt conform ons',
    privacy: 'privacybeleid',
    acceptAll: 'Alles accepteren',
    necessary: 'Alleen noodzakelijk',
    manage: 'Beheren',
    manageTitle: 'Mijn voorkeuren beheren',
    cats: [
      { key: 'necessary', label: 'Noodzakelijke cookies', desc: 'Taal, toestemming. Onmisbaar voor het functioneren.', locked: true },
      { key: 'ads', label: 'Advertentiecookies', desc: 'Google AdSense — gepersonaliseerde advertenties. Uitschakelbaar.', locked: false },
    ],
    save: 'Voorkeuren opslaan',
    cookieSettings: 'Cookies beheren',
  },
};

export default function CookieBanner({ lang }) {
  const c = COPY[lang] || COPY.fr;
  const [consent, setConsent] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [showBanner, setShowBanner] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);

  // Toon banner alleen als nog geen keuze gemaakt
  useEffect(() => {
    if (!consent) setShowBanner(true);
  }, [consent]);

  function accept(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    setConsent(choice);
    setShowBanner(false);
    setShowManage(false);
  }

  function saveManage() {
    accept(adsEnabled ? 'all' : 'necessary');
  }

  // Knop onderaan pagina om banner opnieuw te tonen
  if (!showBanner && !showManage) {
    return (
      <button
        className="cookie-settings-btn"
        onClick={() => setShowManage(true)}
        aria-label={c.cookieSettings}
      >
        🍪
      </button>
    );
  }

  return (
    <>
      {/* Overlay voor manage-dialoog */}
      {showManage && (
        <div className="cookie-overlay" onClick={() => setShowManage(false)}>
          <div className="cookie-modal" onClick={e => e.stopPropagation()}>
            <h3>{c.manageTitle}</h3>
            <div className="cookie-cats">
              {c.cats.map(cat => (
                <div key={cat.key} className="cookie-cat">
                  <div className="cookie-cat-info">
                    <strong>{cat.label}</strong>
                    <span>{cat.desc}</span>
                  </div>
                  <label className={`cookie-toggle${cat.locked ? ' locked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={cat.locked ? true : adsEnabled}
                      disabled={cat.locked}
                      onChange={e => !cat.locked && setAdsEnabled(e.target.checked)}
                    />
                    <span className="cookie-toggle-track" />
                  </label>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={saveManage} style={{ width: '100%', marginTop: 16 }}>
              {c.save}
            </button>
          </div>
        </div>
      )}

      {/* Banner onderaan */}
      {showBanner && !showManage && (
        <div className="cookie-banner" role="dialog" aria-label={c.title}>
          <div className="cookie-banner-inner">
            <div className="cookie-banner-text">
              <strong>{c.title}</strong>
              <p>
                {c.text}{' '}
                <Link to="/privacy" className="cookie-privacy-link">{c.privacy}</Link>.
              </p>
            </div>
            <div className="cookie-banner-actions">
              <button className="btn btn-outline cookie-btn-sm" onClick={() => accept('necessary')}>
                {c.necessary}
              </button>
              <button className="btn btn-outline cookie-btn-sm" onClick={() => setShowManage(true)}>
                {c.manage}
              </button>
              <button className="btn btn-primary cookie-btn-sm" onClick={() => accept('all')}>
                {c.acceptAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
