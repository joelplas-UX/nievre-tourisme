import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Authentieke foto's van de Nièvre & het Morvan — Wikimedia Commons (CC-licentie)
const SLIDES = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ouroux-en-Morvan._Paysage_typique.JPG/1280px-Ouroux-en-Morvan._Paysage_typique.JPG',
    caption: 'Paysage typique du Morvan — Ouroux',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Lac_des_settons_-_barrage_03.jpg/1280px-Lac_des_settons_-_barrage_03.jpg',
    caption: 'Lac des Settons — Havre de nature',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Nevers_Cathedrale.jpg',
    caption: 'Cathédrale de Nevers — Patrimoine',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Saut_du_Gouloux_%2833706270025%29.jpg/1280px-Saut_du_Gouloux_%2833706270025%29.jpg',
    caption: 'Saut du Gouloux — Cascade du Morvan',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Canal_du_Nivernais_DSC_0726.JPG/1280px-Canal_du_Nivernais_DSC_0726.JPG',
    caption: 'Canal du Nivernais — Balade fluviale',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/032_Paysage_du_Morvan_depuis_Ch%C3%A2teau-Chinon.jpg/1280px-032_Paysage_du_Morvan_depuis_Ch%C3%A2teau-Chinon.jpg',
    caption: 'Vue depuis Château-Chinon — Haut Morvan',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Vineyard_in_Burgundy%2C_France.jpg/1280px-Vineyard_in_Burgundy%2C_France.jpg',
    caption: 'Vignobles de Bourgogne — Gastronomie',
  },
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

  return (
    <section className="hero">
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

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={SLIDES[i].caption}
          />
        ))}
      </div>

      <span className="hero-caption">{SLIDES[current].caption}</span>
    </section>
  );
}
