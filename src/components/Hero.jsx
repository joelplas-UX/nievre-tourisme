import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Echte foto's van de Nièvre & het Morvan — Wikimedia Commons (CC-licentie)
const SLIDES = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/France_-_Bourgogne_-_Morvan_-_Bourgogne_-_Ni%C3%A8vre_-_Vue_depuis_le_mont_Moux_%28M%C3%A9diHAL_1266977%29.jpg/1280px-France_-_Bourgogne_-_Morvan_-_Bourgogne_-_Ni%C3%A8vre_-_Vue_depuis_le_mont_Moux_%28M%C3%A9diHAL_1266977%29.jpg',
    caption: 'Vue depuis le Mont Moux — Nièvre',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Coucher_de_soleil_au_lac_des_Settons_-_panoramio.jpg/1280px-Coucher_de_soleil_au_lac_des_Settons_-_panoramio.jpg',
    caption: 'Lac des Settons — Morvan',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/France_-_Bourgogne_-_Morvan_-_Bourgogne_-_Ni%C3%A8vre_-_Vue_panoramique_depuis_le_Calvaire_de_Ch%C3%A2teau-Chinon_sur_la_cuvette_d%E2%80%99Arleuf_et_le_Haut_Morvan_%28M%C3%A9diHAL_1267224%29.jpg/1280px-thumbnail.jpg',
    caption: 'Haut Morvan depuis Château-Chinon',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/54/V%C3%A9zelay.jpg',
    caption: 'Vézelay — Nièvre',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Source_de_l%27Yonne.jpg/1280px-Source_de_l%27Yonne.jpg',
    caption: "Source de l'Yonne — Morvan",
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
