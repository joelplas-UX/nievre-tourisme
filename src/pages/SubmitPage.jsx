import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { usePageTitle } from '../hooks/usePageTitle';

const ACTIVITY_CATEGORIES = ['wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overig'];
const EVENT_TYPES = ['festival', 'muziek', 'markt', 'sport', 'natuur', 'cultuur', 'overig'];
const PROMOTED_PRICE = '29,95';
const STRIPE_LINK = import.meta.env.VITE_STRIPE_PROMOTED_LINK;

const EMPTY_FORM = {
  type: 'event',
  promoted: false,
  firstName: '', lastName: '', email: '',
  titleFr: '', descriptionFr: '',
  dateStart: '', dateEnd: '',
  location: '', website: '', imageUrl: '',
  eventType: 'festival',
  activityCategory: 'wandelen',
};

export default function SubmitPage({ lang, tr }) {
  usePageTitle(tr?.pageTitles?.submit);
  const s = tr.submit;
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const promotedLabel =
    lang === 'fr' ? 'Mise en avant' :
    lang === 'nl' ? 'Gepromoot plaatsen' :
    'Featured placement';

  const promotedDesc =
    lang === 'fr'
      ? 'Votre événement ou activité apparaît en premier avec un encadré doré et un badge « Mis en avant ».'
      : lang === 'nl'
      ? 'Uw evenement of activiteit verschijnt bovenaan met een gouden rand en "Gepromoot"-badge.'
      : 'Your event or activity appears at the top with a gold border and "Featured" badge.';

  const promotedPerks =
    lang === 'fr'
      ? ['⭐ Affiché en première position', '🏅 Badge « Mis en avant »', '📅 Visible pendant toute la durée']
      : lang === 'nl'
      ? ['⭐ Bovenaan de lijst', '🏅 "Gepromoot"-badge op de kaart', '📅 Zichtbaar gedurende de looptijd']
      : ['⭐ Shown at the top of the list', '🏅 "Featured" badge on the card', '📅 Visible for the full duration'];

  const freeLabel =
    lang === 'fr' ? 'Inscription gratuite' :
    lang === 'nl' ? 'Gratis plaatsing' :
    'Free listing';

  const freeDesc =
    lang === 'fr' ? 'Nous examinerons votre proposition et la publierons si elle correspond à notre sélection.' :
    lang === 'nl' ? 'We beoordelen uw aanmelding en plaatsen deze als het past bij ons aanbod.' :
    'We will review your submission and publish it if it fits our selection.';

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const docRef = await addDoc(collection(db, 'morvan', 'data', 'submissions'), {
        ...form,
        promoted,
        paymentStatus: promoted ? 'pending' : null,
        status: 'pending',
        submittedAt: Timestamp.now(),
      });

      if (promoted && STRIPE_LINK) {
        // Redirect to Stripe with submission ID as client_reference_id
        const stripeUrl = `${STRIPE_LINK}?client_reference_id=${docRef.id}&prefilled_email=${encodeURIComponent(form.email)}`;
        window.location.href = stripeUrl;
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="page submit-page">
        <div className="submit-success">
          <div className="success-icon">✅</div>
          <h1>{s.successTitle}</h1>
          <p>{s.successMsg}</p>
          <button className="btn btn-primary" onClick={() => { setSuccess(false); setForm(EMPTY_FORM); setPromoted(false); }}>
            {s.newSubmit}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page submit-page">
      <div className="submit-header">
        <h1>{s.title}</h1>
        <p className="page-subtitle">{s.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="submit-form">

        {/* Type */}
        <fieldset className="form-fieldset">
          <legend>{s.typeLabel}</legend>
          <div className="radio-group">
            <label className={`radio-option${form.type === 'event' ? ' selected' : ''}`}>
              <input type="radio" name="type" value="event" checked={form.type === 'event'} onChange={() => set('type', 'event')} />
              📅 {s.typeEvent}
            </label>
            <label className={`radio-option${form.type === 'activity' ? ' selected' : ''}`}>
              <input type="radio" name="type" value="activity" checked={form.type === 'activity'} onChange={() => set('type', 'activity')} />
              🥾 {s.typeActivity}
            </label>
          </div>
        </fieldset>

        {/* Promoted option */}
        <fieldset className="form-fieldset">
          <legend>
            {lang === 'fr' ? 'Type de publication' : lang === 'nl' ? 'Type plaatsing' : 'Listing type'}
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className={`promote-option${!promoted ? ' selected' : ''}`} onClick={() => setPromoted(false)}>
              <input type="radio" name="promoted" checked={!promoted} onChange={() => setPromoted(false)} />
              <div className="promote-option-body">
                <div className="promote-option-title">🆓 {freeLabel}</div>
                <div className="promote-option-desc">{freeDesc}</div>
              </div>
            </label>
            <label className={`promote-option${promoted ? ' selected' : ''}`} onClick={() => setPromoted(true)}>
              <input type="radio" name="promoted" checked={promoted} onChange={() => setPromoted(true)} />
              <div className="promote-option-body">
                <div className="promote-option-title">
                  ⭐ {promotedLabel}
                  <span className="promote-price-badge">€ {PROMOTED_PRICE}</span>
                </div>
                <div className="promote-option-desc">{promotedDesc}</div>
                <ul className="promote-option-perks">
                  {promotedPerks.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </label>
          </div>
        </fieldset>

        {/* Contactgegevens */}
        <fieldset className="form-fieldset">
          <legend>{s.contactLabel}</legend>
          <div className="form-row">
            <label>{s.firstName} *
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            </label>
            <label>{s.lastName} *
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
            </label>
          </div>
          <label>{s.contactEmail} *
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
          </label>
        </fieldset>

        {/* Details */}
        <fieldset className="form-fieldset">
          <legend>{form.type === 'event' ? s.typeEvent : s.typeActivity}</legend>

          <label>{s.titleLabel} * <span className="form-hint">(français de préférence)</span>
            <input value={form.titleFr} onChange={e => set('titleFr', e.target.value)} required />
          </label>

          <label>{s.descriptionLabel}
            <textarea value={form.descriptionFr} onChange={e => set('descriptionFr', e.target.value)} rows={4} />
          </label>

          {form.type === 'event' && (
            <div className="form-row">
              <label>{s.dateStart} *
                <input type="date" value={form.dateStart} onChange={e => set('dateStart', e.target.value)} required />
              </label>
              <label>{s.dateEnd}
                <input type="date" value={form.dateEnd} onChange={e => set('dateEnd', e.target.value)} min={form.dateStart} />
              </label>
            </div>
          )}

          {form.type === 'event' && (
            <label>{s.eventType}
              <select value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{tr.events.filter[t]}</option>)}
              </select>
            </label>
          )}

          {form.type === 'activity' && (
            <label>{s.activityCategory}
              <select value={form.activityCategory} onChange={e => set('activityCategory', e.target.value)}>
                {ACTIVITY_CATEGORIES.map(c => <option key={c} value={c}>{tr.activities.filter[c]}</option>)}
              </select>
            </label>
          )}

          <label>{s.location} *
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="ex. Château-Chinon" required />
          </label>

          <label>{s.website}
            <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
          </label>

          <label>{s.imageUrl}
            <input type="url" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
          </label>
        </fieldset>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? s.submitting : promoted ? `⭐ ${s.submit} — € ${PROMOTED_PRICE}` : s.submit}
        </button>
        {promoted && (
          <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', textAlign: 'center', marginTop: 8 }}>
            {lang === 'fr' ? 'Vous serez redirigé vers la page de paiement sécurisé Stripe.' :
             lang === 'nl' ? 'U wordt doorgestuurd naar de beveiligde betaalpagina van Stripe.' :
             'You will be redirected to the secure Stripe payment page.'}
          </p>
        )}
      </form>
    </main>
  );
}
