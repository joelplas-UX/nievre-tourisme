import { useState } from 'react';

const COPY = {
  fr: {
    title: '🌿 Newsletter hebdomadaire',
    subtitle: 'Recevez chaque semaine les événements et activités près de chez vous.',
    email: 'Votre adresse e-mail',
    postcode: 'Code postal (optionnel)',
    postcodeHint: 'Pour recevoir des suggestions près de chez vous',
    radiusLabel: 'Rayon',
    consent: 'J\'accepte de recevoir la newsletter hebdomadaire. Désabonnement possible à tout moment.',
    submit: 'S\'abonner',
    submitting: 'Inscription…',
    successTitle: '✅ Inscription confirmée !',
    successMsg: 'Vous recevrez votre premier email dès jeudi prochain.',
    alreadyMsg: 'Cette adresse est déjà inscrite.',
    reactivatedMsg: '✅ Votre abonnement a été réactivé !',
    errorMsg: 'Une erreur est survenue. Veuillez réessayer.',
  },
  en: {
    title: '🌿 Weekly newsletter',
    subtitle: 'Receive events and activities near you every week.',
    email: 'Your email address',
    postcode: 'Postcode (optional)',
    postcodeHint: 'To receive suggestions near you',
    radiusLabel: 'Radius',
    consent: 'I agree to receive the weekly newsletter. Unsubscribe at any time.',
    submit: 'Subscribe',
    submitting: 'Subscribing…',
    successTitle: '✅ Subscription confirmed!',
    successMsg: 'You\'ll receive your first email next Thursday.',
    alreadyMsg: 'This address is already subscribed.',
    reactivatedMsg: '✅ Your subscription has been reactivated!',
    errorMsg: 'An error occurred. Please try again.',
  },
  nl: {
    title: '🌿 Wekelijkse nieuwsbrief',
    subtitle: 'Ontvang elke week evenementen en activiteiten bij jou in de buurt.',
    email: 'Jouw e-mailadres',
    postcode: 'Postcode (optioneel)',
    postcodeHint: 'Voor suggesties bij jou in de buurt',
    radiusLabel: 'Straal',
    consent: 'Ik ga akkoord met het ontvangen van de wekelijkse nieuwsbrief. Afmelden kan altijd.',
    submit: 'Aanmelden',
    submitting: 'Bezig…',
    successTitle: '✅ Aanmelding bevestigd!',
    successMsg: 'Je ontvangt jouw eerste e-mail volgende donderdag.',
    alreadyMsg: 'Dit adres is al aangemeld.',
    reactivatedMsg: '✅ Jouw abonnement is opnieuw geactiveerd!',
    errorMsg: 'Er is een fout opgetreden. Probeer opnieuw.',
  },
};

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function NewsletterSignup({ lang = 'fr' }) {
  const c = COPY[lang] || COPY.fr;
  const [email, setEmail]       = useState('');
  const [postcode, setPostcode] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);
  const [consent, setConsent]   = useState(false);
  const [status, setStatus]     = useState('idle'); // idle | loading | success | already | reactivated | error
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!consent) return;
    setStatus('loading');
    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, postcode: postcode || undefined, lang, radiusKm }),
      });
      const json = await res.json();
      if (!res.ok) { setStatus('error'); return; }
      setStatus(json.status === 'already_subscribed' ? 'already'
        : json.status === 'reactivated' ? 'reactivated'
        : 'success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="newsletter-box newsletter-success">
        <h3>{c.successTitle}</h3>
        <p>{c.successMsg}</p>
      </div>
    );
  }
  if (status === 'reactivated') {
    return (
      <div className="newsletter-box newsletter-success">
        <p>{c.reactivatedMsg}</p>
      </div>
    );
  }

  return (
    <div className="newsletter-box">
      {!expanded ? (
        <button className="newsletter-teaser" onClick={() => setExpanded(true)}>
          <span>🌿</span>
          <span>{c.subtitle}</span>
          <span className="newsletter-cta-arrow">{c.submit} →</span>
        </button>
      ) : (
        <>
          <h3 className="newsletter-title">{c.title}</h3>
          <p className="newsletter-sub">{c.subtitle}</p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder={c.email}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="newsletter-input"
            />
            <div className="newsletter-optional">
              <input
                type="text"
                placeholder={c.postcode}
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
                className="newsletter-input newsletter-input--small"
                inputMode="numeric"
                maxLength={5}
              />
              <select
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                className="newsletter-input newsletter-input--small"
                title={c.radiusLabel}
              >
                {RADIUS_OPTIONS.map(r => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>
            </div>
            {postcode && (
              <p className="newsletter-hint">{c.postcodeHint}</p>
            )}
            <label className="newsletter-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                required
              />
              <span>{c.consent}</span>
            </label>
            {status === 'already' && <p className="newsletter-msg newsletter-msg--info">{c.alreadyMsg}</p>}
            {status === 'error' && <p className="newsletter-msg newsletter-msg--error">{c.errorMsg}</p>}
            <button
              type="submit"
              className="btn btn-primary newsletter-submit"
              disabled={status === 'loading' || !consent}
            >
              {status === 'loading' ? c.submitting : c.submit}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
