import AdBanner from '../components/AdBanner';

const HIGHLIGHTS = [
  { emoji: '🏞️', title_fr: 'Lac des Settons', title_en: 'Lac des Settons', title_nl: 'Lac des Settons', desc_fr: 'Grand lac artificiel idéal pour la baignade, la voile et la pêche.', desc_en: 'Large reservoir perfect for swimming, sailing and fishing.', desc_nl: 'Groot stuwmeer ideaal voor zwemmen, zeilen en vissen.' },
  { emoji: '🏰', title_fr: 'Château-Chinon', title_en: 'Château-Chinon', title_nl: 'Château-Chinon', desc_fr: 'Capitale du Morvan avec musée Septennat de François Mitterrand.', desc_en: 'Capital of the Morvan with the Septennat museum of François Mitterrand.', desc_nl: 'Hoofdstad van de Morvan met het Septennaat-museum van Mitterrand.' },
  { emoji: '🌲', title_fr: 'Parc Naturel du Morvan', title_en: 'Morvan Natural Park', title_nl: 'Regionaal Natuurpark Morvan', desc_fr: '300 000 ha de forêts, lacs et rivières classés en parc naturel régional.', desc_en: '300,000 ha of forests, lakes and rivers in a regional natural park.', desc_nl: '300.000 ha bossen, meren en rivieren in een regionaal natuurpark.' },
  { emoji: '🚴', title_fr: 'Véloroutes du Morvan', title_en: 'Morvan Cycling Routes', title_nl: 'Fietsroutes Morvan', desc_fr: 'Des centaines de km de véloroutes et circuits VTT balisés.', desc_en: 'Hundreds of km of marked cycling and mountain biking routes.', desc_nl: 'Honderden km gemarkeerde fiets- en mountainbikeroutes.' },
  { emoji: '🍷', title_fr: 'Gastronomie Bourguignonne', title_en: 'Burgundy Gastronomy', title_nl: 'Bourgondische Gastronomie', desc_fr: 'Vins de Bourgogne, charolais, fromages et pain d\'épice de Dijon.', desc_en: 'Burgundy wines, Charolais beef, cheeses and Dijon gingerbread.', desc_nl: 'Bourgondische wijnen, charolais, kazen en Dijon peperkoek.' },
  { emoji: '⛪', title_fr: 'Vézelay', title_en: 'Vézelay', title_nl: 'Vézelay', desc_fr: 'Basilique romane classée UNESCO, point de départ du chemin de Saint-Jacques.', desc_en: 'UNESCO-listed Romanesque basilica, starting point of the Camino de Santiago.', desc_nl: 'UNESCO-geregistreerde Romaanse basiliek, startpunt van de Jacobsroute.' },
];

export default function RegionPage({ lang, tr }) {
  const tKey = l => l === 'fr' ? 'title_fr' : l === 'nl' ? 'title_nl' : 'title_en';
  const dKey = l => l === 'fr' ? 'desc_fr' : l === 'nl' ? 'desc_nl' : 'desc_en';

  return (
    <main className="page">
      <div className="page-header">
        <h1>{tr.region.title}</h1>
        <p className="region-intro">{tr.region.intro}</p>
      </div>

      <div className="ad-section">
        <AdBanner type="leaderboard" adSlot={import.meta.env.VITE_AD_SLOT_LEADERBOARD} />
      </div>

      <section className="section">
        <div className="highlights-grid">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="highlight-card">
              <div className="highlight-emoji">{h.emoji}</div>
              <h3>{h[tKey(lang)]}</h3>
              <p>{h[dKey(lang)]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section region-info">
        <div className="region-map-embed">
          <iframe
            title="Carte Nièvre"
            src="https://www.openstreetmap.org/export/embed.html?bbox=3.2%2C46.6%2C4.2%2C47.5&layer=mapnik&marker=47.0217%2C3.7153"
            style={{ width: '100%', height: '400px', border: 0, borderRadius: '12px' }}
          />
        </div>
      </section>

      <div className="ad-section">
        <AdBanner type="multiplex" adSlot={import.meta.env.VITE_AD_SLOT_MULTIPLEX} />
      </div>
    </main>
  );
}
