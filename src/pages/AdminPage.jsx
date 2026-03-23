import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, getDocs, orderBy, query, limit,
  doc, updateDoc, addDoc, setDoc, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const DEFAULT_SOURCES = [
  { name: 'Nièvre Tourisme',              url: 'https://www.nievre-tourisme.com/agenda/',          enabled: true },
  { name: 'La Nièvre naturellement',      url: 'https://www.lanievrenaturellement.com/agenda/',    enabled: true },
  { name: 'Agenda Culturel 58',           url: 'https://58.agendaculturel.fr',                     enabled: true },
  { name: 'Tourisme Pays du Roi Morvan',  url: 'https://www.tourismepaysroimorvan.com/agenda/',    enabled: true },
  { name: 'Rives du Morvan',              url: 'https://www.rivesdumorvan.fr/agenda/',             enabled: true },
  { name: 'Coeur de Nièvre',             url: 'https://www.tourismecoeurdenievre.com/agenda/',    enabled: true },
];

const EMPTY_EVENT = {
  title_fr: '', title_en: '', title_nl: '',
  description_fr: '',
  date: '', endDate: '',
  location: '', type: 'festival',
  sourceUrl: '', imageUrl: '',
};

const EMPTY_ACTIVITY = {
  title_fr: '', title_en: '', title_nl: '',
  description_fr: '',
  category: 'wandelen', location: '', url: '', duration: '', imageUrl: '',
};

const EVENT_TYPES = ['festival', 'muziek', 'markt', 'sport', 'natuur', 'cultuur', 'overig'];
const ACTIVITY_CATEGORIES = ['wandelen', 'fietsen', 'water', 'kastelen', 'eten', 'overig'];

function makeEventId(titleFr, dateStr) {
  const slug = (titleFr || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  return `${dateStr || 'nodate'}_${slug}`;
}

export default function AdminPage({ lang, tr }) {
  const a = tr.admin;

  // Auth
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Scraping
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [runs, setRuns] = useState([]);

  // Sources
  const [sources, setSources] = useState([]);
  const [newSource, setNewSource] = useState({ name: '', url: '' });
  const [sourcesLoading, setSourcesLoading] = useState(false);

  // Events
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState(EMPTY_EVENT);
  const [showEventForm, setShowEventForm] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  // Activities
  const [newActivity, setNewActivity] = useState(EMPTY_ACTIVITY);
  const [syncingActivities, setSyncingActivities] = useState(false);
  const [syncingDT, setSyncingDT] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [activitySyncs, setActivitySyncs] = useState([]);

  // Submissions
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Tab
  const [tab, setTab] = useState('scraping');

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      if (u && u.email === ADMIN_EMAIL) setUser(u);
      else setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadData();
    loadSources();
    loadSubmissions();
  }, [user]);

  async function loadData() {
    const runsSnap = await getDocs(query(
      collection(db, 'morvan', 'data', 'scrape_runs'),
      orderBy('timestamp', 'desc'), limit(5)
    ));
    setRuns(runsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const eventsSnap = await getDocs(
      collection(db, 'morvan', 'data', 'events')
    );
    const evData = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    evData.sort((a, b) => (a.date?.toMillis?.() ?? 0) - (b.date?.toMillis?.() ?? 0));
    setEvents(evData);

    const syncsSnap = await getDocs(query(
      collection(db, 'morvan', 'data', 'activity_syncs'),
      orderBy('timestamp', 'desc'), limit(10)
    ));
    setActivitySyncs(syncsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function loadSources() {
    setSourcesLoading(true);
    const snap = await getDocs(collection(db, 'morvan', 'data', 'scrape_sources'));
    if (snap.empty) {
      for (const s of DEFAULT_SOURCES) {
        await addDoc(collection(db, 'morvan', 'data', 'scrape_sources'), { ...s, createdAt: Timestamp.now() });
      }
      const snap2 = await getDocs(collection(db, 'morvan', 'data', 'scrape_sources'));
      setSources(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      setSources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    setSourcesLoading(false);
  }

  async function loadSubmissions() {
    setSubmissionsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'morvan', 'data', 'submissions'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.submittedAt?.toMillis?.() ?? 0) - (a.submittedAt?.toMillis?.() ?? 0));
      setSubmissions(data);
    } catch (err) {
      console.error('Submissions laden mislukt:', err.message);
    }
    setSubmissionsLoading(false);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  // ── Scraping ─────────────────────────────────────────────────────────────
  async function handleScrape() {
    setScraping(true);
    setScrapeMsg('');
    try {
      const res = await fetch('/.netlify/functions/trigger-scrape-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setScrapeMsg('✅ Scraping gestart! Resultaten verschijnen over 2–5 minuten.');
      } else {
        setScrapeMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 60000);
    } catch (err) {
      setScrapeMsg('Fout: ' + err.message);
    } finally {
      setScraping(false);
    }
  }

  // ── Sources ───────────────────────────────────────────────────────────────
  async function toggleSource(id, enabled) {
    await updateDoc(doc(db, 'morvan', 'data', 'scrape_sources', id), { enabled: !enabled });
    setSources(s => s.map(x => x.id === id ? { ...x, enabled: !enabled } : x));
  }

  async function deleteSource(id) {
    if (!confirm('Bron verwijderen?')) return;
    await deleteDoc(doc(db, 'morvan', 'data', 'scrape_sources', id));
    setSources(s => s.filter(x => x.id !== id));
  }

  async function addSource(e) {
    e.preventDefault();
    if (!newSource.name || !newSource.url) return;
    const ref = await addDoc(collection(db, 'morvan', 'data', 'scrape_sources'), {
      name: newSource.name, url: newSource.url, enabled: true, createdAt: Timestamp.now(),
    });
    setSources(s => [...s, { id: ref.id, ...newSource, enabled: true }]);
    setNewSource({ name: '', url: '' });
  }

  // ── Events ────────────────────────────────────────────────────────────────
  async function toggleEvent(id, hidden) {
    await updateDoc(doc(db, 'morvan', 'data', 'events', id), { hidden: !hidden });
    setEvents(ev => ev.map(e => e.id === id ? { ...e, hidden: !hidden } : e));
  }

  async function togglePromoted(id, promoted) {
    await updateDoc(doc(db, 'morvan', 'data', 'events', id), { promoted: !promoted });
    setEvents(ev => ev.map(e => e.id === id ? { ...e, promoted: !promoted } : e));
  }

  async function saveEvent(e) {
    e.preventDefault();
    setSavingEvent(true);
    try {
      const id = makeEventId(newEvent.title_fr, newEvent.date);
      await setDoc(doc(db, 'morvan', 'data', 'events', id), {
        title: { fr: newEvent.title_fr, en: newEvent.title_en || newEvent.title_fr, nl: newEvent.title_nl || newEvent.title_fr },
        description: { fr: newEvent.description_fr, en: '', nl: '' },
        date: Timestamp.fromDate(new Date(newEvent.date)),
        endDate: newEvent.endDate ? Timestamp.fromDate(new Date(newEvent.endDate)) : null,
        location: newEvent.location,
        lat: null, lng: null,
        type: newEvent.type,
        sourceUrl: newEvent.sourceUrl,
        sourceName: 'Handmatig',
        imageUrl: newEvent.imageUrl || null,
        featured: false, hidden: false,
        manuallyEdited: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setNewEvent(EMPTY_EVENT);
      setShowEventForm(false);
      await loadData();
    } catch (err) {
      alert('Fout: ' + err.message);
    } finally {
      setSavingEvent(false);
    }
  }

  // ── Activities ────────────────────────────────────────────────────────────
  async function addActivity(e) {
    e.preventDefault();
    await addDoc(collection(db, 'morvan', 'data', 'activities'), {
      title: { fr: newActivity.title_fr, en: newActivity.title_en || newActivity.title_fr, nl: newActivity.title_nl || newActivity.title_fr },
      description: { fr: newActivity.description_fr || '', en: '', nl: '' },
      category: newActivity.category,
      location: newActivity.location,
      url: newActivity.url,
      duration: newActivity.duration,
      imageUrl: newActivity.imageUrl || null,
      permanent: true,
      manuallyEdited: true,
      createdAt: Timestamp.now(),
    });
    setNewActivity(EMPTY_ACTIVITY);
    alert('Activiteit toegevoegd!');
  }

  async function handleSyncActivities() {
    setSyncingActivities(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/sync-activities-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('✅ OpenStreetMap sync gestart! Activiteiten verschijnen over 2–5 minuten.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 120000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setSyncingActivities(false);
    }
  }

  async function handleSyncDT() {
    setSyncingDT(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/sync-datatourisme-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('✅ DataTourisme sync gestart! Dit kan 5–10 minuten duren — alle activiteiten in de Nièvre worden geladen.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 300000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setSyncingDT(false);
    }
  }

  async function handleEnrich() {
    setEnriching(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/enrich-activities-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('✨ AI-verrijking gestart! Titels, beschrijvingen en afbeeldingen worden gegenereerd. Ververs de log over 5–10 minuten.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 360000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setEnriching(false);
    }
  }

  // ── Submissions ───────────────────────────────────────────────────────────
  async function approveAsEvent(sub) {
    const id = makeEventId(sub.titleFr, sub.dateStart);
    await setDoc(doc(db, 'morvan', 'data', 'events', id), {
      title: { fr: sub.titleFr, en: sub.titleFr, nl: sub.titleFr },
      description: { fr: sub.descriptionFr || '', en: '', nl: '' },
      date: sub.dateStart ? Timestamp.fromDate(new Date(sub.dateStart)) : Timestamp.now(),
      endDate: sub.dateEnd ? Timestamp.fromDate(new Date(sub.dateEnd)) : null,
      location: sub.location || '',
      lat: null, lng: null,
      type: sub.eventType || 'overig',
      sourceUrl: sub.website || '',
      sourceName: 'Inzending',
      imageUrl: sub.imageUrl || null,
      featured: false, hidden: false,
      promoted: sub.promoted === true,
      manuallyEdited: true,
      submittedBy: sub.email || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    await deleteDoc(doc(db, 'morvan', 'data', 'submissions', sub.id));
    setSubmissions(s => s.filter(x => x.id !== sub.id));
    await loadData();
  }

  async function approveAsActivity(sub) {
    await addDoc(collection(db, 'morvan', 'data', 'activities'), {
      title: { fr: sub.titleFr, en: sub.titleFr, nl: sub.titleFr },
      description: { fr: sub.descriptionFr || '', en: '', nl: '' },
      category: sub.activityCategory || 'overig',
      location: sub.location || '',
      lat: null, lng: null,
      url: sub.website || '',
      imageUrl: sub.imageUrl || null,
      permanent: true,
      promoted: sub.promoted === true,
      manuallyEdited: true,
      submittedBy: sub.email || '',
      createdAt: Timestamp.now(),
    });
    await deleteDoc(doc(db, 'morvan', 'data', 'submissions', sub.id));
    setSubmissions(s => s.filter(x => x.id !== sub.id));
  }

  async function rejectSubmission(id) {
    if (!confirm('Aanmelding afwijzen en verwijderen?')) return;
    await deleteDoc(doc(db, 'morvan', 'data', 'submissions', id));
    setSubmissions(s => s.filter(x => x.id !== id));
  }

  // ─── Login screen ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="page admin-login">
        <h1>{a.login}</h1>
        <form onSubmit={handleLogin} className="login-form">
          <label>{a.email}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>{a.password}
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit" className="btn btn-primary">{a.login}</button>
        </form>
      </main>
    );
  }

  // ─── Admin screen ─────────────────────────────────────────────────────────
  const pendingCount = submissions.length;

  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1>{a.title}</h1>
        <button className="btn btn-outline" onClick={() => signOut(auth)}>{a.logout}</button>
      </div>

      <div className="admin-tabs">
        {[
          { key: 'scraping',    label: '🕷️ Scraping' },
          { key: 'sources',     label: '🌐 Scrapebronnen' },
          { key: 'events',      label: '📅 Evenementen' },
          { key: 'activities',  label: '🥾 Activiteiten' },
          { key: 'submissions', label: `📬 ${a.submissions}${pendingCount ? ` (${pendingCount})` : ''}` },
        ].map(t => (
          <button
            key={t.key}
            className={`admin-tab${tab === t.key ? ' active' : ''}${t.key === 'submissions' && pendingCount ? ' tab-badge' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scraping ── */}
      {tab === 'scraping' && (
        <section className="admin-section">
          <h2>🕷️ Scraping uitvoeren</h2>
          <p className="admin-hint">
            De scraper haalt automatisch elke maandag om 06:00 UTC nieuwe evenementen op.
            Je kunt ook handmatig triggeren:
          </p>
          <button className="btn btn-primary" onClick={handleScrape} disabled={scraping} style={{ marginTop: 16 }}>
            {scraping ? a.scraping : a.scrape}
          </button>
          {scrapeMsg && <p className="scrape-msg">{scrapeMsg}</p>}

          <h3>{a.lastRun}</h3>
          {runs.length === 0
            ? <p className="admin-hint">Nog geen scraping uitgevoerd.</p>
            : (
              <table className="admin-table">
                <thead>
                  <tr><th>Datum</th><th>Bronnen</th><th>Gevonden</th><th>Toegevoegd</th><th>Verwijderd</th><th>Fouten</th></tr>
                </thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r.id}>
                      <td>{r.timestamp?.toDate?.().toLocaleString('nl-NL') || '–'}</td>
                      <td>{r.sourcesScraped}</td>
                      <td>{r.eventsFound}</td>
                      <td>{r.eventsAdded}</td>
                      <td>{r.eventsDeleted ?? '–'}</td>
                      <td style={{ color: r.errors?.length ? '#e63946' : 'inherit' }}>
                        {r.errors?.length || 0}
                        {r.errors?.length > 0 && (
                          <span title={r.errors.join('\n')} style={{ marginLeft: 4, cursor: 'help' }}>⚠️</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </section>
      )}

      {/* ── Scrapebronnen ── */}
      {tab === 'sources' && (
        <section className="admin-section">
          <h2>🌐 Scrapebronnen beheren</h2>
          <p className="admin-hint">
            Voeg websites toe die de scraper wekelijks uitleest. Claude AI analyseert de pagina automatisch.
          </p>
          {sourcesLoading ? <p className="loading">⏳</p> : (
            <table className="admin-table sources-table">
              <thead>
                <tr><th>Naam</th><th>URL</th><th>Actief</th><th></th></tr>
              </thead>
              <tbody>
                {sources.map(s => (
                  <tr key={s.id} className={s.enabled ? '' : 'row-hidden'}>
                    <td><strong>{s.name}</strong></td>
                    <td><a href={s.url} target="_blank" rel="noreferrer" className="source-url">{s.url}</a></td>
                    <td>
                      <button className={`toggle-btn source-toggle ${s.enabled ? 'on' : 'off'}`} onClick={() => toggleSource(s.id, s.enabled)}>
                        {s.enabled ? '✅' : '⏸️'}
                      </button>
                    </td>
                    <td><button className="delete-btn" onClick={() => deleteSource(s.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3>➕ Nieuwe bron toevoegen</h3>
          <form onSubmit={addSource} className="source-form">
            <div className="form-row">
              <label>Naam
                <input value={newSource.name} onChange={e => setNewSource(v => ({ ...v, name: e.target.value }))} placeholder="bv. Morvan Tourisme" required />
              </label>
              <label>URL
                <input value={newSource.url} onChange={e => setNewSource(v => ({ ...v, url: e.target.value }))} placeholder="https://..." type="url" required />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Bron toevoegen</button>
          </form>
        </section>
      )}

      {/* ── Evenementen ── */}
      {tab === 'events' && (
        <section className="admin-section">
          <div className="section-header-row">
            <h2>📅 Evenementen</h2>
            <button className="btn btn-outline" onClick={() => setShowEventForm(v => !v)}>
              {showEventForm ? '✕ Annuleren' : `➕ ${a.addEvent}`}
            </button>
          </div>

          {showEventForm && (
            <form onSubmit={saveEvent} className="activity-form card-form">
              <h3>Nieuw evenement</h3>
              <div className="form-row">
                <label>Titel (FR) *<input value={newEvent.title_fr} onChange={e => setNewEvent(v => ({ ...v, title_fr: e.target.value }))} required /></label>
                <label>Titel (EN)<input value={newEvent.title_en} onChange={e => setNewEvent(v => ({ ...v, title_en: e.target.value }))} /></label>
                <label>Titel (NL)<input value={newEvent.title_nl} onChange={e => setNewEvent(v => ({ ...v, title_nl: e.target.value }))} /></label>
              </div>
              <label>Beschrijving (FR)
                <textarea value={newEvent.description_fr} onChange={e => setNewEvent(v => ({ ...v, description_fr: e.target.value }))} rows={3} />
              </label>
              <div className="form-row">
                <label>Startdatum *<input type="date" value={newEvent.date} onChange={e => setNewEvent(v => ({ ...v, date: e.target.value }))} required /></label>
                <label>Einddatum<input type="date" value={newEvent.endDate} onChange={e => setNewEvent(v => ({ ...v, endDate: e.target.value }))} min={newEvent.date} /></label>
                <label>Type
                  <select value={newEvent.type} onChange={e => setNewEvent(v => ({ ...v, type: e.target.value }))}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{tr.events.filter[t]}</option>)}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>Locatie<input value={newEvent.location} onChange={e => setNewEvent(v => ({ ...v, location: e.target.value }))} /></label>
                <label>Website URL<input type="url" value={newEvent.sourceUrl} onChange={e => setNewEvent(v => ({ ...v, sourceUrl: e.target.value }))} /></label>
                <label>Afbeelding URL<input type="url" value={newEvent.imageUrl} onChange={e => setNewEvent(v => ({ ...v, imageUrl: e.target.value }))} /></label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingEvent}>
                {savingEvent ? 'Opslaan…' : 'Evenement opslaan'}
              </button>
            </form>
          )}

          <p className="admin-hint">Klik op het oog-icoon om een evenement te verbergen of weer zichtbaar te maken.</p>
          <table className="admin-table">
            <thead>
              <tr><th>Datum</th><th>Titel</th><th>Locatie</th><th>Bron</th><th>Gepromoot</th><th>Zichtbaar</th></tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} className={e.hidden ? 'row-hidden' : ''}>
                  <td>{e.date?.toDate?.().toLocaleDateString('nl-NL') || '–'}</td>
                  <td>{e.title?.fr || '–'}{e.manuallyEdited ? ' ✏️' : ''}</td>
                  <td>{e.location || '–'}</td>
                  <td>{e.sourceName || '–'}</td>
                  <td>
                    <button className={`promoted-toggle${e.promoted ? ' active' : ''}`} onClick={() => togglePromoted(e.id, e.promoted)}>
                      {e.promoted ? '⭐ Ja' : '☆ Nee'}
                    </button>
                  </td>
                  <td>
                    <button className={`toggle-btn ${e.hidden ? 'off' : 'on'}`} onClick={() => toggleEvent(e.id, e.hidden)}>
                      {e.hidden ? '🙈' : '👁️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <p className="admin-hint">Nog geen evenementen. Start een scraping om data op te halen.</p>}
        </section>
      )}

      {/* ── Activiteiten ── */}
      {tab === 'activities' && (
        <section className="admin-section">
          <h2>🥾 Activiteiten</h2>

          <div className="sync-box">
            <div>
              <strong>DataTourisme</strong>
              <p className="admin-hint">Officiële Franse toeristische data voor de Nièvre — inclusief beschrijvingen, foto's, openingstijden, adressen en postcodes.</p>
            </div>
            <button className="btn btn-primary" onClick={handleSyncDT} disabled={syncingDT}>
              {syncingDT ? a.syncing : '🇫🇷 Sync DataTourisme'}
            </button>
          </div>

          <div className="sync-box">
            <div>
              <strong>OpenStreetMap</strong>
              <p className="admin-hint">Extra POIs (kastelen, uitzichtpunten, zwemplekken) uit OpenStreetMap.</p>
            </div>
            <button className="btn btn-outline" onClick={handleSyncActivities} disabled={syncingActivities}>
              {syncingActivities ? a.syncing : a.syncActivities}
            </button>
          </div>

          <div className="sync-box">
            <div>
              <strong>✨ AI-verrijking</strong>
              <p className="admin-hint">Genereert ontbrekende titels, beschrijvingen (FR/EN/NL) en zoekt vrije afbeeldingen via Wikimedia. Vereist: ANTHROPIC_API_KEY in Netlify.</p>
            </div>
            <button className="btn btn-outline" onClick={handleEnrich} disabled={enriching}>
              {enriching ? '⏳ Bezig…' : '✨ Verrijk met AI'}
            </button>
          </div>
          {syncMsg && <p className="scrape-msg">{syncMsg}</p>}

          <h3>📋 Synchronisatiehistorie <button className="btn btn-outline" style={{fontSize:'.8rem',padding:'4px 10px',marginLeft:8}} onClick={loadData}>↻ Ververs</button></h3>
          {activitySyncs.length === 0
            ? <p className="admin-hint">Nog geen synchronisaties uitgevoerd.</p>
            : (
              <table className="admin-table" style={{ marginBottom: 24 }}>
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Bron</th>
                    <th>Verrijkt/Geschreven</th>
                    <th>Afb./Overgeslagen</th>
                    <th>Duur</th>
                    <th>Fouten</th>
                  </tr>
                </thead>
                <tbody>
                  {activitySyncs.map(s => {
                    const duurSec = s.durationMs ? `${Math.round(s.durationMs / 1000)}s` : '–';
                    const bron = s.source === 'datatourisme' ? '🇫🇷 DataTourisme' : s.source === 'claude-enrich' ? '✨ AI-verrijking' : '🗺️ OpenStreetMap';
                    const foutCount = s.errors?.length || 0;
                    return (
                      <tr key={s.id}>
                        <td>{s.timestamp?.toDate?.().toLocaleString('nl-NL') || '–'}</td>
                        <td>{bron}</td>
                        <td>{s.added ?? '–'}</td>
                        <td>{s.skipped ?? '–'}</td>
                        <td>{duurSec}</td>
                        <td style={{ color: foutCount ? '#e63946' : 'inherit' }}>
                          {foutCount}
                          {foutCount > 0 && (
                            <span title={s.errors.join('\n')} style={{ marginLeft: 4, cursor: 'help' }}>⚠️</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }

          <h3>➕ {a.addActivity}</h3>
          <form onSubmit={addActivity} className="activity-form">
            <div className="form-row">
              <label>Titel (FR) *<input value={newActivity.title_fr} onChange={e => setNewActivity(v => ({ ...v, title_fr: e.target.value }))} required /></label>
              <label>Titel (EN)<input value={newActivity.title_en} onChange={e => setNewActivity(v => ({ ...v, title_en: e.target.value }))} /></label>
              <label>Titel (NL)<input value={newActivity.title_nl} onChange={e => setNewActivity(v => ({ ...v, title_nl: e.target.value }))} /></label>
            </div>
            <label>Beschrijving (FR)
              <textarea value={newActivity.description_fr} onChange={e => setNewActivity(v => ({ ...v, description_fr: e.target.value }))} rows={3} />
            </label>
            <div className="form-row">
              <label>Categorie
                <select value={newActivity.category} onChange={e => setNewActivity(v => ({ ...v, category: e.target.value }))}>
                  {ACTIVITY_CATEGORIES.map(c => <option key={c} value={c}>{tr.activities.filter[c]}</option>)}
                </select>
              </label>
              <label>Locatie<input value={newActivity.location} onChange={e => setNewActivity(v => ({ ...v, location: e.target.value }))} /></label>
              <label>Duur<input value={newActivity.duration} onChange={e => setNewActivity(v => ({ ...v, duration: e.target.value }))} placeholder="bv. 2 uur" /></label>
            </div>
            <div className="form-row">
              <label>URL<input type="url" value={newActivity.url} onChange={e => setNewActivity(v => ({ ...v, url: e.target.value }))} /></label>
              <label>Afbeelding URL<input type="url" value={newActivity.imageUrl} onChange={e => setNewActivity(v => ({ ...v, imageUrl: e.target.value }))} /></label>
            </div>
            <button type="submit" className="btn btn-primary">Opslaan</button>
          </form>
        </section>
      )}

      {/* ── Aanmeldingen ── */}
      {tab === 'submissions' && (
        <section className="admin-section">
          <h2>📬 {a.submissions}</h2>
          {submissionsLoading && <p className="loading">⏳</p>}
          {!submissionsLoading && submissions.length === 0 && (
            <p className="admin-hint">{a.noSubmissions}</p>
          )}
          {submissions.map(sub => (
            <div key={sub.id} className={`submission-card${sub.promoted ? ' promoted' : ''}`}>
              <div className="submission-meta">
                <span className={`submission-type ${sub.type}`}>
                  {sub.type === 'event' ? '📅 Evenement' : '🥾 Activiteit'}
                </span>
                {sub.promoted && (
                  <span className="submission-promoted">⭐ Gepromoot — betaling {sub.paymentStatus === 'paid' ? '✅' : '⏳ in afwachting'}</span>
                )}
                <span className="submission-date">
                  {sub.submittedAt?.toDate?.().toLocaleDateString('nl-NL') || '–'}
                </span>
              </div>
              <h3 className="submission-title">{sub.titleFr}</h3>
              {sub.descriptionFr && <p className="submission-desc">{sub.descriptionFr}</p>}
              <div className="submission-details">
                {sub.location && <span>📍 {sub.location}</span>}
                {sub.dateStart && <span>📆 {sub.dateStart}{sub.dateEnd ? ` → ${sub.dateEnd}` : ''}</span>}
                {sub.website && <a href={sub.website} target="_blank" rel="noreferrer">🔗 Website</a>}
              </div>
              <div className="submission-contact">
                <strong>{sub.firstName} {sub.lastName}</strong> — {sub.email}
              </div>
              <div className="submission-actions">
                <button className="btn btn-primary btn-sm" onClick={() => approveAsEvent(sub)}>
                  {a.approveEvent}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => approveAsActivity(sub)}>
                  {a.approveActivity}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => rejectSubmission(sub.id)}>
                  {a.reject}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
