import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import RegionPage from './pages/RegionPage';
import AdminPage from './pages/AdminPage';
import SubmitPage from './pages/SubmitPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import { t } from './i18n';
import './App.css';

export default function App() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang');
    if (saved && ['fr', 'en', 'nl'].includes(saved)) return saved;
    const browser = navigator.language?.slice(0, 2);
    if (browser === 'nl') return 'nl';
    if (browser === 'en') return 'en';
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const tr = t[lang];

  return (
    <BrowserRouter>
      <div className="app">
        <Header lang={lang} setLang={setLang} tr={tr} />
        <Routes>
          <Route path="/" element={<HomePage lang={lang} tr={tr} />} />
          <Route path="/evenements" element={<EventsPage lang={lang} tr={tr} />} />
          <Route path="/activites" element={<ActivitiesPage lang={lang} tr={tr} />} />
          <Route path="/region" element={<RegionPage lang={lang} tr={tr} />} />
          <Route path="/proposer" element={<SubmitPage lang={lang} tr={tr} />} />
          <Route path="/admin" element={<AdminPage lang={lang} tr={tr} />} />
          <Route path="/blog" element={<BlogPage lang={lang} tr={tr} />} />
          <Route path="/blog/:slug" element={<BlogPostPage lang={lang} tr={tr} />} />
          <Route path="/privacy" element={<PrivacyPage lang={lang} tr={tr} />} />
          <Route path="/contact" element={<ContactPage lang={lang} tr={tr} />} />
          <Route path="/over" element={<AboutPage lang={lang} tr={tr} />} />
        </Routes>
        <Footer tr={tr} lang={lang} />
        <CookieBanner lang={lang} />
      </div>
    </BrowserRouter>
  );
}
