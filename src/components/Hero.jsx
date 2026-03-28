import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Landschapsbeelden van de Nièvre & het Morvan
// Vervang door eigen Morvan-foto's via het admin-paneel (Foto's-tab)
const SLIDES = [
  { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80', caption: 'Forêt du Morvan' },
  { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80', caption: 'Lac des Settons' },
  { url: 'https://images.unsplash.com/photo-1504233529500-5bd93c6a0944?w=1600&q=80', caption: 'Collines du Morvan' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=80', caption: 'Nièvre — Bourgogne' },
  { url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d047a?w=1600&q=80', caption: 'Sentiers du Morvan' },
];

const INTERVAL = 6500;

export default function Hero({ tr }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i) => setCurrent(i);

  return (
    <section className="hero">
      {/* Slideshow achtergrondlagen */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide${i === current ? ' active' : ''}`}
          style={{ backgroundImage: `url('${slide.url}')` }}
        />
      ))}

      <div className="hero-overlay" />

      <div className="hero-content">
        <h1>{tr.hero.title}</h1>
        <p>{tr.hero.subtitle}</p>
        <Link to="/evenements" className="btn btn-primary">{tr.hero.cta} →</Link>
      </div>

      {/* Navigatiestippen */}
      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === current ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={SLIDES[i].caption}
          />
        ))}
      </div>

      {/* Fotolabel */}
      <span className="hero-caption">{SLIDES[current].caption}</span>
    </section>
  );
}
