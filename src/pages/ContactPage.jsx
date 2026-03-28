import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { usePageTitle } from '../hooks/usePageTitle';

const COPY = {
  fr: {
    title: 'Contact',
    subtitle: 'Une question, une suggestion, une erreur à signaler ? Écrivez-nous.',
    name: 'Votre nom',
    email: 'Votre adresse e-mail',
    subject: 'Sujet',
    subjects: ['Question générale', 'Signaler une erreur', 'Proposer un partenariat', 'Autre'],
    message: 'Votre message',
    submit: 'Envoyer',
    submitting: 'Envoi…',
    successTitle: '✅ Message envoyé !',
    successMsg: 'Merci pour votre message. Nous vous répondrons dans les plus brefs délais.',
    errorMsg: 'Une erreur est survenue. Veuillez réessayer.',
    required: 'Champs obligatoires',
    info: [
      { label: 'Site', value: 'nievre-morvan.fr' },
      { label: 'Région', value: 'Nièvre & Morvan, Bourgogne, France' },
      { label: 'Données', value: '<a href="/privacy">Politique de confidentialité</a>' },
    ],
  },
  en: {
    title: 'Contact',
    subtitle: 'A question, a suggestion, or something to report? Write to us.',
    name: 'Your name',
    email: 'Your email address',
    subject: 'Subject',
    subjects: ['General question', 'Report an error', 'Partnership enquiry', 'Other'],
    message: 'Your message',
    submit: 'Send',
    submitting: 'Sending…',
    successTitle: '✅ Message sent!',
    successMsg: 'Thank you for your message. We will reply as soon as possible.',
    errorMsg: 'An error occurred. Please try again.',
    required: 'Required fields',
    info: [
      { label: 'Website', value: 'nievre-morvan.fr' },
      { label: 'Region', value: 'Nièvre & Morvan, Burgundy, France' },
      { label: 'Data', value: '<a href="/privacy">Privacy Policy</a>' },
    ],
  },
  nl: {
    title: 'Contact',
    subtitle: 'Een vraag, suggestie of fout te melden? Schrijf ons.',
    name: 'Jouw naam',
    email: 'Jouw e-mailadres',
    subject: 'Onderwerp',
    subjects: ['Algemene vraag', 'Fout melden', 'Samenwerking', 'Overig'],
    message: 'Jouw bericht',
    submit: 'Versturen',
    submitting: 'Verzenden…',
    successTitle: '✅ Bericht verzonden!',
    successMsg: 'Bedankt voor je bericht. We reageren zo snel mogelijk.',
    errorMsg: 'Er is een fout opgetreden. Probeer opnieuw.',
    required: 'Verplichte velden',
    info: [
      { label: 'Website', value: 'nievre-morvan.fr' },
      { label: 'Regio', value: 'Nièvre & Morvan, Bourgondië, Frankrijk' },
      { label: 'Gegevens', value: '<a href="/privacy">Privacybeleid</a>' },
    ],
  },
};

export default function ContactPage({ lang, tr }) {
  usePageTitle(tr?.pageTitles?.contact);
  const c = COPY[lang] || COPY.fr;
  const [form, setForm] = useState({ name: '', email: '', subject: c.subjects[0], message: '' });
  const [status, setStatus] = useState('idle');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'morvan', 'data', 'contact_messages'), {
        ...form,
        lang,
        submittedAt: Timestamp.now(),
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <main className="page">
        <div className="page-header">
          <h1>{c.title}</h1>
        </div>
        <div className="section legal-content" style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <h2>{c.successTitle}</h2>
          <p>{c.successMsg}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>{c.title}</h1>
        <p className="page-subtitle">{c.subtitle}</p>
      </div>

      <div className="section contact-layout">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <label>{c.name} *
              <input value={form.name} onChange={e => set('name', e.target.value)} required />
            </label>
            <label>{c.email} *
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </label>
          </div>
          <label>{c.subject}
            <select value={form.subject} onChange={e => set('subject', e.target.value)}>
              {c.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>{c.message} *
            <textarea
              value={form.message}
              onChange={e => set('message', e.target.value)}
              required
              rows={6}
              style={{ resize: 'vertical' }}
            />
          </label>
          {status === 'error' && <p className="error">{c.errorMsg}</p>}
          <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? c.submitting : c.submit}
          </button>
          <p style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginTop: 8 }}>* {c.required}</p>
        </form>

        <aside className="contact-info">
          {c.info.map(item => (
            <div key={item.label} className="contact-info-row">
              <strong>{item.label}</strong>
              <span dangerouslySetInnerHTML={{ __html: item.value }} />
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
