import { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, getDocs, orderBy, query, limit, where,
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
  const [syncingOAG, setSyncingOAG] = useState(false);
  const [syncingVisorando, setSyncingVisorando] = useState(false);
  const [syncingKoikispass, setSyncingKoikispass] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichingPhotos, setEnrichingPhotos] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [activitySyncs, setActivitySyncs] = useState([]);

  // Submissions
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Foto upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoLocation, setPhotoLocation] = useState('');
  const [photoCategory, setPhotoCategory] = useState('overig');
  const [photoAssignType, setPhotoAssignType] = useState('activity'); // 'activity' | 'event' | 'standalone'
  const [photoAssignId, setPhotoAssignId] = useState('');
  const [photoSearchQuery, setPhotoSearchQuery] = useState('');
  const [newsletters, setNewsletters] = useState([]);

  // Blog
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null); // null = nieuw artikel
  const [blogMsg, setBlogMsg] = useState('');
  const [savingBlog, setSavingBlog] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [blogPreviewLang, setBlogPreviewLang] = useState('fr');
  const EMPTY_BLOG = {
    slug: '', date: new Date().toISOString().slice(0, 10),
    titleFr: '', titleEn: '', titleNl: '',
    excerptFr: '', excerptEn: '', excerptNl: '',
    contentFr: '', contentEn: '', contentNl: '',
    categoryFr: 'Guide', categoryEn: 'Guide', categoryNl: 'Gids',
    readTime: 5, image: '', published: false,
  };
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG);
  const contentFrRef = useRef(null);
  const contentEnRef = useRef(null);
  const contentNlRef = useRef(null);

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
    loadBlogPosts();
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
      orderBy('timestamp', 'desc'), limit(25)
    ));
    setActivitySyncs(syncsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    try {
      const nlSnap = await getDocs(query(
        collection(db, 'morvan', 'data', 'newsletter_runs'),
        orderBy('timestamp', 'desc'), limit(10)
      ));
      setNewsletters(nlSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { /* collectie bestaat nog niet */ }
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

  async function handleEnrichPhotos() {
    setEnrichingPhotos(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/enrich-events-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('🖼️ Foto-verrijking gestart! Wikipedia & Wikimedia Commons worden doorzocht voor evenementen én activiteiten. Ververs de log over 5–10 minuten.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 360000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setEnrichingPhotos(false);
    }
  }

  async function handleSyncOAG() {
    setSyncingOAG(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/sync-openagenda-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('✅ OpenAgenda sync gestart! Evenementen met foto\'s worden geladen. Ververs de log over 2–5 minuten.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 120000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setSyncingOAG(false);
    }
  }

  async function handleSyncVisorando() {
    setSyncingVisorando(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/sync-visorando-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('✅ Visorando sync gestart! Wandelroutes worden opgehaald en vertaald. Ververs de log over 3–5 minuten.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 300000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setSyncingVisorando(false);
    }
  }

  async function handleSyncKoikispass() {
    setSyncingKoikispass(true);
    setSyncMsg('');
    try {
      const res = await fetch('/.netlify/functions/sync-koikispass-background', { method: 'POST' });
      if (res.status === 202 || res.ok) {
        setSyncMsg('✅ Koikispass sync gestart! Wekelijkse evenementen worden geëxtraheerd via AI. Ververs de log over 3–5 minuten.');
      } else {
        setSyncMsg(`⚠️ Status ${res.status}`);
      }
      setTimeout(() => loadData(), 300000);
    } catch (err) {
      setSyncMsg('Fout: ' + err.message);
    } finally {
      setSyncingKoikispass(false);
    }
  }

  // ── Blog ──────────────────────────────────────────────────────────────────
  async function loadBlogPosts() {
    setBlogLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'morvan', 'data', 'blog_posts'), orderBy('date', 'desc'))
      );
      setBlogPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { /* collectie nog leeg */ }
    setBlogLoading(false);
  }

  function openNewBlog() {
    setEditingBlogId(null);
    setBlogForm({ ...EMPTY_BLOG, date: new Date().toISOString().slice(0, 10) });
    setBlogMsg('');
    setShowBlogEditor(true);
  }

  function openEditBlog(post) {
    setEditingBlogId(post.id);
    setBlogForm({
      slug: post.slug || '',
      date: post.date || new Date().toISOString().slice(0, 10),
      titleFr: post.title?.fr || '',
      titleEn: post.title?.en || '',
      titleNl: post.title?.nl || '',
      excerptFr: post.excerpt?.fr || '',
      excerptEn: post.excerpt?.en || '',
      excerptNl: post.excerpt?.nl || '',
      contentFr: post.content?.fr || '',
      contentEn: post.content?.en || '',
      contentNl: post.content?.nl || '',
      categoryFr: post.category?.fr || 'Guide',
      categoryEn: post.category?.en || 'Guide',
      categoryNl: post.category?.nl || 'Gids',
      readTime: post.readTime || 5,
      image: post.image || '',
      published: post.published ?? false,
    });
    setBlogMsg('');
    setShowBlogEditor(true);
  }

  function makeBlogSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  function calcReadTime(text) {
    const words = (text || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  async function handleTranslate() {
    if (!blogForm.titleFr) { setBlogMsg('⚠️ Voer eerst de Franse titel in.'); return; }
    setTranslating(true);
    setBlogMsg('⏳ Claude vertaalt…');
    try {
      const res = await fetch('/.netlify/functions/translate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleFr: blogForm.titleFr,
          excerptFr: blogForm.excerptFr,
          contentFr: blogForm.contentFr,
          categoryFr: blogForm.categoryFr,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBlogForm(f => ({
        ...f,
        titleEn: data.titleEn || f.titleEn,
        titleNl: data.titleNl || f.titleNl,
        excerptEn: data.excerptEn || f.excerptEn,
        excerptNl: data.excerptNl || f.excerptNl,
        contentEn: data.contentEn || f.contentEn,
        contentNl: data.contentNl || f.contentNl,
        categoryEn: data.categoryEn || f.categoryEn,
        categoryNl: data.categoryNl || f.categoryNl,
      }));
      setBlogMsg('✅ Vertaling klaar! Controleer EN en NL voor je opslaat.');
    } catch (err) {
      setBlogMsg('❌ Vertaling mislukt: ' + err.message);
    } finally {
      setTranslating(false);
    }
  }

  async function handleSaveBlog(e) {
    e.preventDefault();
    if (!blogForm.titleFr) { setBlogMsg('⚠️ Franse titel is verplicht.'); return; }
    setSavingBlog(true);
    setBlogMsg('');
    try {
      const slug = blogForm.slug || makeBlogSlug(blogForm.titleFr);
      const readTime = blogForm.readTime || calcReadTime(blogForm.contentFr);
      const docData = {
        slug,
        date: blogForm.date,
        title: { fr: blogForm.titleFr, en: blogForm.titleEn || blogForm.titleFr, nl: blogForm.titleNl || blogForm.titleFr },
        excerpt: { fr: blogForm.excerptFr, en: blogForm.excerptEn || blogForm.excerptFr, nl: blogForm.excerptNl || blogForm.excerptFr },
        content: { fr: blogForm.contentFr, en: blogForm.contentEn || blogForm.contentFr, nl: blogForm.contentNl || blogForm.contentFr },
        category: { fr: blogForm.categoryFr, en: blogForm.categoryEn || blogForm.categoryFr, nl: blogForm.categoryNl || blogForm.categoryFr },
        readTime,
        image: blogForm.image || '',
        published: blogForm.published,
        updatedAt: Timestamp.now(),
      };

      if (editingBlogId) {
        await updateDoc(doc(db, 'morvan', 'data', 'blog_posts', editingBlogId), docData);
        setBlogMsg('✅ Artikel bijgewerkt!');
      } else {
        docData.createdAt = Timestamp.now();
        await addDoc(collection(db, 'morvan', 'data', 'blog_posts'), docData);
        setBlogMsg('✅ Artikel aangemaakt!');
      }
      await loadBlogPosts();
      setShowBlogEditor(false);
    } catch (err) {
      setBlogMsg('❌ Opslaan mislukt: ' + err.message);
    } finally {
      setSavingBlog(false);
    }
  }

  async function handleDeleteBlog(id, title) {
    if (!confirm(`Artikel "${title}" verwijderen?`)) return;
    await deleteDoc(doc(db, 'morvan', 'data', 'blog_posts', id));
    setBlogPosts(p => p.filter(x => x.id !== id));
  }

  async function handleToggleBlogPublished(id, published) {
    await updateDoc(doc(db, 'morvan', 'data', 'blog_posts', id), { published: !published });
    setBlogPosts(p => p.map(x => x.id === id ? { ...x, published: !published } : x));
  }

  // HTML-toolbar helper voor de content textarea
  function insertHtml(ref, before, after = '') {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || 'tekst';
    const inserted = before + selected + after;
    const newVal = el.value.slice(0, start) + inserted + el.value.slice(end);
    // Bepaal welk veld
    const field = el.dataset.field;
    setBlogForm(f => ({ ...f, [field]: newVal }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  function HtmlToolbar({ refObj, field }) {
    const btn = (label, before, after) => (
      <button type="button" className="html-toolbar-btn" title={label}
        onClick={() => {
          const el = refObj.current;
          if (!el) return;
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const selected = el.value.slice(start, end) || 'tekst';
          const inserted = before + selected + after;
          const newVal = el.value.slice(0, start) + inserted + el.value.slice(end);
          setBlogForm(f => ({ ...f, [field]: newVal }));
          setTimeout(() => { el.focus(); el.setSelectionRange(start + before.length, start + before.length + selected.length); }, 0);
        }}>
        {label}
      </button>
    );
    return (
      <div className="html-toolbar">
        {btn('H2', '<h2>', '</h2>')}
        {btn('H3', '<h3>', '</h3>')}
        {btn('§', '<p>', '</p>')}
        {btn('B', '<strong>', '</strong>')}
        {btn('I', '<em>', '</em>')}
        {btn('UL', '<ul>\n  <li>', '</li>\n</ul>')}
        {btn('LI', '<li>', '</li>')}
        {btn('Link', '<a href="">', '</a>')}
      </div>
    );
  }

  // ── Foto upload ───────────────────────────────────────────────────────────
  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoMsg('');
  }

  async function handlePhotoUpload(e) {
    e.preventDefault();
    if (!photoFile) return;
    setPhotoUploading(true);
    setPhotoMsg('');

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        setPhotoMsg('⚠️ VITE_CLOUDINARY_CLOUD_NAME of VITE_CLOUDINARY_UPLOAD_PRESET ontbreekt in .env');
        return;
      }

      // Upload naar Cloudinary
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'nievre-admin');
      if (photoTitle) formData.append('context', `caption=${photoTitle}|location=${photoLocation}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
      const data = await res.json();
      const imageUrl = data.secure_url;

      // Wijs foto toe
      if (photoAssignType === 'activity' && photoAssignId) {
        await setDoc(doc(db, 'morvan', 'data', 'activities', photoAssignId),
          { imageUrl, imageSource: 'admin-upload', updatedAt: Timestamp.now() },
          { merge: true }
        );
        setPhotoMsg(`✅ Foto gekoppeld aan activiteit!`);
      } else if (photoAssignType === 'event' && photoAssignId) {
        await setDoc(doc(db, 'morvan', 'data', 'events', photoAssignId),
          { imageUrl, imageSource: 'admin-upload', updatedAt: Timestamp.now() },
          { merge: true }
        );
        setPhotoMsg(`✅ Foto gekoppeld aan evenement!`);
      } else {
        // Standalone foto (nieuwe activiteit)
        await addDoc(collection(db, 'morvan', 'data', 'activities'), {
          title: { fr: photoTitle || 'Photo', en: photoTitle || 'Photo', nl: photoTitle || 'Foto' },
          description: { fr: '', en: '', nl: '' },
          category: photoCategory,
          location: photoLocation || '',
          imageUrl,
          imageSource: 'admin-upload',
          permanent: true,
          manuallyEdited: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setPhotoMsg(`✅ Foto opgeslagen als nieuwe activiteit!`);
      }

      // Reset
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoTitle('');
      setPhotoLocation('');
      setPhotoAssignId('');
      await loadData();
    } catch (err) {
      setPhotoMsg('❌ Fout: ' + err.message);
    } finally {
      setPhotoUploading(false);
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
          { key: 'photos',      label: '📸 Foto\'s' },
          { key: 'newsletter',  label: '✉️ Nieuwsbrief' },
          { key: 'blog',        label: '📝 Blog' },
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
            De scraper haalt automatisch elke donderdag om 06:00 UTC nieuwe evenementen op.
            Je kunt ook handmatig triggeren:
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleScrape} disabled={scraping}>
              {scraping ? a.scraping : a.scrape}
            </button>
            <button className="btn btn-outline" onClick={handleSyncOAG} disabled={syncingOAG}>
              {syncingOAG ? a.syncing : '📅 Sync OpenAgenda'}
            </button>
          </div>
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
              <p className="admin-hint">POIs + wandelroutes (GR, PR) uit OpenStreetMap via Overpass API.</p>
            </div>
            <button className="btn btn-outline" onClick={handleSyncActivities} disabled={syncingActivities}>
              {syncingActivities ? a.syncing : a.syncActivities}
            </button>
          </div>

          <div className="sync-box">
            <div>
              <strong>🥾 Visorando</strong>
              <p className="admin-hint">Gedetailleerde wandelroutes voor de Nièvre & Morvan met afstand, hoogteprofiel en beschrijving.</p>
            </div>
            <button className="btn btn-outline" onClick={handleSyncVisorando} disabled={syncingVisorando}>
              {syncingVisorando ? a.syncing : '🥾 Sync Visorando'}
            </button>
          </div>

          <div className="sync-box">
            <div>
              <strong>📰 Koikispass.com</strong>
              <p className="admin-hint">WordPress REST API — wekelijkse evenementenroundups voor de Nièvre. Claude extraheert individuele evenementen met datum, locatie en type.</p>
            </div>
            <button className="btn btn-outline" onClick={handleSyncKoikispass} disabled={syncingKoikispass}>
              {syncingKoikispass ? a.syncing : '📰 Sync Koikispass'}
            </button>
          </div>

          <div className="sync-box">
            <div>
              <strong>✨ AI-verrijking</strong>
              <p className="admin-hint">Genereert ontbrekende titels en beschrijvingen (FR/EN/NL). Vereist: CLAUDE_API_KEY in Netlify.</p>
            </div>
            <button className="btn btn-outline" onClick={handleEnrich} disabled={enriching}>
              {enriching ? '⏳ Bezig…' : '✨ Verrijk met AI'}
            </button>
          </div>

          <div className="sync-box">
            <div>
              <strong>🖼️ Foto-verrijking</strong>
              <p className="admin-hint">Zoekt ontbrekende foto's voor evenementen én activiteiten via Wikipedia, Wikimedia Commons en de bronpagina's.</p>
            </div>
            <button className="btn btn-outline" onClick={handleEnrichPhotos} disabled={enrichingPhotos}>
              {enrichingPhotos ? '⏳ Bezig…' : '🖼️ Zoek foto\'s'}
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
                    const bronMap = {
                      datatourisme: '🇫🇷 DataTourisme',
                      'claude-enrich': '✨ AI-verrijking',
                      openstreetmap: '🗺️ OpenStreetMap',
                      visorando: '🥾 Visorando',
                      koikispass: '📰 Koikispass',
                      'photo-enrich': '🖼️ Foto-verrijking',
                    };
                    const bron = bronMap[s.source] || s.source || '–';
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

      {/* ── Foto's ── */}
      {tab === 'photos' && (
        <section className="admin-section">
          <h2>📸 Foto's uploaden</h2>
          <p className="admin-hint">
            Maak een foto met je smartphone of kies een bestand. De foto wordt via Cloudinary opgeslagen
            en gekoppeld aan een activiteit, evenement of als zelfstandige activiteit opgeslagen.
          </p>
          <p className="admin-hint">
            Vereist: <code>VITE_CLOUDINARY_CLOUD_NAME</code> en <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> in Netlify.
          </p>

          <form onSubmit={handlePhotoUpload} className="photo-upload-form">

            {/* Camera / bestand kiezen */}
            <div className="photo-input-area">
              <label className="photo-file-label">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="photo-preview" />
                  : (
                    <div className="photo-placeholder">
                      <span style={{ fontSize: 40 }}>📸</span>
                      <span>Tik om foto te maken of te kiezen</span>
                    </div>
                  )
                }
              </label>
            </div>

            {photoPreview && (
              <>
                {/* Titel & locatie */}
                <div className="form-row">
                  <label>Titel
                    <input
                      value={photoTitle}
                      onChange={e => setPhotoTitle(e.target.value)}
                      placeholder="bv. Lac des Settons zonsondergang"
                    />
                  </label>
                  <label>Locatie
                    <input
                      value={photoLocation}
                      onChange={e => setPhotoLocation(e.target.value)}
                      placeholder="bv. Montsauche-les-Settons"
                    />
                  </label>
                </div>

                {/* Toewijzing */}
                <div className="form-row" style={{ marginBottom: 8 }}>
                  <label>Koppelen aan
                    <select value={photoAssignType} onChange={e => { setPhotoAssignType(e.target.value); setPhotoAssignId(''); }}>
                      <option value="standalone">Nieuwe activiteit aanmaken</option>
                      <option value="activity">Bestaande activiteit</option>
                      <option value="event">Bestaand evenement</option>
                    </select>
                  </label>
                  {photoAssignType === 'standalone' && (
                    <label>Categorie
                      <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}>
                        {['wandelen','fietsen','water','kastelen','eten','overnachting','overig'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                {(photoAssignType === 'activity' || photoAssignType === 'event') && (
                  <div style={{ marginBottom: 12 }}>
                    <input
                      value={photoSearchQuery}
                      onChange={e => setPhotoSearchQuery(e.target.value)}
                      placeholder={`Zoek ${photoAssignType === 'activity' ? 'activiteit' : 'evenement'} op naam…`}
                      className="photo-search-input"
                    />
                    {photoSearchQuery.length > 1 && (
                      <div className="photo-search-results">
                        {(photoAssignType === 'activity' ? [] : events)
                          .concat(photoAssignType === 'activity' ? [] : [])
                          /* Laad activiteiten/events inline via filter op bestaande state */
                          .filter(item => {
                            const t = item.title?.fr || item.title?.nl || '';
                            return t.toLowerCase().includes(photoSearchQuery.toLowerCase());
                          })
                          .slice(0, 8)
                          .map(item => (
                            <button
                              key={item.id}
                              type="button"
                              className={`photo-search-item${photoAssignId === item.id ? ' selected' : ''}`}
                              onClick={() => { setPhotoAssignId(item.id); setPhotoSearchQuery(item.title?.fr || ''); }}
                            >
                              {item.title?.fr || item.id}
                              {item.imageUrl && <span className="has-photo">📷</span>}
                            </button>
                          ))
                        }
                        {photoAssignType === 'event' && events
                          .filter(ev => (ev.title?.fr || '').toLowerCase().includes(photoSearchQuery.toLowerCase()))
                          .slice(0, 8)
                          .map(ev => (
                            <button
                              key={ev.id}
                              type="button"
                              className={`photo-search-item${photoAssignId === ev.id ? ' selected' : ''}`}
                              onClick={() => { setPhotoAssignId(ev.id); setPhotoSearchQuery(ev.title?.fr || ''); }}
                            >
                              {ev.title?.fr || ev.id} {ev.date?.toDate?.()?.toLocaleDateString('nl-NL') || ''}
                              {ev.imageUrl && <span className="has-photo">📷</span>}
                            </button>
                          ))
                        }
                      </div>
                    )}
                    {photoAssignId && <p style={{ fontSize: '.82rem', color: '#3a7d44', marginTop: 4 }}>✓ ID: {photoAssignId}</p>}
                  </div>
                )}

                {photoMsg && <p className="scrape-msg">{photoMsg}</p>}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={photoUploading || (photoAssignType !== 'standalone' && !photoAssignId)}
                >
                  {photoUploading ? '⏳ Uploaden…' : '☁️ Uploaden & opslaan'}
                </button>
              </>
            )}
            {!photoPreview && photoMsg && <p className="scrape-msg">{photoMsg}</p>}
          </form>
        </section>
      )}

      {/* ── Nieuwsbrief ── */}
      {tab === 'newsletter' && (
        <section className="admin-section">
          <h2>✉️ Nieuwsbrief</h2>
          <p className="admin-hint">
            De nieuwsbrief wordt automatisch elke donderdag om 07:00 UTC verstuurd naar alle actieve abonnees.
            Je kunt ook handmatig versturen.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            <button
              className="btn btn-primary"
              onClick={async () => {
                const r = await fetch('/.netlify/functions/send-newsletter-background', { method: 'POST' });
                alert(r.status === 202 || r.ok ? '✅ Nieuwsbrief wordt verstuurd!' : `⚠️ Status ${r.status}`);
                setTimeout(loadData, 30000);
              }}
            >
              ✉️ Nu versturen
            </button>
          </div>

          <h3 style={{ marginTop: 24 }}>📋 Verzendgeschiedenis <button className="btn btn-outline" style={{ fontSize: '.8rem', padding: '4px 10px', marginLeft: 8 }} onClick={loadData}>↻ Ververs</button></h3>
          {newsletters.length === 0
            ? <p className="admin-hint">Nog geen nieuwsbrieven verstuurd.</p>
            : (
              <table className="admin-table">
                <thead>
                  <tr><th>Datum</th><th>Abonnees</th><th>Verstuurd</th><th>Overgeslagen</th><th>Fouten</th></tr>
                </thead>
                <tbody>
                  {newsletters.map(n => (
                    <tr key={n.id}>
                      <td>{n.timestamp?.toDate?.().toLocaleString('nl-NL') || '–'}</td>
                      <td>{n.subscribers ?? '–'}</td>
                      <td>{n.sent ?? '–'}</td>
                      <td>{n.skipped ?? '–'}</td>
                      <td style={{ color: n.errors?.length ? '#e63946' : 'inherit' }}>
                        {n.errors?.length || 0}
                        {n.errors?.length > 0 && (
                          <span title={n.errors.join('\n')} style={{ marginLeft: 4, cursor: 'help' }}>⚠️</span>
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

      {/* ── Blog ── */}
      {tab === 'blog' && (
        <section className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>📝 Blog</h2>
            <button className="btn btn-primary" onClick={openNewBlog}>+ Nieuw artikel</button>
          </div>

          {/* Editor */}
          {showBlogEditor && (
            <div className="blog-editor-overlay">
              <div className="blog-editor-panel">
                <div className="blog-editor-header">
                  <h3>{editingBlogId ? '✏️ Artikel bewerken' : '✏️ Nieuw artikel'}</h3>
                  <button className="blog-editor-close" onClick={() => setShowBlogEditor(false)}>✕</button>
                </div>

                <form onSubmit={handleSaveBlog} className="blog-editor-form">

                  {/* Basisinfo */}
                  <div className="blog-editor-row">
                    <label>Datum
                      <input type="date" value={blogForm.date}
                        onChange={e => setBlogForm(f => ({ ...f, date: e.target.value }))} />
                    </label>
                    <label>Leestijd (min)
                      <input type="number" min="1" max="60" value={blogForm.readTime}
                        onChange={e => setBlogForm(f => ({ ...f, readTime: +e.target.value }))} />
                    </label>
                    <label>
                      <span>Gepubliceerd</span>
                      <input type="checkbox" checked={blogForm.published}
                        onChange={e => setBlogForm(f => ({ ...f, published: e.target.checked }))}
                        style={{ width: 'auto', marginLeft: '.5rem' }} />
                    </label>
                  </div>

                  <label>Slug (URL — leeglaten = automatisch)
                    <input type="text" placeholder="mijn-artikel-titel"
                      value={blogForm.slug}
                      onChange={e => setBlogForm(f => ({ ...f, slug: e.target.value }))} />
                  </label>

                  <label>Afbeelding URL
                    <input type="url" placeholder="https://upload.wikimedia.org/…"
                      value={blogForm.image}
                      onChange={e => setBlogForm(f => ({ ...f, image: e.target.value }))} />
                    {blogForm.image && (
                      <img src={blogForm.image} alt="preview" className="blog-editor-img-preview" />
                    )}
                  </label>

                  {/* FR sectie */}
                  <div className="blog-editor-lang-section">
                    <div className="blog-editor-lang-header">🇫🇷 Frans <span className="blog-editor-lang-badge">Hoofdtaal</span></div>
                    <label>Categorie FR
                      <input type="text" value={blogForm.categoryFr}
                        onChange={e => setBlogForm(f => ({ ...f, categoryFr: e.target.value }))} />
                    </label>
                    <label>Titel FR *
                      <input type="text" required value={blogForm.titleFr}
                        onChange={e => setBlogForm(f => ({
                          ...f, titleFr: e.target.value,
                          slug: f.slug || makeBlogSlug(e.target.value),
                          readTime: calcReadTime(f.contentFr),
                        }))} />
                    </label>
                    <label>Samenvatting FR
                      <textarea rows={3} value={blogForm.excerptFr}
                        onChange={e => setBlogForm(f => ({ ...f, excerptFr: e.target.value }))} />
                    </label>
                    <label>
                      Inhoud FR (HTML)
                      <HtmlToolbar refObj={contentFrRef} field="contentFr" />
                      <textarea
                        ref={contentFrRef}
                        data-field="contentFr"
                        rows={14}
                        className="blog-editor-content"
                        value={blogForm.contentFr}
                        onChange={e => setBlogForm(f => ({
                          ...f, contentFr: e.target.value,
                          readTime: calcReadTime(e.target.value),
                        }))}
                      />
                    </label>
                  </div>

                  {/* Vertaal knop */}
                  <div className="blog-editor-translate-bar">
                    <button type="button" className="btn btn-primary" onClick={handleTranslate} disabled={translating}>
                      {translating ? '⏳ Claude vertaalt…' : '🤖 Vertaal FR → EN + NL met AI'}
                    </button>
                    <span className="admin-hint">Vult automatisch de EN- en NL-velden in. Je kunt daarna nog aanpassen.</span>
                  </div>

                  {/* EN sectie */}
                  <div className="blog-editor-lang-section">
                    <div className="blog-editor-lang-header">🇬🇧 Engels</div>
                    <label>Categorie EN
                      <input type="text" value={blogForm.categoryEn}
                        onChange={e => setBlogForm(f => ({ ...f, categoryEn: e.target.value }))} />
                    </label>
                    <label>Titel EN
                      <input type="text" value={blogForm.titleEn}
                        onChange={e => setBlogForm(f => ({ ...f, titleEn: e.target.value }))} />
                    </label>
                    <label>Samenvatting EN
                      <textarea rows={3} value={blogForm.excerptEn}
                        onChange={e => setBlogForm(f => ({ ...f, excerptEn: e.target.value }))} />
                    </label>
                    <label>
                      Inhoud EN (HTML)
                      <HtmlToolbar refObj={contentEnRef} field="contentEn" />
                      <textarea
                        ref={contentEnRef}
                        data-field="contentEn"
                        rows={10}
                        className="blog-editor-content"
                        value={blogForm.contentEn}
                        onChange={e => setBlogForm(f => ({ ...f, contentEn: e.target.value }))}
                      />
                    </label>
                  </div>

                  {/* NL sectie */}
                  <div className="blog-editor-lang-section">
                    <div className="blog-editor-lang-header">🇳🇱 Nederlands</div>
                    <label>Categorie NL
                      <input type="text" value={blogForm.categoryNl}
                        onChange={e => setBlogForm(f => ({ ...f, categoryNl: e.target.value }))} />
                    </label>
                    <label>Titel NL
                      <input type="text" value={blogForm.titleNl}
                        onChange={e => setBlogForm(f => ({ ...f, titleNl: e.target.value }))} />
                    </label>
                    <label>Samenvatting NL
                      <textarea rows={3} value={blogForm.excerptNl}
                        onChange={e => setBlogForm(f => ({ ...f, excerptNl: e.target.value }))} />
                    </label>
                    <label>
                      Inhoud NL (HTML)
                      <HtmlToolbar refObj={contentNlRef} field="contentNl" />
                      <textarea
                        ref={contentNlRef}
                        data-field="contentNl"
                        rows={10}
                        className="blog-editor-content"
                        value={blogForm.contentNl}
                        onChange={e => setBlogForm(f => ({ ...f, contentNl: e.target.value }))}
                      />
                    </label>
                  </div>

                  {/* Preview */}
                  {(blogForm.contentFr || blogForm.contentEn || blogForm.contentNl) && (
                    <div className="blog-editor-preview-section">
                      <div className="blog-editor-preview-header">
                        <span>👁️ Voorvertoning</span>
                        <div className="blog-preview-lang-btns">
                          {['fr', 'en', 'nl'].map(l => (
                            <button key={l} type="button"
                              className={`lang-btn${blogPreviewLang === l ? ' active' : ''}`}
                              onClick={() => setBlogPreviewLang(l)}>
                              {l.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="blog-editor-preview blog-post-content"
                        dangerouslySetInnerHTML={{
                          __html: blogForm[`content${blogPreviewLang.charAt(0).toUpperCase() + blogPreviewLang.slice(1)}`] || ''
                        }}
                      />
                    </div>
                  )}

                  {blogMsg && <p className="admin-msg">{blogMsg}</p>}

                  <div className="blog-editor-actions">
                    <button type="submit" className="btn btn-primary" disabled={savingBlog}>
                      {savingBlog ? '⏳ Opslaan…' : (editingBlogId ? '💾 Bijwerken' : '🚀 Publiceren')}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowBlogEditor(false)}>
                      Annuleren
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Artikelenlijst */}
          {blogLoading ? (
            <p className="loading">⏳ Artikelen laden…</p>
          ) : blogPosts.length === 0 ? (
            <p className="admin-hint" style={{ marginTop: '1.5rem' }}>
              Nog geen artikelen in Firestore. Klik op "+ Nieuw artikel" om te beginnen,
              of gebruik de statische artikelen in <code>src/data/posts.js</code>.
            </p>
          ) : (
            <table className="admin-table" style={{ marginTop: '1.5rem' }}>
              <thead>
                <tr>
                  <th>Titel (FR)</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Acties</th>
                </tr>
              </thead>
              <tbody>
                {blogPosts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <strong>{post.title?.fr || '—'}</strong>
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>/blog/{post.slug}</small>
                    </td>
                    <td>{post.date || '—'}</td>
                    <td>
                      <button
                        className={`status-badge${post.published ? ' status-ok' : ' status-pending'}`}
                        onClick={() => handleToggleBlogPublished(post.id, post.published)}
                        title="Klik om te wisselen"
                      >
                        {post.published ? '✅ Gepubliceerd' : '⏸ Concept'}
                      </button>
                    </td>
                    <td className="admin-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => openEditBlog(post)}>✏️ Bewerken</button>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">👁️ Bekijk</a>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBlog(post.id, post.title?.fr)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
