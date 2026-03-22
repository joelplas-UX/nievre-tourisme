import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ACTIVITY_CATEGORIES = ['wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overig'];
const EVENT_TYPES = ['festival', 'muziek', 'markt', 'sport', 'natuur', 'cultuur', 'overig'];

const EMPTY_FORM = {
  type: 'event',
  firstName: '', lastName: '', email: '',
  titleFr: '', descriptionFr: '',
  dateStart: '', dateEnd: '',
  location: '', website: '', imageUrl: '',
  eventType: 'festival',
  activityCategory: 'wandelen',
};

export default function SubmitPage({ lang, tr }) {
  const s = tr.submit;
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'morvan', 'data', 'submissions'), {
        ...form,
        status: 'pending',
        submittedAt: Timestamp.now(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
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
          <button className="btn btn-primary" onClick={() => { setSuccess(false); setForm(EMPTY_FORM); }}>
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
          {submitting ? s.submitting : s.submit}
        </button>
      </form>
    </main>
  );
}
