/**
 * places.js — verzorgde "Plaatsen"-gids (Ontdek de Nièvre)
 *
 * Vaste, redactionele content in FR/EN/NL. Elke plaats krijgt een kaart op
 * /plaatsen en een detailpagina op /plaatsen/{slug}.
 *
 * Velden:
 *   slug      — URL-segment (uniek)
 *   category  — 'stad' | 'natuur' | 'patrimonium' | 'gastronomie'
 *   emoji     — icoon voor kaart/koptekst
 *   image     — Wikimedia Commons foto (1280px)
 *   coords    — { lat, lng } voor de OpenStreetMap-embed
 *   name      — { fr, en, nl }
 *   short     — { fr, en, nl }  korte kaart-tekst (1–2 zinnen)
 *   long      — { fr, en, nl }  HTML voor de detailpagina (<p>, <h2>, <ul>, <strong>)
 *   practical — { fr, en, nl }  praktische tip / bereikbaarheid (optioneel)
 */

export const PLACE_CATEGORIES = ['all', 'stad', 'natuur', 'patrimonium', 'gastronomie'];

export const CATEGORY_LABELS = {
  all:         { fr: 'Tout',        en: 'All',       nl: 'Alles' },
  stad:        { fr: 'Villes',      en: 'Towns',     nl: 'Steden & dorpen' },
  natuur:      { fr: 'Nature',      en: 'Nature',    nl: 'Natuur' },
  patrimonium: { fr: 'Patrimoine',  en: 'Heritage',  nl: 'Erfgoed' },
  gastronomie: { fr: 'Gastronomie', en: 'Food & wine', nl: 'Eten & wijn' },
};

export const PLACES = [
  {
    slug: 'nevers', category: 'stad', emoji: '🏛️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Nevers-Loirebr%C3%A9ck--w.jpg/1280px-Nevers-Loirebr%C3%A9ck--w.jpg',
    coords: { lat: 46.9896, lng: 3.1590 },
    name: { fr: 'Nevers', en: 'Nevers', nl: 'Nevers' },
    short: {
      fr: 'Préfecture de la Nièvre au bord de la Loire : cathédrale, palais ducal et faïences réputées.',
      en: 'The Nièvre’s capital on the banks of the Loire: cathedral, ducal palace and famous faience pottery.',
      nl: 'Hoofdstad van de Nièvre aan de Loire: kathedraal, hertogelijk paleis en beroemd aardewerk.',
    },
    long: {
      fr: '<p>Capitale de la Nièvre posée sur les bords de la Loire, Nevers séduit par son centre médiéval et Renaissance. La ville est réputée pour ses <strong>faïences</strong>, un art du feu vieux de plus de quatre siècles.</p><h2>À voir</h2><ul><li>La cathédrale Saint-Cyr-et-Sainte-Julitte, aux deux absides romane et gothique</li><li>Le palais ducal, premier château de la Loire</li><li>La chapelle Sainte-Bernadette et le couvent Saint-Gildard</li><li>Le circuit de Nevers Magny-Cours, à 10 km</li></ul>',
      en: '<p>The Nièvre’s capital sits on the banks of the Loire, charming visitors with its medieval and Renaissance centre. The town is famous for its <strong>faience pottery</strong>, a craft over four centuries old.</p><h2>Highlights</h2><ul><li>Saint-Cyr-et-Sainte-Julitte Cathedral, with its Romanesque and Gothic apses</li><li>The ducal palace, the first château of the Loire</li><li>The Sainte-Bernadette chapel and Saint-Gildard convent</li><li>The Nevers Magny-Cours racing circuit, 10 km away</li></ul>',
      nl: '<p>De hoofdstad van de Nièvre ligt aan de oevers van de Loire en bekoort met haar middeleeuwse en renaissancecentrum. De stad staat bekend om haar <strong>aardewerk (faience)</strong>, een ambacht van ruim vier eeuwen oud.</p><h2>Bezienswaardig</h2><ul><li>De kathedraal Saint-Cyr-et-Sainte-Julitte met een Romaanse én gotische apsis</li><li>Het hertogelijk paleis, het eerste kasteel van de Loire</li><li>De Sainte-Bernadette-kapel en het klooster Saint-Gildard</li><li>Het racecircuit Nevers Magny-Cours, op 10 km</li></ul>',
    },
    practical: {
      fr: 'À 2h05 de Paris en train (gare de Nevers). Point de départ idéal pour explorer la vallée de la Loire nivernaise.',
      en: '2h05 from Paris by train (Nevers station). An ideal base to explore the Nivernais stretch of the Loire valley.',
      nl: 'Op 2u05 van Parijs met de trein (station Nevers). Ideale uitvalsbasis voor de Loirevallei in de Nièvre.',
    },
  },
  {
    slug: 'chateau-chinon', category: 'stad', emoji: '🏰',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ch%C3%A2teau-Chinon_%28Ville%29_-_Vue_depuis_le_Calvaire.jpg/1280px-Ch%C3%A2teau-Chinon_%28Ville%29_-_Vue_depuis_le_Calvaire.jpg',
    coords: { lat: 47.0664, lng: 3.9330 },
    name: { fr: 'Château-Chinon', en: 'Château-Chinon', nl: 'Château-Chinon' },
    short: {
      fr: 'Capitale du Morvan perchée sur une colline, avec le musée du Septennat unique en France.',
      en: 'Capital of the Morvan, perched on a hill, home to the unique Septennat museum.',
      nl: 'Hoofdstad van het Morvan op een heuvel, met het unieke Septennaatmuseum.',
    },
    long: {
      fr: '<p>Perchée à près de 600 m, Château-Chinon est la capitale historique du Morvan et offre un <strong>panorama exceptionnel</strong> sur les monts alentour. François Mitterrand y fut maire pendant plus de vingt ans.</p><h2>À voir</h2><ul><li>Le musée du Septennat : les cadeaux officiels reçus par le président Mitterrand</li><li>Le musée du Costume</li><li>La fontaine monumentale de Niki de Saint Phalle et Jean Tinguely</li><li>Le Calvaire et son panorama à 360°</li></ul>',
      en: '<p>Perched at nearly 600 m, Château-Chinon is the historic capital of the Morvan and offers an <strong>exceptional panorama</strong> over the surrounding hills. François Mitterrand was its mayor for more than twenty years.</p><h2>Highlights</h2><ul><li>The Septennat museum: official gifts received by President Mitterrand</li><li>The Costume museum</li><li>The monumental fountain by Niki de Saint Phalle and Jean Tinguely</li><li>The Calvaire hill with its 360° view</li></ul>',
      nl: '<p>Op bijna 600 m hoogte is Château-Chinon de historische hoofdstad van het Morvan, met een <strong>uitzonderlijk panorama</strong> over de omliggende heuvels. François Mitterrand was hier ruim twintig jaar burgemeester.</p><h2>Bezienswaardig</h2><ul><li>Het Septennaatmuseum: officiële geschenken van president Mitterrand</li><li>Het Kostuummuseum</li><li>De monumentale fontein van Niki de Saint Phalle en Jean Tinguely</li><li>De Calvaire-heuvel met 360°-uitzicht</li></ul>',
    },
    practical: {
      fr: 'Cœur du Parc naturel régional du Morvan, idéal comme camp de base pour la randonnée.',
      en: 'In the heart of the Morvan Natural Park — an ideal base camp for hiking.',
      nl: 'In het hart van het Natuurpark Morvan — ideale uitvalsbasis om te wandelen.',
    },
  },
  {
    slug: 'clamecy', category: 'stad', emoji: '🏘️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/FR-58-Clamecy07.JPG/1280px-FR-58-Clamecy07.JPG',
    coords: { lat: 47.4614, lng: 3.5215 },
    name: { fr: 'Clamecy', en: 'Clamecy', nl: 'Clamecy' },
    short: {
      fr: 'Ville d’art et d’histoire, ancienne capitale du flottage du bois vers Paris.',
      en: 'A town of art and history, once the capital of log-floating to Paris.',
      nl: 'Stad van kunst en historie, ooit hoofdstad van het houtvlotten naar Parijs.',
    },
    long: {
      fr: '<p>Blottie au confluent de l’Yonne et du Beuvron, Clamecy fut pendant des siècles la capitale du <strong>flottage du bois</strong> : le bois du Morvan y était assemblé en trains de bûches et acheminé jusqu’à Paris.</p><h2>À voir</h2><ul><li>La collégiale Saint-Martin, gothique</li><li>Les ruelles médiévales du vieux Clamecy</li><li>Le musée d’art et d’histoire Romain Rolland</li><li>Les bords de l’Yonne et le canal du Nivernais</li></ul>',
      en: '<p>Nestled where the Yonne meets the Beuvron, Clamecy was for centuries the capital of <strong>log floating</strong>: Morvan timber was lashed into rafts here and floated all the way to Paris.</p><h2>Highlights</h2><ul><li>The Gothic Saint-Martin collegiate church</li><li>The medieval lanes of old Clamecy</li><li>The Romain Rolland museum of art and history</li><li>The banks of the Yonne and the Canal du Nivernais</li></ul>',
      nl: '<p>Gelegen waar de Yonne en de Beuvron samenkomen, was Clamecy eeuwenlang de hoofdstad van het <strong>houtvlotten</strong>: hout uit het Morvan werd hier tot vlotten gebonden en naar Parijs gevlot.</p><h2>Bezienswaardig</h2><ul><li>De gotische collegiale kerk Saint-Martin</li><li>De middeleeuwse straatjes van oud-Clamecy</li><li>Het kunst- en historiemuseum Romain Rolland</li><li>De oevers van de Yonne en het Canal du Nivernais</li></ul>',
    },
  },
  {
    slug: 'decize', category: 'stad', emoji: '🏝️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/FR-58-Decize33.JPG/1280px-FR-58-Decize33.JPG',
    coords: { lat: 46.8281, lng: 3.4600 },
    name: { fr: 'Decize', en: 'Decize', nl: 'Decize' },
    short: {
      fr: 'Ville insulaire entre Loire et canaux, au carrefour de trois voies d’eau.',
      en: 'An island town between the Loire and canals, where three waterways meet.',
      nl: 'Eilandstadje tussen Loire en kanalen, op het kruispunt van drie waterwegen.',
    },
    long: {
      fr: '<p>Bâtie sur une île entre les bras de la Loire, Decize est un carrefour fluvial où se rencontrent la Loire, le canal latéral à la Loire et le <strong>canal du Nivernais</strong>. Un paradis pour les plaisanciers et les cyclistes.</p><h2>À voir</h2><ul><li>La promenade des Halles et ses platanes centenaires</li><li>L’église Saint-Aré et sa crypte mérovingienne</li><li>Le port de plaisance, départ de croisières fluviales</li><li>La vieille ville et les vestiges du château des comtes de Nevers</li></ul>',
      en: '<p>Built on an island between the arms of the Loire, Decize is a river crossroads where the Loire, the Loire lateral canal and the <strong>Canal du Nivernais</strong> meet. A paradise for boaters and cyclists.</p><h2>Highlights</h2><ul><li>The Promenade des Halles with its century-old plane trees</li><li>Saint-Aré church and its Merovingian crypt</li><li>The marina, starting point for river cruises</li><li>The old town and remains of the counts of Nevers’ castle</li></ul>',
      nl: '<p>Gebouwd op een eiland tussen de armen van de Loire is Decize een rivierknooppunt waar de Loire, het zijkanaal van de Loire en het <strong>Canal du Nivernais</strong> samenkomen. Een paradijs voor pleziervaart en fietsers.</p><h2>Bezienswaardig</h2><ul><li>De Promenade des Halles met eeuwenoude platanen</li><li>De Saint-Aré-kerk met Merovingische crypte</li><li>De jachthaven, vertrekpunt voor riviercruises</li><li>De oude stad en de resten van het kasteel van de graven van Nevers</li></ul>',
    },
  },
  {
    slug: 'cosne-cours-sur-loire', category: 'stad', emoji: '⚓',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bords_de_Loire_et_pont%2C_Cosne-Cours-sur-Loire.jpg/1280px-Bords_de_Loire_et_pont%2C_Cosne-Cours-sur-Loire.jpg',
    coords: { lat: 47.4111, lng: 2.9260 },
    name: { fr: 'Cosne-Cours-sur-Loire', en: 'Cosne-Cours-sur-Loire', nl: 'Cosne-Cours-sur-Loire' },
    short: {
      fr: 'Porte nord de la Nièvre sur la Loire, aux portes du vignoble de Pouilly et Sancerre.',
      en: 'The northern gateway to the Nièvre on the Loire, near the Pouilly and Sancerre vineyards.',
      nl: 'Noordelijke toegangspoort van de Nièvre aan de Loire, vlakbij de wijngaarden van Pouilly en Sancerre.',
    },
    long: {
      fr: '<p>Ancienne cité des forges royales, Cosne-Cours-sur-Loire s’étire le long du fleuve, face au vignoble. La ville est une étape de <strong>La Loire à Vélo</strong> et une base parfaite pour découvrir les vins du centre-Loire.</p><h2>À voir</h2><ul><li>Les bords de Loire et le pont sur le fleuve sauvage</li><li>Le musée de la Loire</li><li>Les églises Saint-Agnan et Saint-Jacques</li><li>Le vignoble de Pouilly-Fumé et de Sancerre tout proche</li></ul>',
      en: '<p>A former royal forge town, Cosne-Cours-sur-Loire stretches along the river, facing the vineyards. The town is a stage on <strong>La Loire à Vélo</strong> and a perfect base to discover the wines of the central Loire.</p><h2>Highlights</h2><ul><li>The banks of the wild Loire and its bridge</li><li>The Loire museum</li><li>The Saint-Agnan and Saint-Jacques churches</li><li>The nearby Pouilly-Fumé and Sancerre vineyards</li></ul>',
      nl: '<p>De voormalige koninklijke smederijstad Cosne-Cours-sur-Loire strekt zich uit langs de rivier, tegenover de wijngaarden. De stad ligt aan de fietsroute <strong>La Loire à Vélo</strong> en is een perfecte basis voor de wijnen van de midden-Loire.</p><h2>Bezienswaardig</h2><ul><li>De oevers van de wilde Loire en de brug</li><li>Het Loiremuseum</li><li>De kerken Saint-Agnan en Saint-Jacques</li><li>De nabijgelegen wijngaarden van Pouilly-Fumé en Sancerre</li></ul>',
    },
  },
  {
    slug: 'la-charite-sur-loire', category: 'patrimonium', emoji: '📖',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/10_La_Charit%C3%A9_DSCN2158.JPG/1280px-10_La_Charit%C3%A9_DSCN2158.JPG',
    coords: { lat: 47.1806, lng: 3.0175 },
    name: { fr: 'La Charité-sur-Loire', en: 'La Charité-sur-Loire', nl: 'La Charité-sur-Loire' },
    short: {
      fr: 'Cité du livre classée UNESCO, autour de son prieuré clunisien sur les chemins de Compostelle.',
      en: 'A UNESCO “book town” built around its Cluniac priory on the Compostela pilgrim routes.',
      nl: 'UNESCO-“boekenstad” rond haar Cluniacenzer priorij op de route naar Compostela.',
    },
    long: {
      fr: '<p>La Charité-sur-Loire est célèbre pour son <strong>prieuré clunisien</strong>, inscrit au patrimoine mondial de l’UNESCO au titre des chemins de Saint-Jacques-de-Compostelle. Depuis 2000, c’est aussi une <strong>Cité du mot</strong>, dédiée au livre.</p><h2>À voir</h2><ul><li>L’église prieurale Notre-Dame, chef-d’œuvre roman</li><li>Les nombreuses librairies et bouquinistes</li><li>Le festival et les résidences d’écrivains</li><li>Le pont médiéval et les bords de Loire</li></ul>',
      en: '<p>La Charité-sur-Loire is famous for its <strong>Cluniac priory</strong>, a UNESCO World Heritage site on the Camino de Santiago routes. Since 2000 it has also been a <strong>Book Town</strong> devoted to the written word.</p><h2>Highlights</h2><ul><li>The Notre-Dame priory church, a Romanesque masterpiece</li><li>Its many bookshops and second-hand booksellers</li><li>The literary festival and writers’ residencies</li><li>The medieval bridge and Loire riverside</li></ul>',
      nl: '<p>La Charité-sur-Loire is beroemd om haar <strong>Cluniacenzer priorij</strong>, UNESCO-werelderfgoed langs de pelgrimsroutes naar Santiago de Compostela. Sinds 2000 is het ook een <strong>boekenstad</strong>, gewijd aan het geschreven woord.</p><h2>Bezienswaardig</h2><ul><li>De priorijkerk Notre-Dame, een Romaans meesterwerk</li><li>De vele boekhandels en antiquariaten</li><li>Het literatuurfestival en schrijversresidenties</li><li>De middeleeuwse brug en de Loire-oevers</li></ul>',
    },
  },
  {
    slug: 'vezelay', category: 'patrimonium', emoji: '⛪',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Village_de_V%C3%A9zelay.jpg/1280px-Village_de_V%C3%A9zelay.jpg',
    coords: { lat: 47.4664, lng: 3.7480 },
    name: { fr: 'Vézelay', en: 'Vézelay', nl: 'Vézelay' },
    short: {
      fr: 'La « colline éternelle » et sa basilique romane classée UNESCO, aux portes du Morvan.',
      en: 'The “eternal hill” and its UNESCO Romanesque basilica, at the gateway to the Morvan.',
      nl: 'De “eeuwige heuvel” en zijn UNESCO-basiliek, aan de rand van het Morvan.',
    },
    long: {
      fr: '<p>Perché sur sa colline aux confins du Morvan, Vézelay est l’un des plus beaux villages de France. Sa <strong>basilique Sainte-Marie-Madeleine</strong>, joyau de l’art roman, est classée au patrimoine mondial de l’UNESCO et point de départ historique des chemins de Compostelle.</p><h2>À voir</h2><ul><li>La basilique et son tympan sculpté</li><li>Le panorama sur la vallée de la Cure et le Morvan</li><li>Les ruelles bordées de maisons de vignerons</li><li>Le vignoble AOC Vézelay</li></ul>',
      en: '<p>Perched on its hill at the edge of the Morvan, Vézelay is one of the most beautiful villages in France. Its <strong>Sainte-Marie-Madeleine basilica</strong>, a jewel of Romanesque art, is a UNESCO World Heritage site and a historic starting point of the Compostela routes.</p><h2>Highlights</h2><ul><li>The basilica and its carved tympanum</li><li>The panorama over the Cure valley and the Morvan</li><li>The lanes lined with winegrowers’ houses</li><li>The Vézelay AOC vineyard</li></ul>',
      nl: '<p>Hoog op zijn heuvel aan de rand van het Morvan is Vézelay een van de mooiste dorpen van Frankrijk. De <strong>basiliek Sainte-Marie-Madeleine</strong>, een juweel van Romaanse kunst, is UNESCO-werelderfgoed en historisch vertrekpunt van de routes naar Compostela.</p><h2>Bezienswaardig</h2><ul><li>De basiliek met haar gebeeldhouwde timpaan</li><li>Het panorama over het Cure-dal en het Morvan</li><li>De straatjes met wijnboerderijen</li><li>De AOC-wijngaard van Vézelay</li></ul>',
    },
    practical: {
      fr: 'Situé dans l’Yonne mais indissociable du Morvan tout proche. À voir en couple avec une balade dans le Parc.',
      en: 'Located in the Yonne but inseparable from the nearby Morvan. Best combined with a walk in the Park.',
      nl: 'Ligt in de Yonne maar hoort onlosmakelijk bij het nabije Morvan. Mooi te combineren met een wandeling in het Park.',
    },
  },
  {
    slug: 'bibracte', category: 'patrimonium', emoji: '🗿',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/F08.Bibracte._Murus_Gallicus.0001.jpg/1280px-F08.Bibracte._Murus_Gallicus.0001.jpg',
    coords: { lat: 46.9236, lng: 4.0350 },
    name: { fr: 'Bibracte — Mont Beuvray', en: 'Bibracte — Mont Beuvray', nl: 'Bibracte — Mont Beuvray' },
    short: {
      fr: 'Ancienne capitale gauloise des Éduens au sommet du Mont Beuvray, avec son musée archéologique.',
      en: 'The ancient Gaulish capital of the Aedui atop Mont Beuvray, with its archaeology museum.',
      nl: 'Oude Gallische hoofdstad van de Haedui op de Mont Beuvray, met archeologisch museum.',
    },
    long: {
      fr: '<p>Au sommet du <strong>Mont Beuvray</strong> (821 m) se dressait Bibracte, capitale du peuple gaulois des Éduens et lieu où Vercingétorix fut proclamé chef de la coalition gauloise. Le site, classé Grand Site de France, mêle archéologie et forêt mystérieuse.</p><h2>À voir</h2><ul><li>Le musée de Bibracte et ses collections celtiques</li><li>Les vestiges de l’oppidum et le rempart gaulois (murus gallicus)</li><li>Les hêtres tortueux de la « Chaume »</li><li>Les points de vue sur le Morvan et le Massif Central</li></ul>',
      en: '<p>Atop <strong>Mont Beuvray</strong> (821 m) once stood Bibracte, capital of the Gaulish Aedui and the place where Vercingetorix was proclaimed leader of the Gaulish coalition. The site, a Grand Site de France, blends archaeology and mysterious forest.</p><h2>Highlights</h2><ul><li>The Bibracte museum and its Celtic collections</li><li>The remains of the oppidum and the Gaulish rampart (murus gallicus)</li><li>The twisted beeches of the “Chaume”</li><li>Viewpoints over the Morvan and the Massif Central</li></ul>',
      nl: '<p>Op de top van de <strong>Mont Beuvray</strong> (821 m) stond ooit Bibracte, hoofdstad van de Gallische Haedui en de plek waar Vercingetorix tot leider van de Gallische coalitie werd uitgeroepen. De site, een Grand Site de France, verenigt archeologie en mysterieus bos.</p><h2>Bezienswaardig</h2><ul><li>Het museum van Bibracte met Keltische collecties</li><li>De resten van het oppidum en de Gallische wal (murus gallicus)</li><li>De kromme beuken van de “Chaume”</li><li>Uitzichtpunten over het Morvan en het Centraal Massief</li></ul>',
    },
  },
  {
    slug: 'lac-des-settons', category: 'natuur', emoji: '🏞️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lac_des_Settons_Barrage.png/1280px-Lac_des_Settons_Barrage.png',
    coords: { lat: 47.1889, lng: 4.0561 },
    name: { fr: 'Lac des Settons', en: 'Lac des Settons', nl: 'Lac des Settons' },
    short: {
      fr: 'Grand lac de 360 ha au cœur du Morvan : baignade, voile, kayak et tour du lac à pied ou à vélo.',
      en: 'A 360-hectare lake in the heart of the Morvan: swimming, sailing, kayaking and a lakeside loop.',
      nl: 'Groot meer van 360 ha in het hart van het Morvan: zwemmen, zeilen, kajakken en een rondje om.',
    },
    long: {
      fr: '<p>Créé en 1858 pour réguler le flottage du bois, le <strong>lac des Settons</strong> est aujourd’hui l’un des sites naturels les plus prisés du Morvan. Ses 360 hectares se prêtent à toutes les activités nautiques et de plein air.</p><h2>Activités</h2><ul><li>Baignade surveillée en été et plages aménagées</li><li>Voile, pédalo, kayak et croisières en bateau</li><li>Le tour du lac (≈ 13 km) à pied ou à vélo</li><li>Pêche et sentiers d’interprétation</li></ul>',
      en: '<p>Created in 1858 to regulate log floating, <strong>Lac des Settons</strong> is now one of the Morvan’s most popular natural sites. Its 360 hectares are perfect for every water and open-air activity.</p><h2>Activities</h2><ul><li>Supervised swimming in summer and equipped beaches</li><li>Sailing, pedalos, kayaking and boat cruises</li><li>The lakeside loop (≈ 13 km) on foot or by bike</li><li>Fishing and nature trails</li></ul>',
      nl: '<p>Aangelegd in 1858 om het houtvlotten te reguleren, is het <strong>Lac des Settons</strong> nu een van de populairste natuurgebieden van het Morvan. De 360 hectare lenen zich voor alle water- en buitenactiviteiten.</p><h2>Activiteiten</h2><ul><li>Bewaakt zwemmen in de zomer en ingerichte stranden</li><li>Zeilen, waterfietsen, kajakken en boottochten</li><li>Het rondje om het meer (≈ 13 km) te voet of op de fiets</li><li>Vissen en natuurleerpaden</li></ul>',
    },
  },
  {
    slug: 'parc-morvan', category: 'natuur', emoji: '🌲',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Sunrise_Over_Savault_Village_in_Morvan_2020-07.jpg/1280px-Sunrise_Over_Savault_Village_in_Morvan_2020-07.jpg',
    coords: { lat: 47.2711, lng: 4.0925 },
    name: { fr: 'Parc naturel régional du Morvan', en: 'Morvan Regional Natural Park', nl: 'Regionaal Natuurpark Morvan' },
    short: {
      fr: 'Massif de forêts, lacs et rivières classé Grand Site : le poumon vert de la Bourgogne.',
      en: 'A massif of forests, lakes and rivers — a Grand Site and Burgundy’s green lung.',
      nl: 'Massief van bossen, meren en rivieren — Grand Site en de groene long van Bourgondië.',
    },
    long: {
      fr: '<p>Créé en 1970, le <strong>Parc naturel régional du Morvan</strong> couvre près de 300 000 hectares de forêts de hêtres et de chênes, de lacs glaciaires, de rivières et de tourbières. C’est un territoire de moyenne montagne à la nature préservée.</p><h2>À découvrir</h2><ul><li>La Maison du Parc à Saint-Brisson et son arboretum</li><li>Plus de 600 km de véloroutes et de nombreux sentiers de randonnée</li><li>Les cascades, tourbières et forêts anciennes</li><li>Le patrimoine des villages et des fermes morvandelles</li></ul>',
      en: '<p>Created in 1970, the <strong>Morvan Regional Natural Park</strong> covers nearly 300,000 hectares of beech and oak forests, glacial lakes, rivers and peat bogs. It is a low-mountain area of unspoilt nature.</p><h2>To discover</h2><ul><li>The Park House at Saint-Brisson and its arboretum</li><li>Over 600 km of cycling routes and many hiking trails</li><li>Waterfalls, peat bogs and ancient forests</li><li>The heritage of the Morvan villages and farms</li></ul>',
      nl: '<p>Opgericht in 1970 beslaat het <strong>Regionaal Natuurpark Morvan</strong> bijna 300.000 hectare beuken- en eikenbossen, glaciale meren, rivieren en veengebieden. Het is een middelgebergte met ongerepte natuur.</p><h2>Te ontdekken</h2><ul><li>Het Parkhuis in Saint-Brisson met arboretum</li><li>Meer dan 600 km fietsroutes en talrijke wandelpaden</li><li>Watervallen, veengebieden en oude bossen</li><li>Het erfgoed van de Morvan-dorpen en -boerderijen</li></ul>',
    },
  },
  {
    slug: 'canal-nivernais', category: 'natuur', emoji: '🌊',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Canal_du_Nivernais_DSC_0726.JPG/1280px-Canal_du_Nivernais_DSC_0726.JPG',
    coords: { lat: 47.0578, lng: 3.6558 },
    name: { fr: 'Canal du Nivernais', en: 'Canal du Nivernais', nl: 'Canal du Nivernais' },
    short: {
      fr: '174 km parmi les plus beaux canaux de France, entre écluses, villages et vallée de l’Yonne.',
      en: '174 km among France’s finest canals, between locks, villages and the Yonne valley.',
      nl: '174 km van de mooiste kanalen van Frankrijk, langs sluizen, dorpen en het Yonne-dal.',
    },
    long: {
      fr: '<p>Reliant la Loire à la Seine, le <strong>canal du Nivernais</strong> serpente sur 174 km à travers des paysages bucoliques. Il est considéré comme l’un des plus beaux canaux de France, prisé des plaisanciers comme des cyclistes.</p><h2>À vivre</h2><ul><li>Une croisière fluviale au fil des 110 écluses</li><li>La véloroute qui longe le canal (chemin de halage)</li><li>Les fameuses « volées de Sardy », escalier d’écluses</li><li>Les villages de caractère et les bords de l’Yonne</li></ul>',
      en: '<p>Linking the Loire to the Seine, the <strong>Canal du Nivernais</strong> winds 174 km through pastoral landscapes. It is considered one of France’s most beautiful canals, loved by boaters and cyclists alike.</p><h2>Experience</h2><ul><li>A river cruise along its 110 locks</li><li>The cycle path following the towpath</li><li>The famous “Sardy flight” of staircase locks</li><li>Characterful villages and the banks of the Yonne</li></ul>',
      nl: '<p>Het <strong>Canal du Nivernais</strong> verbindt de Loire met de Seine en kronkelt 174 km door landelijke landschappen. Het geldt als een van de mooiste kanalen van Frankrijk, geliefd bij pleziervaart én fietsers.</p><h2>Te beleven</h2><ul><li>Een riviercruise langs de 110 sluizen</li><li>De fietsroute langs het jaagpad</li><li>De beroemde sluizentrap “volées de Sardy”</li><li>Karaktervolle dorpen en de oevers van de Yonne</li></ul>',
    },
  },
  {
    slug: 'saut-de-gouloux', category: 'natuur', emoji: '💦',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Saut_du_Gouloux_%2833706270025%29.jpg/1280px-Saut_du_Gouloux_%2833706270025%29.jpg',
    coords: { lat: 47.2331, lng: 4.0186 },
    name: { fr: 'Saut de Gouloux', en: 'Saut de Gouloux', nl: 'Saut de Gouloux' },
    short: {
      fr: 'La plus belle cascade du Morvan, nichée dans une forêt fraîche près du lac des Settons.',
      en: 'The Morvan’s finest waterfall, tucked into a cool forest near Lac des Settons.',
      nl: 'De mooiste waterval van het Morvan, in een koel bos vlakbij het Lac des Settons.',
    },
    long: {
      fr: '<p>Le <strong>Saut de Gouloux</strong> est la plus célèbre cascade du Morvan. La rivière du Caillot y plonge dans un chaos de rochers, au cœur d’une forêt de feuillus particulièrement fraîche en été.</p><h2>Bon à savoir</h2><ul><li>Accès par un sentier ombragé depuis le parking (≈ 10 min à pied)</li><li>Site idéal pour une pause pique-nique</li><li>À combiner avec la visite du lac des Settons tout proche</li><li>Chaussures de marche recommandées (sentier parfois glissant)</li></ul>',
      en: '<p>The <strong>Saut de Gouloux</strong> is the Morvan’s most famous waterfall. The Caillot river tumbles here through a chaos of rocks, in the heart of a broadleaf forest that stays cool in summer.</p><h2>Good to know</h2><ul><li>Reached by a shaded path from the car park (≈ 10 min walk)</li><li>A perfect spot for a picnic break</li><li>Combine it with a visit to nearby Lac des Settons</li><li>Walking shoes recommended (the path can be slippery)</li></ul>',
      nl: '<p>De <strong>Saut de Gouloux</strong> is de bekendste waterval van het Morvan. De rivier de Caillot stort hier naar beneden tussen een chaos van rotsen, midden in een loofbos dat in de zomer heerlijk koel blijft.</p><h2>Handig om te weten</h2><ul><li>Bereikbaar via een schaduwrijk pad vanaf de parking (≈ 10 min lopen)</li><li>Ideale plek voor een picknickpauze</li><li>Te combineren met het nabije Lac des Settons</li><li>Wandelschoenen aangeraden (het pad kan glad zijn)</li></ul>',
    },
  },
  {
    slug: 'pouilly-sur-loire', category: 'gastronomie', emoji: '🍇',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Vineyard_in_Burgundy%2C_France.jpg/1280px-Vineyard_in_Burgundy%2C_France.jpg',
    coords: { lat: 47.2833, lng: 2.9556 },
    name: { fr: 'Pouilly-sur-Loire', en: 'Pouilly-sur-Loire', nl: 'Pouilly-sur-Loire' },
    short: {
      fr: 'Capitale du Pouilly-Fumé, grand vin blanc de la Loire à déguster au bord du fleuve.',
      en: 'Home of Pouilly-Fumé, a great Loire white wine to taste by the river.',
      nl: 'Bakermat van de Pouilly-Fumé, een grote witte Loirewijn om aan de rivier te proeven.',
    },
    long: {
      fr: '<p>Sur la rive droite de la Loire, Pouilly-sur-Loire donne son nom à deux appellations : le célèbre <strong>Pouilly-Fumé</strong> (cépage sauvignon) et le plus rare Pouilly-sur-Loire (cépage chasselas). Un rendez-vous incontournable des amateurs de vin.</p><h2>À faire</h2><ul><li>Déguster chez les vignerons et dans les caves du village</li><li>Longer le vignoble à vélo sur La Loire à Vélo</li><li>Observer la Loire sauvage et sa réserve naturelle</li><li>Visiter le proche vignoble de Sancerre, sur l’autre rive</li></ul>',
      en: '<p>On the right bank of the Loire, Pouilly-sur-Loire gives its name to two appellations: the famous <strong>Pouilly-Fumé</strong> (Sauvignon) and the rarer Pouilly-sur-Loire (Chasselas). A must for wine lovers.</p><h2>Things to do</h2><ul><li>Taste with winegrowers and in the village cellars</li><li>Cycle along the vineyard on La Loire à Vélo</li><li>Watch the wild Loire and its nature reserve</li><li>Visit the nearby Sancerre vineyard across the river</li></ul>',
      nl: '<p>Op de rechteroever van de Loire geeft Pouilly-sur-Loire zijn naam aan twee appellaties: de beroemde <strong>Pouilly-Fumé</strong> (sauvignon) en de zeldzamere Pouilly-sur-Loire (chasselas). Een must voor wijnliefhebbers.</p><h2>Te doen</h2><ul><li>Proeven bij de wijnboeren en in de dorpskelders</li><li>Langs de wijngaard fietsen op La Loire à Vélo</li><li>De wilde Loire en zijn natuurreservaat bekijken</li><li>De nabije wijngaard van Sancerre op de andere oever bezoeken</li></ul>',
    },
  },
  {
    slug: 'saint-honore-les-bains', category: 'natuur', emoji: '♨️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/For%C3%AAt_domaniale_de_Desvres_Sentier_GR.jpg/1280px-For%C3%AAt_domaniale_de_Desvres_Sentier_GR.jpg',
    coords: { lat: 46.9067, lng: 3.8330 },
    name: { fr: 'Saint-Honoré-les-Bains', en: 'Saint-Honoré-les-Bains', nl: 'Saint-Honoré-les-Bains' },
    short: {
      fr: 'Charmante station thermale de la Belle Époque, entourée de forêts au sud du Morvan.',
      en: 'A charming Belle Époque spa town surrounded by forests in the southern Morvan.',
      nl: 'Charmant Belle Époque-kuuroord omringd door bossen in het zuiden van het Morvan.',
    },
    long: {
      fr: '<p>Station thermale déjà connue des Romains, <strong>Saint-Honoré-les-Bains</strong> a conservé le charme des villes d’eaux de la Belle Époque : parc thermal, villas fleuries et casino. Une base paisible aux portes du Morvan.</p><h2>À apprécier</h2><ul><li>Les thermes et le parc arboré</li><li>Les villas et l’architecture thermale du XIXe siècle</li><li>Les randonnées dans les forêts environnantes</li><li>Le mont Genièvre et ses points de vue</li></ul>',
      en: '<p>A spa town already known to the Romans, <strong>Saint-Honoré-les-Bains</strong> has kept the charm of Belle Époque water towns: thermal park, flower-filled villas and a casino. A peaceful base at the edge of the Morvan.</p><h2>To enjoy</h2><ul><li>The thermal baths and the wooded park</li><li>The 19th-century villas and spa architecture</li><li>Hikes in the surrounding forests</li><li>Mont Genièvre and its viewpoints</li></ul>',
      nl: '<p>Het kuuroord <strong>Saint-Honoré-les-Bains</strong>, al bekend bij de Romeinen, bewaarde de charme van Belle Époque-badplaatsen: kuurpark, bloemrijke villa’s en een casino. Een rustige uitvalsbasis aan de rand van het Morvan.</p><h2>Te genieten</h2><ul><li>De thermen en het bosrijke park</li><li>De 19e-eeuwse villa’s en kuurarchitectuur</li><li>Wandelingen in de omliggende bossen</li><li>De Mont Genièvre met uitzichtpunten</li></ul>',
    },
  },
];

export function getPlace(slug) {
  return PLACES.find(p => p.slug === slug) || null;
}
