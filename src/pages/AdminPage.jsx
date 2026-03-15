import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, orderBy, query, limit, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminPage({ lang, tr }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [runs, setRuns] = useState([]);
  const [events, setEvents] = useState([]);
  const [newActivity, setNewActivity] = useState({ title_fr: '', title_en: '', title_nl: '', category: 'wandelen', location: '', url: '', duration: '', imageUrl: '' });

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      if (u && u.email === ADMIN_EMAIL) setUser(u);
      else setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    const runsSnap = await getDocs(query(collection(db, 'morvan', 'data', 'scrape_runs'), orderBy('timestamp', 'desc'), limit(5)));
    setRuns(runsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const eventsSnap = await getDocs(query(collection(db, 'morvan', 'data', 'events'), orderBy('date', 'asc'), limit(30)));
    setEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      await loadData();
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

  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1>{tr.admin.title}</h1>
        <button className="btn btn-outline" onClick={() => signOut(auth)}>{tr.admin.logout}</button>
      </div>

      {/* Scrape control */}
      <section className="admin-section">
        <h2>🕷️ Scraping</h2>
        <button className="btn btn-primary" onClick={handleScrape} disabled={scraping}>
          {scraping ? tr.admin.scraping : tr.admin.scrape}
        </button>
        {scrapeMsg && <p className="scrape-msg">{scrapeMsg}</p>}

        <h3>{tr.admin.lastRun}</h3>
        <table className="admin-table">
          <thead><tr><th>Datum</th><th>Bronnen</th><th>Gevonden</th><th>Toegevoegd</th><th>Fouten</th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.id}>
                <td>{r.timestamp?.toDate?.().toLocaleString('nl-NL') || '–'}</td>
                <td>{r.sourcesScraped}</td>
                <td>{r.eventsFound}</td>
                <td>{r.eventsAdded}</td>
                <td>{r.errors?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Events list */}
      <section className="admin-section">
        <h2>📅 Evenementen beheren</h2>
        <table className="admin-table">
          <thead><tr><th>Datum</th><th>Titel</th><th>Locatie</th><th>Bron</th><th>Zichtbaar</th></tr></thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id} className={e.hidden ? 'row-hidden' : ''}>
                <td>{e.date?.toDate?.().toLocaleDateString('nl-NL') || '–'}</td>
                <td>{e.title?.fr || e.title?.nl || '–'}</td>
                <td>{e.location || '–'}</td>
                <td>{e.sourceName || '–'}</td>
                <td>
                  <button className={`toggle-btn ${e.hidden ? 'off' : 'on'}`} onClick={() => toggleEvent(e.id, e.hidden)}>
                    {e.hidden ? '👁️‍🗨️' : '👁️'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Add activity */}
      <section className="admin-section">
        <h2>➕ {tr.admin.addActivity}</h2>
        <form onSubmit={addActivity} className="activity-form">
          <div className="form-row">
            <label>Titel (FR) <input value={newActivity.title_fr} onChange={e => setNewActivity(v => ({ ...v, title_fr: e.target.value }))} required /></label>
            <label>Titel (EN) <input value={newActivity.title_en} onChange={e => setNewActivity(v => ({ ...v, title_en: e.target.value }))} /></label>
            <label>Titel (NL) <input value={newActivity.title_nl} onChange={e => setNewActivity(v => ({ ...v, title_nl: e.target.value }))} /></label>
          </div>
          <div className="form-row">
            <label>Categorie
              <select value={newActivity.category} onChange={e => setNewActivity(v => ({ ...v, category: e.target.value }))}>
                {['wandelen','fietsen','water','kastelen','eten','overig'].map(c => <option key={c} value={c}>{c}</option>)}
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
    </main>
  );
}
