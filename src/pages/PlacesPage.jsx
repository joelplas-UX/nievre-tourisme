import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import { useSEO } from '../hooks/useSEO';
import { PLACES, PLACE_CATEGORIES, CATEGORY_LABELS } from '../data/places';

const INTRO = {
  fr: 'Villes de caractère, lacs, cascades et sites classés : explorez les lieux incontournables de la Nièvre et du Morvan, avec pour chacun une fiche pratique pour préparer votre visite.',
  en: 'Characterful towns, lakes, waterfalls and listed sites: explore the must-see places of the Nièvre and Morvan, each with a practical guide to plan your visit.',
  nl: 'Karaktervolle steden, meren, watervallen en beschermde sites: ontdek de mooiste plekken van de Nièvre en het Morvan, elk met een praktische pagina om je bezoek voor te bereiden.',
};

const HEADING = {
  fr: 'Ontdek de Nièvre — Lieux à découvrir',
  en: 'Discover the Nièvre — Places to explore',
  nl: 'Ontdek de Nièvre — Plaatsen om te ontdekken',
};

export default function PlacesPage({ lang, tr }) {
  useSEO({ title: tr?.pageTitles?.places, description: tr?.seoDesc?.places, path: '/plaatsen', lang });
  const [cat, setCat] = useState('all');

  const places = cat === 'all' ? PLACES : PLACES.filter(p => p.category === cat);

  return (
    <main className="page">
      <div className="page-header">
        <h1>{HEADING[lang] || HEADING.fr}</h1>
        <p className="region-intro">{INTRO[lang] || INTRO.fr}</p>
      </div>

      <div className="filters">
        <div className="filter-chips">
          {PLACE_CATEGORIES.map(c => (
            <button
              key={c}
              className={`chip${cat === c ? ' active' : ''}`}
              onClick={() => setCat(c)}
            >
              {CATEGORY_LABELS[c]?.[lang] || CATEGORY_LABELS[c]?.fr || c}
            </button>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="cards-grid places-grid">
          {places.map(p => (
            <Link key={p.slug} to={`/plaatsen/${p.slug}`} className="place-card">
              <div
                className="place-card-img"
                style={{ backgroundImage: `url(${p.image})` }}
                role="img"
                aria-label={p.name[lang] || p.name.fr}
              />
              <div className="place-card-body">
                <span className="place-card-cat">
                  {p.emoji} {CATEGORY_LABELS[p.category]?.[lang] || CATEGORY_LABELS[p.category]?.fr}
                </span>
                <h3>{p.name[lang] || p.name.fr}</h3>
                <p>{p.short[lang] || p.short.fr}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="ad-section">
        <AdBanner type="multiplex" adSlot={import.meta.env.VITE_AD_SLOT_MULTIPLEX} />
      </div>
    </main>
  );
}
