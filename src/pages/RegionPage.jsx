import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';

const HIGHLIGHTS = [
  {
    emoji: '🏞️', slug: 'lac-des-settons',
    title: { fr: 'Lac des Settons', en: 'Lac des Settons', nl: 'Lac des Settons' },
    desc: {
      fr: 'Grand lac artificiel de 360 ha, idéal pour la baignade, la voile, le kayak et les randonnées lacustres. L\'un des sites naturels les plus populaires du Morvan.',
      en: 'Large 360-hectare reservoir ideal for swimming, sailing, kayaking and lakeside walks. One of the Morvan\'s most popular natural sites.',
      nl: 'Groot stuwmeer van 360 ha, ideaal voor zwemmen, zeilen, kajakken en wandelingen langs het water. Een van de populairste natuurgebieden van de Morvan.',
    },
  },
  {
    emoji: '🏰', slug: 'chateau-chinon',
    title: { fr: 'Château-Chinon & le Musée Septennat', en: 'Château-Chinon & Septennat Museum', nl: 'Château-Chinon & Septennaatmuseum' },
    desc: {
      fr: 'Capitale du Morvan perchée sur une colline. Son musée du Septennat, unique en France, abrite les cadeaux officiels reçus par François Mitterrand. Panorama exceptionnel sur le Morvan.',
      en: 'Morvan capital perched on a hilltop. Its unique Septennat museum holds official gifts received by President Mitterrand. Exceptional panorama over the Morvan.',
      nl: 'Hoofdstad van de Morvan op een heuvel. Het unieke Septennaatmuseum bevat officiële geschenken ontvangen door president Mitterrand. Uitzonderlijk panorama over de Morvan.',
    },
  },
  {
    emoji: '🌲', slug: 'parc-naturel-morvan',
    title: { fr: 'Parc Naturel Régional du Morvan', en: 'Morvan Regional Natural Park', nl: 'Regionaal Natuurpark Morvan' },
    desc: {
      fr: '300 000 ha de forêts de hêtres et de chênes, de lacs glaciaires, de rivières et de tourbières. Classé Grand Site de France, c\'est l\'un des poumons verts de la Bourgogne.',
      en: '300,000 hectares of beech and oak forests, glacial lakes, rivers and peat bogs. Classified as a Grand Site de France and one of Burgundy\'s green lungs.',
      nl: '300.000 ha beuken- en eikenbossen, glaciale meren, rivieren en veengebieden. Geclassificeerd als Grand Site de France, een van de groene longen van Bourgondië.',
    },
  },
  {
    emoji: '⛪', slug: 'vezelay',
    title: { fr: 'Vézelay — Basilique UNESCO', en: 'Vézelay — UNESCO Basilica', nl: 'Vézelay — UNESCO Basiliek' },
    desc: {
      fr: 'La colline éternelle de Vézelay et sa basilique romane Sainte-Marie-Madeleine classée au patrimoine mondial de l\'UNESCO. Point de départ du chemin de Saint-Jacques-de-Compostelle.',
      en: 'The eternal hill of Vézelay and its Romanesque basilica, a UNESCO World Heritage site. Starting point of the Camino de Santiago pilgrimage route.',
      nl: 'De eeuwige heuvel van Vézelay en zijn Romaanse basiliek, UNESCO Werelderfgoed. Startpunt van de Santiago de Compostela pelgrimsroute.',
    },
  },
  {
    emoji: '🚴', slug: 'velo-morvan',
    title: { fr: 'Véloroutes & VTT', en: 'Cycling & Mountain Biking', nl: 'Fiets- en mountainbikeroutes' },
    desc: {
      fr: 'Plus de 600 km de véloroutes balisées dont la mythique <em>Route des Grands Lacs du Morvan</em>. Des parcours VTT pour tous niveaux dans les forêts du Parc.',
      en: 'Over 600 km of waymarked cycling routes including the legendary <em>Route des Grands Lacs du Morvan</em>. MTB trails for all levels in the Park forests.',
      nl: 'Meer dan 600 km bewegwijzerde fietsroutes waaronder de legendarische <em>Route des Grands Lacs du Morvan</em>. MTB-paden voor alle niveaus in de bosgebieden.',
    },
  },
  {
    emoji: '🍷', slug: 'gastronomie',
    title: { fr: 'Gastronomie Bourguignonne', en: 'Burgundy Gastronomy', nl: 'Bourgondische Gastronomie' },
    desc: {
      fr: 'Agneau du Charolais, fromages de chèvre, miel du Morvan, Pouilly-Fumé et Chablis. La Nièvre est à la croisée des grandes appellations bourguignonnes et ligériennes.',
      en: 'Charolais lamb, goat\'s cheeses, Morvan honey, Pouilly-Fumé and Chablis. The Nièvre sits at the crossroads of Burgundy\'s and Loire\'s great appellations.',
      nl: 'Charolais-lam, geitenkazen, honing uit de Morvan, Pouilly-Fumé en Chablis. De Nièvre ligt op het kruispunt van de grote Bourgondische en Loire-appellations.',
    },
  },
  {
    emoji: '🏛️', slug: 'nevers',
    title: { fr: 'Nevers — Capitale sur la Loire', en: 'Nevers — Capital on the Loire', nl: 'Nevers — Hoofdstad aan de Loire' },
    desc: {
      fr: 'Préfecture de la Nièvre sur les bords de la Loire. Cathédrale Saint-Cyr-et-Sainte-Julitte, palais ducal Renaissance, faïences de Nevers et circuit de Magny-Cours à 10 km.',
      en: 'Nièvre\'s prefecture on the Loire. Saint-Cyr Cathedral, Renaissance ducal palace, Nevers faience pottery and the Magny-Cours racing circuit 10 km away.',
      nl: 'Hoofdstad van de Nièvre aan de Loire. Kathedraal Saint-Cyr, Renaissance hertogelijk paleis, Nevers aardewerk en het Magny-Cours racecircuit op 10 km.',
    },
  },
  {
    emoji: '🌊', slug: 'canaux',
    title: { fr: 'Le Canal du Nivernais', en: 'Canal du Nivernais', nl: 'Canal du Nivernais' },
    desc: {
      fr: '174 km de canal reliant Auxerre à Decize, classé parmi les plus beaux canaux de France. Idéal pour une croisière fluviale ou un voyage à vélo entre écluses et villages de caractère.',
      en: '174 km of canal linking Auxerre to Decize, ranked among France\'s most beautiful waterways. Ideal for a river cruise or cycling holiday between locks and characterful villages.',
      nl: '174 km kanaal van Auxerre naar Decize, een van de mooiste waterwegen van Frankrijk. Ideaal voor een riviercruise of fietsreis langs sluizen en pittoreske dorpjes.',
    },
  },
];

const SEASONS = {
  fr: [
    { icon: '🌸', name: 'Printemps', months: 'Mars — Mai', desc: 'La nature s\'éveille, les cascades sont au maximum. Idéal pour les randonnées, la pêche et Pâques en famille.' },
    { icon: '☀️', name: 'Été',        months: 'Juin — Août', desc: 'Saison des baignades dans les lacs, festivals en plein air, marchés nocturnes et tourisme vert à son apogée.' },
    { icon: '🍂', name: 'Automne',   months: 'Sep — Nov', desc: 'Le Morvan se pare de couleurs flamboyantes. Saison des champignons, randonnées dorées et gastronomie de saison.' },
    { icon: '❄️', name: 'Hiver',     months: 'Déc — Fév', desc: 'Marchés de Noël à Nevers et Clamecy, randonnées enneigées, soirées au coin du feu dans les gîtes du Morvan.' },
  ],
  en: [
    { icon: '🌸', name: 'Spring', months: 'March — May', desc: 'Nature awakens, waterfalls are at their peak. Ideal for hiking, fishing and family Easter stays.' },
    { icon: '☀️', name: 'Summer', months: 'June — Aug', desc: 'Swimming in the lakes, open-air festivals, night markets and green tourism at its height.' },
    { icon: '🍂', name: 'Autumn', months: 'Sep — Nov', desc: 'The Morvan blazes with colour. Mushroom season, golden walks and seasonal gastronomy.' },
    { icon: '❄️', name: 'Winter', months: 'Dec — Feb', desc: 'Christmas markets in Nevers and Clamecy, snowy walks, evenings by the fire in Morvan gîtes.' },
  ],
  nl: [
    { icon: '🌸', name: 'Lente', months: 'Maart — Mei', desc: 'De natuur ontwaakt, watervallen staan op hun hoogste stand. Ideaal voor wandelen, vissen en Pasen met het gezin.' },
    { icon: '☀️', name: 'Zomer', months: 'Juni — Aug', desc: 'Zwemmen in de meren, openluchtfestivals, nachtmarkten en groen toerisme op zijn hoogtepunt.' },
    { icon: '🍂', name: 'Herfst', months: 'Sep — Nov', desc: 'De Morvan kleurt prachtig. Paddenstoelenseizoen, gouden wandelingen en seizoensgastronomie.' },
    { icon: '❄️', name: 'Winter', months: 'Dec — Feb', desc: 'Kerstmarkten in Nevers en Clamecy, besneeuwd wandelen, avonden bij het vuur in Morvan-gîtes.' },
  ],
};

const NUMBERS = {
  fr:  [{ n: '300 000', l: 'hectares de Parc Naturel' }, { n: '+600 km', l: 'de véloroutes balisées' }, { n: '90', l: 'lacs et étangs' }, { n: '2,5h', l: 'de Paris en TGV' }],
  en:  [{ n: '300,000', l: 'hectares of Natural Park' }, { n: '+600 km', l: 'of waymarked cycling routes' }, { n: '90', l: 'lakes and ponds' }, { n: '2.5h', l: 'from Paris by TGV' }],
  nl:  [{ n: '300.000', l: 'hectare Natuurpark' }, { n: '+600 km', l: 'bewegwijzerde fietsroutes' }, { n: '90', l: 'meren en vijvers' }, { n: '2,5u', l: 'van Parijs per TGV' }],
};

const INTROS = {
  fr: 'Nichée au cœur de la Bourgogne, la Nièvre et le Parc Naturel Régional du Morvan forment une des régions naturelles les plus préservées de France. Forêts centenaires, lacs aux eaux claires, canaux paisibles et villages de caractère : bienvenue dans une Bourgogne encore sauvage.',
  en: 'Nestled in the heart of Burgundy, the Nièvre and the Morvan Regional Natural Park form one of France\'s most unspoilt natural regions. Ancient forests, clear lakes, peaceful canals and villages full of character: welcome to a wilder side of Burgundy.',
  nl: 'Gelegen in het hart van Bourgondië vormen de Nièvre en het Regionaal Natuurpark Morvan een van de meest ongerepte natuurgebieden van Frankrijk. Eeuwenoude bossen, heldere meren, rustige kanalen en pittoreske dorpen: welkom in een wilder Bourgondië.',
};

const HEADINGS = {
  fr:  { highlights: 'Sites incontournables', seasons: 'La région au fil des saisons', numbers: 'La Nièvre en chiffres', cta: 'Prêt à explorer ?', ctaEvents: 'Voir les événements', ctaActivities: 'Découvrir les activités', ctaBlog: 'Lire notre blog' },
  en:  { highlights: 'Must-see sites', seasons: 'The region through the seasons', numbers: 'The Nièvre in numbers', cta: 'Ready to explore?', ctaEvents: 'See events', ctaActivities: 'Discover activities', ctaBlog: 'Read our blog' },
  nl:  { highlights: 'Onmisbare plekken', seasons: 'De regio door de seizoenen', numbers: 'De Nièvre in cijfers', cta: 'Klaar om te ontdekken?', ctaEvents: 'Evenementen', ctaActivities: 'Activiteiten', ctaBlog: 'Ons blog lezen' },
};

export default function RegionPage({ lang }) {
  const h  = HEADINGS[lang]  || HEADINGS.fr;
  const ss = SEASONS[lang]   || SEASONS.fr;
  const ns = NUMBERS[lang]   || NUMBERS.fr;

  return (
    <main className="page">
      <div className="page-header">
        <h1>{lang === 'nl' ? 'De Nièvre & de Morvan' : lang === 'en' ? 'The Nièvre & Morvan' : 'La Nièvre & le Morvan'}</h1>
        <p className="region-intro">{INTROS[lang] || INTROS.fr}</p>
      </div>

      {/* Kerncijfers */}
      <section className="section region-numbers">
        {ns.map((n, i) => (
          <div key={i} className="region-number-card">
            <span className="region-number">{n.n}</span>
            <span className="region-number-label">{n.l}</span>
          </div>
        ))}
      </section>

      <div className="ad-section">
        <AdBanner type="leaderboard" adSlot={import.meta.env.VITE_AD_SLOT_LEADERBOARD} />
      </div>

      {/* Hoogtepunten */}
      <section className="section">
        <h2 className="section-title">{h.highlights}</h2>
        <div className="highlights-grid">
          {HIGHLIGHTS.map((item, i) => (
            <div key={i} className="highlight-card">
              <div className="highlight-emoji">{item.emoji}</div>
              <h3>{item.title[lang] || item.title.fr}</h3>
              <p dangerouslySetInnerHTML={{ __html: item.desc[lang] || item.desc.fr }} />
            </div>
          ))}
        </div>
      </section>

      {/* Seizoenen */}
      <section className="section region-seasons">
        <h2 className="section-title">{h.seasons}</h2>
        <div className="seasons-grid">
          {ss.map((s, i) => (
            <div key={i} className="season-card">
              <div className="season-icon">{s.icon}</div>
              <div className="season-name">{s.name}</div>
              <div className="season-months">{s.months}</div>
              <p className="season-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kaart */}
      <section className="section region-info">
        <div className="region-map-embed">
          <iframe
            title="Carte Nièvre & Morvan"
            src="https://www.openstreetmap.org/export/embed.html?bbox=3.2%2C46.6%2C4.2%2C47.5&layer=mapnik&marker=47.0217%2C3.7153"
            style={{ width: '100%', height: '420px', border: 0, borderRadius: '12px' }}
            loading="lazy"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="section region-cta">
        <h2>{h.cta}</h2>
        <div className="region-cta-btns">
          <Link to="/evenements" className="btn btn-primary">{h.ctaEvents}</Link>
          <Link to="/activites" className="btn btn-outline">{h.ctaActivities}</Link>
          <Link to="/blog" className="btn btn-outline">{h.ctaBlog}</Link>
        </div>
      </section>

      <div className="ad-section">
        <AdBanner type="multiplex" adSlot={import.meta.env.VITE_AD_SLOT_MULTIPLEX} />
      </div>
    </main>
  );
}
