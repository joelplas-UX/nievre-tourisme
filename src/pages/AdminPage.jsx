import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, getDocs, orderBy, query, limit,
  doc, updateDoc, addDoc, setDoc, deleteDoc, Timestamp, getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// Default sources (pre-seeded on first load)
const DEFAULT_SOURCES = [
  { name: 'Nièvre Tourisme',              url: 'https://www.nievre-tourisme.com/agenda/',          enabled: true },
  { name: 'La Nièvre naturellement',      url: 'https://www.lanievrenaturellement.com/agenda/',    enabled: true },
  { name: 'Agenda Culturel 58',           url: 'https://58.agendaculturel.fr',                     enabled: true },
  { name: 'Tourisme Pays du Roi Morvan',  url: 'https://www.tourismepaysroimorvan.com/agenda/',    enabled: true },
  { name: 'Rives du Morvan',              url: 'https://www.rivesdumorvan.fr/agenda/',             enabled: true },
  { name: 'Coeur de Nièvre',             url: 'https://www.tourismecoeurdenievre.com/agenda/',    enabled: true },
];

export default function AdminPage({ lang, tr }) {
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

  // Activities
  const [newActivity, setNewActivity] = useState({
    title_fr: '', title_en: '', title_nl: '',
    category: 'wandelen', location: '', url: '', duration: '', imageUrl: '',
  });

  // Active tab
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
  }, [user]);

  async function loadData() {
    const runsSnap = await getDocs(query(
      collection(db, 'morvan', 'data', 'scrape_runs'),
      orderBy('timestamp', 'desc'), limit(5)
    ));
    setRuns(runsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const eventsSnap = await getDocs(query(
      collection(db, 'morvan', 'data', 'events'),
      orderBy('date', 'asc'), limit(30)
    ));
    setEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function loadSources() {
    setSourcesLoading(true);
    const snap = await getDocs(collection(db, 'morvan', 'data', 'scrape_sources'));
    if (snap.empty) {
      // Seed defaults on first load
      for (const s of DEFAULT_SOURCES) {
        await addDoc(collection(db, 'morvan', 'data', 'scrape_sources'), {
          ...s, createdAt: Timestamp.now(),
        });
      }
      const snap2 = await getDocs(collection(db, 'morvan', 'data', 'scrape_sources'));
      setSources(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
    } else {
      setSources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    setSourcesLoading(false);
  }

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
      name: newSource.name,
      url: newSource.url,
      enabled: true,
      createdAt: Timestamp.now(),
    });
    setSources(s => [...s, { id: ref.id, ...newSource, enabled: true }]);
    setNewSource({ name: '', url: '' });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  async function handleScrape() {
    setScraping(true);
    setScrapeMsg('');
    try {
      const res = await fetch('/.netlify/functions/trigger-scrape', { method: 'POST' });
      const data = await res.json();
      setScrapeMsg(data.message || 'Scraping gestart!');
      setTimeout(() => loadData(), 3000);
    } catch (err) {
      setScrapeMsg('Fout: ' + err.message);
    } finally {
      setScraping(false);
    }
  }

  async function toggleEvent(id, hidden) {
    await updateDoc(doc(db, 'morvan', 'data', 'events', id), { hidden: !hidden });
    setEvents(ev => ev.map(e => e.id === id ? { ...e, hidden: !hidden } : e));
  }

  async function addActivity(e) {
    e.preventDefault();
    await addDoc(collection(db, 'morvan', 'data', 'activities'), {
      title: { fr: newActivity.title_fr, en: newActivity.title_en, nl: newActivity.title_nl },
      description: { fr: '', en: '', nl: '' },
      category: newActivity.category,
      location: newActivity.location,
      url: newActivity.url,
      duration: newActivity.duration,
      imageUrl: newActivity.imageUrl,
      permanent: true,
      createdAt: Timestamp.now(),
    });
    setNewActivity({ title_fr: '', title_en: '', title_nl: '', category: 'wandelen', location: '', url: '', duration: '', imageUrl: '' });
    alert('Activiteit toegevoegd!');
  }

  // ─── Login screen ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="page admin-login">
        <h1>{tr.admin.login}</h1>
        <form onSubmit={handleLogin} className="login-form">
          <label>{tr.admin.email}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>{tr.admin.password}
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit" className="btn btn-primary">{tr.admin.login}</button>
        </form>
      </main>
    );
  }

  // ─── Admin screen ──────────────────────────────────────────────────────────
  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1>{tr.admin.title}</h1>
        <button className="btn btn-outline" onClick={() => signOut(auth)}>{tr.admin.logout}</button>
      </div>

      {/* Tab nav */}
      <div className="admin-tabs">
        {[
          { key: 'scraping',  label: '🕷️ Scraping' },
          { key: 'sources',   label: '🌐 Scrapebronnen' },
          { key: 'events',    label: '📅 Evenementen' },
          { key: 'activities',label: '🥾 Activiteiten' },
        ].map(t => (
          <button
            key={t.key}
            className={`admin-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Scraping ── */}
      {tab === 'scraping' && (
        <section className="admin-section">
          <h2>🕷️ Scraping uitvoeren</h2>
          <p className="admin-hint">
            De scraper haalt automatisch elke maandag om 06:00 UTC nieuwe evenementen op
            van alle ingeschakelde bronnen. Je kunt ook handmatig triggeren:
          </p>
          <button className="btn btn-primary" onClick={handleScrape} disabled={scraping} style={{ marginTop: 16 }}>
            {scraping ? tr.admin.scraping : tr.admin.scrape}
          </button>
          {scrapeMsg && <p className="scrape-msg">{scrapeMsg}</p>}

          <h3>{tr.admin.lastRun}</h3>
          {runs.length === 0
            ? <p className="admin-hint">Nog geen scraping uitgevoerd.</p>
            : (
              <table className="admin-table">
                <thead>
                  <tr><th>Datum</th><th>Bronnen</th><th>Gevonden</th><th>Toegevoegd</th><th>Fouten</th></tr>
                </thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r.id}>
                      <td>{r.timestamp?.toDate?.().toLocaleString('nl-NL') || '–'}</td>
                      <td>{r.sourcesScraped}</td>
                      <td>{r.eventsFound}</td>
                      <td>{r.eventsAdded}</td>
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

      {/* ── Tab: Scrapebronnen ── */}
      {tab === 'sources' && (
        <section className="admin-section">
          <h2>🌐 Scrapebronnen beheren</h2>
          <p className="admin-hint">
            Voeg websites toe die de scraper wekelijks uitleest. Claude AI analyseert de pagina
            automatisch — je hoeft geen CSS-selectors te kennen.
          </p>

          {sourcesLoading
            ? <p className="loading">⏳</p>
            : (
              <table className="admin-table sources-table">
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>URL</th>
                    <th>Actief</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map(s => (
                    <tr key={s.id} className={s.enabled ? '' : 'row-hidden'}>
                      <td><strong>{s.name}</strong></td>
                      <td>
                        <a href={s.url} target="_blank" rel="noreferrer" className="source-url">
                          {s.url}
                        </a>
                      </td>
                      <td>
                        <button
                          className={`toggle-btn source-toggle ${s.enabled ? 'on' : 'off'}`}
                          onClick={() => toggleSource(s.id, s.enabled)}
                          title={s.enabled ? 'Klik om uit te schakelen' : 'Klik om in te schakelen'}
                        >
                          {s.enabled ? '✅' : '⏸️'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => deleteSource(s.id)}
                          title="Verwijderen"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }

          {/* Nieuwe bron toevoegen */}
          <h3>➕ Nieuwe bron toevoegen</h3>
          <form onSubmit={addSource} className="source-form">
            <div className="form-row">
              <label>
                Naam van de website
                <input
                  value={newSource.name}
                  onChange={e => setNewSource(v => ({ ...v, name: e.target.value }))}
                  placeholder="bv. Morvan Tourisme"
                  required
                />
              </label>
              <label>
                URL van de agendapagina
                <input
                  value={newSource.url}
                  onChange={e => setNewSource(v => ({ ...v, url: e.target.value }))}
                  placeholder="https://www.example.fr/agenda/"
                  type="url"
                  required
                />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Bron toevoegen</button>
          </form>
        </section>
      )}

      {/* ── Tab: Evenementen ── */}
      {tab === 'events' && (
        <section className="admin-section">
          <h2>📅 Evenementen beheren</h2>
          <p className="admin-hint">Klik op het oog-icoon om een evenement te verbergen of weer zichtbaar te maken.</p>
          <table className="admin-table">
            <thead>
              <tr><th>Datum</th><th>Titel</th><th>Locatie</th><th>Bron</th><th>Zichtbaar</th></tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} className={e.hidden ? 'row-hidden' : ''}>
                  <td>{e.date?.toDate?.().toLocaleDateString('nl-NL') || '–'}</td>
                  <td>{e.title?.fr || e.title?.nl || '–'}</td>
                  <td>{e.location || '–'}</td>
                  <td>{e.sourceName || '–'}</td>
                  <td>
                    <button
                      className={`toggle-btn ${e.hidden ? 'off' : 'on'}`}
                      onClick={() => toggleEvent(e.id, e.hidden)}
                    >
                      {e.hidden ? '🙈' : '👁️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <p className="admin-hint">Nog geen evenementen. Start een scraping om data op te halen.</p>
          )}
        </section>
      )}

      {/* ── Tab: Activiteiten ── */}
      {tab === 'activities' && (
        <section className="admin-section">
          <h2>➕ {tr.admin.addActivity}</h2>
          <p className="admin-hint">Voeg handmatig een vaste activiteit toe (wandelroute, zwemplek, kasteel, etc.).</p>
          <form onSubmit={addActivity} className="activity-form">
            <div className="form-row">
              <label>Titel (FR) <input value={newActivity.title_fr} onChange={e => setNewActivity(v => ({ ...v, title_fr: e.target.value }))} required /></label>
              <label>Titel (EN) <input value={newActivity.title_en} onChange={e => setNewActivity(v => ({ ...v, title_en: e.target.value }))} /></label>
              <label>Titel (NL) <input value={newActivity.title_nl} onChange={e => setNewActivity(v => ({ ...v, title_nl: e.target.value }))} /></label>
            </div>
            <div className="form-row">
              <label>Categorie
                <select value={newActivity.category} onChange={e => setNewActivity(v => ({ ...v, category: e.target.value }))}>
                  {['wandelen','fietsen','water','kastelen','eten','overig'].map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </label>
              <label>Locatie <input value={newActivity.location} onChange={e => setNewActivity(v => ({ ...v, location: e.target.value }))} /></label>
              <label>Duur <input value={newActivity.duration} onChange={e => setNewActivity(v => ({ ...v, duration: e.target.value }))} placeholder="bv. 2 uur" /></label>
            </div>
            <div className="form-row">
              <label>URL <input value={newActivity.url} onChange={e => setNewActivity(v => ({ ...v, url: e.target.value }))} type="url" /></label>
              <label>Afbeelding URL <input value={newActivity.imageUrl} onChange={e => setNewActivity(v => ({ ...v, imageUrl: e.target.value }))} type="url" /></label>
            </div>
            <button type="submit" className="btn btn-primary">Opslaan</button>
          </form>
        </section>
      )}
    </main>
  );
}
