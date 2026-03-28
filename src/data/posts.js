/**
 * Statische blogartikelen — handgeschreven, originele redactionele content.
 * Voeg nieuwe artikelen toe aan het begin van de array (nieuwste eerst).
 */

export const POSTS = [
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'guide-week-end-paques-morvan',
    date: '2026-03-27',
    category: { fr: 'Guide', en: 'Guide', nl: 'Gids' },
    readTime: 7,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Lac_des_settons.jpg/1280px-Lac_des_settons.jpg',
    title: {
      fr: 'Pâques en Morvan : notre guide pour un week-end parfait',
      en: 'Easter in the Morvan: our guide to a perfect long weekend',
      nl: 'Pasen in de Morvan: onze gids voor een perfect lang weekend',
    },
    excerpt: {
      fr: 'Quatre jours de nature, de gastronomie et de découverte dans la Nièvre. Voici notre programme idéal pour un week-end de Pâques inoubliable au cœur du Morvan.',
      en: 'Four days of nature, gastronomy and discovery in the Nièvre. Here is our ideal programme for an unforgettable Easter weekend in the heart of the Morvan.',
      nl: 'Vier dagen natuur, gastronomie en ontdekking in de Nièvre. Ons ideale programma voor een onvergetelijk Paasweekend in het hart van de Morvan.',
    },
    content: {
      fr: `<p>Le week-end de Pâques marque chaque année le véritable réveil du Morvan. Les forêts reprennent leurs couleurs, les lacs retrouvent leurs adeptes et la campagne bourguignonne s'éveille sous un soleil de plus en plus généreux. C'est le moment idéal pour découvrir l'une des plus belles régions naturelles de France, encore préservée du tourisme de masse.</p>

<h2>Vendredi : arrivée et première balade</h2>
<p>Prenez la route tôt pour éviter les embouteillages. Si vous venez de Paris, comptez environ deux heures par l'A77 jusqu'à Nevers, puis la RN81 vers Château-Chinon. Installez-vous dans votre gîte ou chambre d'hôtes et commencez la découverte par une balade légère autour du <strong>lac des Settons</strong>. Ce grand réservoir artificiel, niché entre les pins et les chênes, offre un tour pédestre de près de 15 kilomètres balisé et facile. Au coucher du soleil, les reflets dorés sur l'eau en font un spectacle inoubliable.</p>
<p>Pour le dîner, optez pour l'une des auberges qui longent le lac. La spécialité incontournable : l'<em>andouillette grillée</em> accompagnée de pommes de terre du pays, arrosée d'un verre de Bourgogne Côtes d'Auxerre.</p>

<h2>Samedi : cœur du Morvan et Château-Chinon</h2>
<p>Le matin, empruntez le sentier du <strong>Saut de Gouloux</strong>, une belle cascade cachée dans la forêt de Montargon. La randonnée de 8,8 km est accessible à toute la famille et traverse des paysages de fougères et de mousses encore humides du printemps. La chute d'eau, en plein débit à cette saison, est particulièrement impressionnante.</p>
<p>L'après-midi, montez à <strong>Château-Chinon</strong>, capitale du Morvan et ville de François Mitterrand. Le musée du Septennat abrite une collection unique de cadeaux reçus par le président pendant ses mandats — un musée insolite et passionnant. La ville offre également un panorama exceptionnel sur les collines du Morvan depuis sa terrasse.</p>
<p>Le soir, si vous voyagez en famille, préparez la <strong>chasse aux œufs du lendemain</strong> dans le jardin de votre hébergement. Beaucoup de gîtes proposent cette activité traditionnelle pour les enfants à Pâques.</p>

<h2>Dimanche de Pâques : traditions et nature</h2>
<p>La matinée est consacrée aux traditions : chocolats de Pâques, œufs cachés dans le jardin pour les plus petits, et pour les adultes, le plaisir d'un brunch tardif avec les produits locaux. Miel du Morvan, confiture de myrtilles, fromages de chèvre locaux et pain au levain font une table du dimanche matin parfaite.</p>
<p>L'après-midi, offrez-vous la randonnée des <strong>Gorges de la Canche</strong>, l'un des plus beaux itinéraires du Morvan avec ses 16,6 km de chemins longeant la rivière. Les parois rocheuses, couvertes de lichens et de fougères, créent une atmosphère presque mystique au printemps, quand la végétation commence tout juste à reverdir.</p>

<h2>Lundi de Pâques : marché et retour</h2>
<p>Le lundi de Pâques est jour de marché dans plusieurs villages du Morvan. Ne manquez pas le marché de <strong>Corbigny</strong> ou de <strong>Lormes</strong> pour ramener quelques produits du terroir : saucisson sec au chablis, miel de tilleul, poteries locales. Profitez des dernières heures pour une pause au bord de la <strong>Loire à Nevers</strong> avant de reprendre la route. La cathédrale Saint-Cyr-et-Sainte-Julitte et le palais ducal méritent un arrêt de quelques heures.</p>

<h2>Infos pratiques</h2>
<ul>
  <li><strong>Hébergement :</strong> nombreux gîtes et chambres d'hôtes disponibles sur Gîtes de France 58. Réservez au moins 4 à 6 semaines à l'avance pour Pâques.</li>
  <li><strong>Météo :</strong> mi-avril en Morvan peut être frais (5–14°C) — prévoyez des vêtements chauds pour les randonnées matinales.</li>
  <li><strong>Enfants :</strong> le lac des Settons dispose d'une plage et d'un espace de jeux accessible dès le printemps.</li>
  <li><strong>Animaux :</strong> de nombreux gîtes acceptent les chiens. Laisse obligatoire dans le parc naturel régional.</li>
</ul>`,

      en: `<p>The Easter long weekend marks the true awakening of the Morvan each year. The forests come back to life, the lakes welcome their visitors again, and the Burgundy countryside stirs beneath an increasingly generous sun. It's the perfect time to discover one of France's most beautiful natural regions, still blissfully free from mass tourism.</p>

<h2>Friday: arrival and first walk</h2>
<p>Set off early to avoid traffic. From Paris, allow around two hours via the A77 motorway to Nevers, then the RN81 towards Château-Chinon. Settle into your gîte or bed and breakfast and begin your discovery with a gentle walk around <strong>Lac des Settons</strong>. This large reservoir, nestled among pines and oaks, offers a waymarked 15-kilometre circuit that's easy for all. At sunset, the golden reflections on the water create an unforgettable spectacle.</p>

<h2>Saturday: Morvan heartland and Château-Chinon</h2>
<p>In the morning, take the <strong>Saut de Gouloux</strong> trail — a beautiful hidden waterfall in the Montargon forest. This 8.8 km hike is accessible to the whole family and winds through spring ferns and mossy rocks. In the afternoon, drive up to <strong>Château-Chinon</strong>, capital of the Morvan and former stronghold of François Mitterrand. The Septennat museum holds a unique collection of gifts received by the president during his terms of office.</p>

<h2>Easter Sunday: traditions and nature</h2>
<p>The morning is for Easter traditions — chocolate eggs, an egg hunt in the garden for the little ones, and for adults, the pleasure of a lazy brunch with local produce: Morvan honey, blueberry jam, goat's cheese and sourdough bread. In the afternoon, tackle the <strong>Gorges de la Canche</strong>, one of the Morvan's finest walks at 16.6 km, following the river through dramatic rocky gorges just beginning to green up for spring.</p>

<h2>Easter Monday: market and return</h2>
<p>Easter Monday is market day in several Morvan villages. Don't miss the markets in <strong>Corbigny</strong> or <strong>Lormes</strong> to take home some local produce: dry sausage with Chablis, lime blossom honey, local pottery. Before heading home, allow time for a stop in <strong>Nevers</strong> by the Loire — the cathedral and ducal palace are well worth a couple of hours.</p>

<h2>Practical information</h2>
<ul>
  <li><strong>Accommodation:</strong> many gîtes and B&Bs available on Gîtes de France 58. Book 4–6 weeks ahead for Easter.</li>
  <li><strong>Weather:</strong> mid-April in the Morvan can be cool (5–14°C) — bring warm layers for morning walks.</li>
  <li><strong>Children:</strong> Lac des Settons has a beach and play area open from spring.</li>
</ul>`,

      nl: `<p>Het Paasweekend markeert elk jaar het echte ontwaken van de Morvan. De bossen komen tot leven, de meren verwelkomen hun eerste bezoekers en het Bourgondische platteland erwacht onder een steeds vrijgevigere zon. Dit is het ideale moment om een van de mooiste natuurgebieden van Frankrijk te ontdekken, nog vrij van massatoerisme.</p>

<h2>Vrijdag: aankomst en eerste wandeling</h2>
<p>Vertrek vroeg om files te vermijden. Vanuit Nederland rij je via België naar Nevers en dan de RN81 richting Château-Chinon. Check in bij je gîte of chambre d'hôtes en begin je ontdekking met een rustige wandeling rond het <strong>Lac des Settons</strong>. Dit grote stuwmeer, omgeven door dennen en eiken, biedt een bewegwijzerd parcours van 15 kilometer. Bij zonsondergang zijn de gouden weerspiegelingen op het water onvergetelijk.</p>

<h2>Zaterdag: hart van de Morvan en Château-Chinon</h2>
<p>'s Ochtends neem je het pad naar de <strong>Saut de Gouloux</strong> — een prachtige verborgen waterval in het bos. 's Middags rij je naar <strong>Château-Chinon</strong>, de hoofdstad van de Morvan en stad van François Mitterrand. Het Septennaatmuseum herbergt een unieke collectie geschenken die de president ontving tijdens zijn ambtstermijnen — verrassend boeiend.</p>

<h2>Eerste Paasdag: tradities en natuur</h2>
<p>De ochtend staat in het teken van Paastradities — chocolade-eieren, een eierjacht in de tuin voor de kinderen en voor volwassenen een uitgebreid ontbijt met lokale producten: honing uit de Morvan, bosbessenjam, geitenkaas en zuurdesembrood. 's Middags ga je de <strong>Gorges de la Canche</strong> in, een van de mooiste wandelroutes van de Morvan over 16,6 km langs de rivier.</p>

<h2>Tweede Paasdag: markt en vertrek</h2>
<p>Tweede Paasdag is marktdag in verschillende dorpen. Mis niet de markt in <strong>Corbigny</strong> of <strong>Lormes</strong> voor lokale producten: droge worst met Chablis, lindebloesemhoning, aardewerk. Stop voor het vertrek in <strong>Nevers</strong> bij de Loire voor de kathedraal en het hertogelijk paleis.</p>

<h2>Praktische informatie</h2>
<ul>
  <li><strong>Overnachting:</strong> veel gîtes en B&Bs via Gîtes de France 58. Boek 4–6 weken van tevoren voor Pasen.</li>
  <li><strong>Weer:</strong> half april in de Morvan kan fris zijn (5–14°C) — neem warme kleding mee voor ochtendwandelingen.</li>
  <li><strong>Kinderen:</strong> Lac des Settons heeft een strand en speeltuin die vanaf de lente open zijn.</li>
</ul>`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'balades-paques-morvan',
    date: '2026-03-26',
    category: { fr: 'Randonnée', en: 'Hiking', nl: 'Wandelen' },
    readTime: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Saut_de_Gouloux.jpg/1280px-Saut_de_Gouloux.jpg',
    title: {
      fr: '5 randonnées incontournables pour Pâques en Morvan',
      en: '5 must-do hikes for Easter in the Morvan',
      nl: '5 onmisbare wandelingen voor Pasen in de Morvan',
    },
    excerpt: {
      fr: 'Le printemps transforme le Morvan en paradis pour les randonneurs. Cascades gonflées, forêts en éclosion, lacs aux eaux vives : voici cinq itinéraires parfaits pour le week-end de Pâques.',
      en: 'Spring transforms the Morvan into a hiker\'s paradise. Swollen waterfalls, budding forests, sparkling lakes: here are five perfect routes for the Easter weekend.',
      nl: 'De lente transformeert de Morvan in een wandelaarsparadijs. Gezwollen watervallen, uitbottende bossen, glinsterende meren: vijf perfecte routes voor het Paasweekend.',
    },
    content: {
      fr: `<p>Pâques tombe cette année aux premiers jours d'avril, juste au moment où la nature du Morvan reprend vie. C'est la saison idéale pour randonner : les sentiers ne sont pas encore bondés, les cascades sont à leur débit maximum grâce aux pluies de mars, et les forêts s'ornent de leurs premiers bourgeons. Voici cinq randonnées à ne pas manquer ce week-end.</p>

<h2>1. Le Tour du Lac des Settons (15 km — Facile)</h2>
<p>C'est sans doute la randonnée emblématique du Morvan. Le tour complet du lac des Settons vous emmène à travers forêts de pins, zones humides et rives rocailleuses sur environ 15 kilomètres. Le parcours est balisé et peu dénivelé, accessible aux familles avec des enfants à partir de 7–8 ans. La vue sur le barrage et les collines environnantes en début de balade est particulièrement belle au printemps.</p>
<p><em>Départ : parking du barrage des Settons, Montsauche-les-Settons. Durée estimée : 4h.</em></p>

<h2>2. Le Saut de Gouloux (8,8 km — Facile)</h2>
<p>Cette randonnée dans la forêt de Montargon mène à l'une des plus belles cascades du Morvan. En avril, le Gouloux est en plein débit et la chute d'eau plonge avec force sur les rochers couverts de mousse. Le sentier traverse des zones de fougères encore humides, des sous-bois de charmes et de hêtres, et longe le Ternin sur plusieurs kilomètres.</p>
<p><em>Départ : village de Gouloux. Durée estimée : 2h30.</em></p>

<h2>3. Le Tour du Lac de Saint-Agnan (8,4 km — Facile)</h2>
<p>Moins connu que les Settons, le lac de Saint-Agnan est un véritable bijou sauvage. Son tour pédestre de 8,4 km est idéal pour une demi-journée en famille. La végétation aquatique au bord de l'eau abrite de nombreux oiseaux migrateurs de passage au printemps : hérons cendrés, martins-pêcheurs, grèbes. Prenez vos jumelles.</p>
<p><em>Départ : parking du plan d'eau de Saint-Agnan. Durée estimée : 2h30.</em></p>

<h2>4. Les Gorges de la Canche (16,6 km — Modéré)</h2>
<p>Pour les marcheurs aguerris, les gorges de la Canche offrent l'un des paysages les plus spectaculaires du Morvan. La rivière creuse des parois rocheuses couvertes de lichen et de fougères géantes, créant un couloir naturel presque tropical au printemps. La randonnée de 16,6 km nécessite une bonne condition physique mais se récompense de panoramas exceptionnels.</p>
<p><em>Départ : Saint-Brisson. Durée estimée : 5h. Dénivelé positif : ~450m.</em></p>

<h2>5. L'Oppidum du Vieux Dun (10 km — Facile à Modéré)</h2>
<p>Cette randonnée combine nature et histoire. Elle mène à l'oppidum gaulois du Vieux Dun, une ancienne fortification perchée sur un promontoire avec une vue à 360° sur le Morvan et la plaine nivernaise. Au printemps, les prairies autour du site sont couvertes de jonquilles et d'anémones des bois. Le retour passe par l'étang de la Creuse, idéal pour une pause pique-nique.</p>
<p><em>Départ : Dun-les-Places. Durée estimée : 3h. Dénivelé positif : ~220m.</em></p>

<h2>Conseils pour randonner à Pâques en Morvan</h2>
<ul>
  <li><strong>Météo :</strong> prévoyez des vêtements imperméables. Avril peut être capricieux en altitude.</li>
  <li><strong>Chaussures :</strong> les sentiers sont souvent boueux en début de saison. Chaussures de randonnée montantes recommandées.</li>
  <li><strong>Tiques :</strong> la saison des tiques démarre dès mars–avril. Utilisez un répulsif et vérifiez bien après chaque balade.</li>
  <li><strong>Cartes :</strong> l'application Visorando ou les cartes IGN 1/25 000 sont indispensables pour les randonnées longues.</li>
</ul>`,

      en: `<p>Easter this year falls in the very first days of April, just as the Morvan's nature springs back to life. It's the ideal season for hiking: the trails aren't yet crowded, the waterfalls are at their fullest after March rains, and the forests are putting on their first buds. Here are five walks not to miss this long weekend.</p>

<h2>1. Tour du Lac des Settons (15 km — Easy)</h2>
<p>This is the emblematic walk of the Morvan. The full circuit of Lac des Settons takes you through pine forests, wetlands and rocky shores over approximately 15 kilometres. The route is waymarked with little elevation gain, accessible to families with children aged 7–8 and over.</p>
<p><em>Start: Settons dam car park, Montsauche-les-Settons. Estimated time: 4h.</em></p>

<h2>2. Saut de Gouloux (8.8 km — Easy)</h2>
<p>This forest walk leads to one of the Morvan's most beautiful waterfalls. In April, the Gouloux stream is in full flow and the waterfall plunges dramatically over moss-covered rocks. The path winds through fern groves and beech woods.</p>
<p><em>Start: village of Gouloux. Estimated time: 2h30.</em></p>

<h2>3. Tour du Lac de Saint-Agnan (8.4 km — Easy)</h2>
<p>Less well-known than Settons, Lac de Saint-Agnan is a genuine wild gem. Its 8.4 km circuit is ideal for a family half-day. The waterside vegetation shelters many migrating spring birds: grey herons, kingfishers, grebes. Bring binoculars.</p>

<h2>4. Les Gorges de la Canche (16.6 km — Moderate)</h2>
<p>For experienced walkers, the Canche gorges offer the most spectacular scenery in the Morvan. The river cuts through lichen-covered rocky walls, creating a natural corridor almost tropical in spring. The 16.6 km route requires reasonable fitness but rewards with exceptional panoramas.</p>

<h2>5. L'Oppidum du Vieux Dun (10 km — Easy to Moderate)</h2>
<p>This walk combines nature and history, leading to an ancient Gaulish hilltop fort with a 360° view over the Morvan. In spring, the surrounding meadows are carpeted with daffodils and wood anemones.</p>

<h2>Tips for Easter hiking in the Morvan</h2>
<ul>
  <li><strong>Weather:</strong> bring waterproofs. April at altitude can be changeable.</li>
  <li><strong>Footwear:</strong> trails are often muddy in early season. Walking boots recommended.</li>
  <li><strong>Ticks:</strong> tick season begins in March–April. Use repellent and check thoroughly after each walk.</li>
</ul>`,

      nl: `<p>Pasen valt dit jaar in de allereerste dagen van april, precies wanneer de natuur van de Morvan weer tot leven komt. Het is het ideale seizoen om te wandelen: de paden zijn nog niet druk, de watervallen staan op hun hoogste stand na de maartregens en de bossen tonen hun eerste knoppen. Vijf wandelingen die je dit lange weekend niet mag missen.</p>

<h2>1. Ronde van het Lac des Settons (15 km — Makkelijk)</h2>
<p>Dit is de emblematische wandeling van de Morvan. De volledige ronde van het Lac des Settons voert je door dennenbossen, moerasgebieden en rotsachtige oevers over ongeveer 15 kilometer. Het parcours is bewegwijzerd en heeft weinig hoogteverschil, geschikt voor gezinnen met kinderen vanaf 7–8 jaar.</p>
<p><em>Vertrek: parkeerplaats bij de dam van Settons, Montsauche-les-Settons. Geschatte tijd: 4u.</em></p>

<h2>2. Saut de Gouloux (8,8 km — Makkelijk)</h2>
<p>Deze boswandeling leidt naar een van de mooiste watervallen van de Morvan. In april staat de Gouloux op volle kracht. Het pad slingert door varenbossen en beukenwouden.</p>
<p><em>Vertrek: dorp Gouloux. Geschatte tijd: 2u30.</em></p>

<h2>3. Ronde van het Lac de Saint-Agnan (8,4 km — Makkelijk)</h2>
<p>Minder bekend dan de Settons maar een echte wilde parel. De 8,4 km ronde is ideaal voor een halve dag met het gezin. De waterrandbegroeiing herbergt veel trekvogels in de lente: blauwe reigers, ijsvogels, futen. Neem een verrekijker mee.</p>

<h2>4. Les Gorges de la Canche (16,6 km — Gemiddeld)</h2>
<p>Voor ervaren wandelaars bieden de gorges van de Canche het spectaculairste landschap van de Morvan. De rivier snijdt door met mos begroeide rotswanden en creëert een natuurlijk kanaal dat in de lente bijna tropisch aandoet.</p>

<h2>5. L'Oppidum du Vieux Dun (10 km — Makkelijk tot Gemiddeld)</h2>
<p>Deze wandeling combineert natuur en geschiedenis. Ze leidt naar een oud Gallisch bergfort met 360° uitzicht over de Morvan. In de lente staan de omringende weiden vol narcissen en bosanemonen.</p>

<h2>Tips voor wandelen met Pasen in de Morvan</h2>
<ul>
  <li><strong>Weer:</strong> neem regenkleding mee. April op hoogte kan wisselvallig zijn.</li>
  <li><strong>Schoenen:</strong> de paden zijn vroeg in het seizoen vaak modderig. Bergschoenen aanbevolen.</li>
  <li><strong>Teken:</strong> het tekenseizoen begint in maart–april. Gebruik afweermiddel en controleer jezelf goed na elke wandeling.</li>
</ul>`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'activites-famille-paques-nievre',
    date: '2026-03-25',
    category: { fr: 'Famille', en: 'Family', nl: 'Familie' },
    readTime: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chateau_Chinon_-_Musee_Septennat.jpg/1280px-Chateau_Chinon_-_Musee_Septennat.jpg',
    title: {
      fr: 'Activités en famille pour Pâques dans la Nièvre',
      en: 'Family activities for Easter in the Nièvre',
      nl: 'Gezinsactiviteiten met Pasen in de Nièvre',
    },
    excerpt: {
      fr: 'Chasse aux œufs, sorties nature, musées originaux et balade à cheval : la Nièvre regorge d\'idées pour un Pâques inoubliable avec les enfants.',
      en: 'Easter egg hunts, nature outings, quirky museums and horse riding: the Nièvre is full of ideas for an unforgettable Easter with children.',
      nl: 'Eierjachten, natuuruitstapjes, bijzondere musea en paardrijden: de Nièvre barst van ideeën voor een onvergetelijk Pasen met kinderen.',
    },
    content: {
      fr: `<p>La Nièvre est une destination idéale pour les familles avec enfants qui cherchent à fuir le béton le temps d'un week-end de Pâques. Entre nature préservée, fermes pédagogiques, châteaux médiévaux et activités en plein air, il y en a pour tous les âges. Voici nos meilleures idées d'activités pour un Pâques en famille dans la Nièvre.</p>

<h2>La chasse aux œufs en forêt</h2>
<p>Plusieurs hébergements du Morvan proposent des chasses aux œufs organisées dans leurs parcs ou jardins à Pâques. Mais pourquoi ne pas organiser votre propre chasse aux œufs dans la nature ? Avec un peu de préparation, les bords du <strong>lac des Settons</strong> ou les clairières de la <strong>forêt de St-Prix</strong> font des terrains de jeu magiques. Les enfants seront émerveillés de trouver leurs œufs en chocolat cachés dans les mousses, sous les champignons et au creux des vieilles souches.</p>

<h2>La ferme équestre de Lormes</h2>
<p>La Nièvre possède une belle tradition d'élevage équestre. Plusieurs centres équestres de la région proposent des randonnées à cheval ou en poney adaptées aux enfants pendant les vacances. Une sortie de deux heures à travers les chemins du Morvan à dos de cheval est une expérience que les enfants n'oublieront pas de sitôt. Réservez à l'avance car les places partent vite à Pâques.</p>

<h2>Le musée du Septennat à Château-Chinon</h2>
<p>Surprenants et accessibles aux enfants curieux, les musées de Château-Chinon constituent une belle étape culturelle. Le <strong>musée du Septennat</strong> présente les cadeaux officiels reçus par François Mitterrand : masques africains, porcelaines asiatiques, animaux empaillés exotiques… Les enfants sont souvent plus fascinés que les adultes par cette collection insolite. Le <strong>musée du Costume</strong> juste à côté retrace 400 ans de mode vestimentaire avec des costumes portables pour les petits visiteurs.</p>

<h2>La maison du Parc du Morvan à Saint-Brisson</h2>
<p>À Saint-Brisson, la <strong>Maison du Parc Naturel Régional du Morvan</strong> organise régulièrement des animations nature pendant les vacances scolaires. Ateliers de reconnaissance des plantes, initiation à l'observation des oiseaux, sentiers découverte avec livrets-jeux pour les enfants : c'est une excellente introduction à la biodiversité remarquable du Morvan. L'étang et le jardin botanique qui entourent la maison du Parc valent à eux seuls le détour.</p>

<h2>Baignade et jeux au lac des Settons</h2>
<p>Si le soleil est au rendez-vous — ce qui n'est pas garanti en avril mais toujours possible —, la plage aménagée du <strong>lac des Settons</strong> commence à rouvrir ses services à Pâques. Location de pédalos, structures de jeux sur la plage, aire de pique-nique : tout est là pour une après-midi familiale détendue au bord de l'eau. L'eau est encore fraîche en avril, mais les enfants courageux ne résisteront pas à un bain de pieds.</p>

<h2>La route des pierres et des châteaux</h2>
<p>La Nièvre compte une concentration remarquable de châteaux médiévaux et Renaissance. Pour une journée "châteaux" avec les enfants, enchaînez le <strong>château de Bazoches</strong> (résidence du maréchal Vauban), le <strong>château de Châtillon-en-Bazois</strong> (accessible en bateau par le canal du Nivernais) et terminez par les remparts de <strong>Clamecy</strong>, petite ville médiévale parfaitement préservée.</p>`,

      en: `<p>The Nièvre is an ideal destination for families with children looking to escape the city for Easter. Between unspoilt nature, educational farms, medieval châteaux and outdoor activities, there's something for every age. Here are our best ideas for a family Easter in the Nièvre.</p>

<h2>Egg hunt in the forest</h2>
<p>Many Morvan gîtes and B&Bs organise Easter egg hunts in their grounds. But why not organise your own in nature? The shores of <strong>Lac des Settons</strong> or the clearings of the <strong>Forêt de St-Prix</strong> make magical playgrounds. Children will be enchanted to find their chocolate eggs hidden in the moss, under fungi and in the hollows of old tree stumps.</p>

<h2>Horse riding in the Morvan</h2>
<p>The Nièvre has a fine tradition of horse breeding. Several local equestrian centres offer horse and pony rides suited to children during the holidays. A two-hour outing through Morvan lanes on horseback is an experience children won't soon forget. Book ahead as places go quickly at Easter.</p>

<h2>Septennat Museum, Château-Chinon</h2>
<p>The museums of Château-Chinon are surprising and accessible to curious children. The <strong>Septennat Museum</strong> displays the official gifts received by François Mitterrand: African masks, Asian porcelains, exotic taxidermy. Children are often more captivated than adults by this unusual collection. The neighbouring <strong>Costume Museum</strong> traces 400 years of fashion, with costumes children can try on.</p>

<h2>Maison du Parc at Saint-Brisson</h2>
<p>At Saint-Brisson, the <strong>Morvan Regional Natural Park Visitor Centre</strong> regularly runs nature activities during school holidays: plant identification workshops, birdwatching sessions, discovery trails with activity booklets for children. The pond and botanical garden surrounding the building are worth visiting in their own right.</p>

<h2>Swimming and play at Lac des Settons</h2>
<p>If the sun obliges — not guaranteed in April but always possible — the beach at <strong>Lac des Settons</strong> begins to reopen at Easter. Pedalo hire, beach play equipment, picnic areas: everything is in place for a relaxed family afternoon by the water. The water is still cool in April, but brave children won't resist a paddle.</p>`,

      nl: `<p>De Nièvre is een ideale bestemming voor gezinnen met kinderen die met Pasen uit de stad willen ontsnappen. Met ongerepte natuur, educatieve boerderijen, middeleeuwse kastelen en activiteiten in de buitenlucht is er voor elk leeftijd wat te doen. Onze beste ideeën voor een familiepasen in de Nièvre.</p>

<h2>Eierjacht in het bos</h2>
<p>Veel gîtes en B&Bs in de Morvan organiseren eierjachten met Pasen in hun tuin. Maar waarom niet je eigen eierjacht organiseren in de natuur? De oevers van het <strong>Lac des Settons</strong> of de open plekken in het <strong>Bos van St-Prix</strong> zijn magische speeltuinen. Kinderen zijn verrukt als ze hun chocolade-eieren vinden verstopt in het mos en in de holtes van oude boomstronken.</p>

<h2>Paardrijden in de Morvan</h2>
<p>De Nièvre heeft een mooie traditie in de paardenhouderij. Verschillende manèges bieden pony- en paardenritten aan voor kinderen tijdens de vakanties. Een uitstapje van twee uur over de landwegen van de Morvan te paard is een ervaring die kinderen niet gauw vergeten. Boek vooruit want plaatsen gaan snel weg met Pasen.</p>

<h2>Septennaatmuseum in Château-Chinon</h2>
<p>Het <strong>Septennaatmuseum</strong> toont de officiële geschenken die François Mitterrand ontving: Afrikaanse maskers, Aziatisch porselein, exotische opgezette dieren. Kinderen zijn vaak meer gefascineerd dan volwassenen door deze bijzondere verzameling. Het naastgelegen <strong>Kostuummuseum</strong> vertelt 400 jaar modegeschiedenis met kleren die kinderen mogen passen.</p>

<h2>Maison du Parc in Saint-Brisson</h2>
<p>In Saint-Brisson organiseert het <strong>Bezoekerscentrum van het Regionaal Natuurpark Morvan</strong> regelmatig natuuractiviteiten tijdens schoolvakanties: workshops plantenherkenning, vogelspottingsessies, ontdekkingspaden met activiteitsboekjes voor kinderen. De vijver en de botanische tuin rondom het centrum zijn al een bezoek waard.</p>

<h2>Zwemmen en spelen bij Lac des Settons</h2>
<p>Als de zon meewerkt — niet gegarandeerd in april maar altijd mogelijk — begint het strand bij het <strong>Lac des Settons</strong> met Pasen te heropenen. Waterfietsverhuur, speeltoestellen op het strand, picknickplaatsen: alles is aanwezig voor een ontspannen familienamiddag bij het water.</p>`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'gastronomie-paques-bourgogne',
    date: '2026-03-24',
    category: { fr: 'Gastronomie', en: 'Food & Drink', nl: 'Eten & Drinken' },
    readTime: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Burgundy_wine_grapes.jpg/1280px-Burgundy_wine_grapes.jpg',
    title: {
      fr: 'Agneau pascal, chocolats et vins : Pâques gourmand en Bourgogne',
      en: 'Easter lamb, chocolates and wines: a gourmet Easter in Burgundy',
      nl: 'Paaslam, chocolade en wijnen: een gastronomisch Pasen in Bourgondië',
    },
    excerpt: {
      fr: 'Pâques est aussi une fête gastronomique. Découvrez les saveurs incontournables d\'un séjour de Pâques en Nièvre : l\'agneau du Morvan, les chocolats des artisans locaux et les vins de Bourgogne.',
      en: 'Easter is also a gastronomic celebration. Discover the unmissable flavours of an Easter stay in the Nièvre: Morvan lamb, artisan chocolates and Burgundy wines.',
      nl: 'Pasen is ook een gastronomisch feest. Ontdek de onmisbare smaken van een Paasverblijf in de Nièvre: lam uit de Morvan, ambachtelijke chocolade en Bourgondische wijnen.',
    },
    content: {
      fr: `<p>En Bourgogne, Pâques rime avec table bien garnie. C'est la saison où les producteurs locaux sont à l'honneur : l'agneau du Charolais et du Morvan, les premiers légumes de saison, les fromages affinés qui retrouvent leur saveur printanière, et bien sûr les chocolats artisanaux qui fleurissent dans toutes les pâtisseries de la région.</p>

<h2>L'agneau pascal du Morvan</h2>
<p>Pâques sans agneau, ce n'est pas Pâques — et en Nièvre, on sait préparer la viande comme nulle part ailleurs. L'agneau du Charolais est réputé pour sa tendreté et sa saveur douce. Pour Pâques, les boucheries locales proposent des gigots et épaules prêts à rôtir, souvent accompagnés d'herbes fraîches du jardin. La recette traditionnelle nivernaise : gigot rôti aux herbes, ail nouveau du pays et pommes de terre nouvelles revenue au beurre.</p>
<p>Pour trouver votre agneau de qualité, rendez-vous directement chez les producteurs. Le <strong>marché de Corbigny</strong> ou de <strong>Clamecy</strong> rassemble chaque semaine des éleveurs locaux. À Pâques, beaucoup proposent des agneaux entiers ou des morceaux.</p>

<h2>Les chocolatiers et pâtissiers de la Nièvre</h2>
<p>Si la Nièvre n'a pas la même réputation chocolatière que Lyon ou Paris, elle abrite quelques artisans du chocolat et de la confiserie qui méritent le détour. À <strong>Nevers</strong>, plusieurs pâtisseries artisanales proposent des créations originales pour Pâques : poules en chocolat noir, œufs fourrés à la praline, tablettes au caramel beurre salé et fleur de sel de Guérande. Les <strong>nougats de Nevers</strong>, spécialité locale en voie de redécouverte, font aussi de beaux cadeaux de Pâques.</p>

<h2>Les fromages du printemps</h2>
<p>Le printemps est la meilleure saison pour les fromages de chèvre de Bourgogne. La <strong>Chaource</strong>, le <strong>Soumaintrain</strong> et les fromages de chèvre frais des fermes du Morvan retrouvent leur saveur lactée caractéristique quand les chèvres commencent à brouter l'herbe fraîche des prairies. Un plateau de fromages locaux accompagné d'un petit Chablis frais constitue une mise en bouche de Pâques parfaite.</p>

<h2>Les vins de Bourgogne pour Pâques</h2>
<p>La Nièvre est à la frontière de plusieurs appellations bourguignonnes. Pour accompagner votre repas de Pâques :</p>
<ul>
  <li><strong>Pouilly-Fumé</strong> : le blanc de Loire produit juste de l'autre côté du fleuve, parfait avec les entrées et les fromages de chèvre.</li>
  <li><strong>Chablis</strong> (AOC voisine) : minéral et frais, idéal avec les poissons ou une entrée d'asperges blanches.</li>
  <li><strong>Bourgogne Côtes d'Auxerre</strong> : un rouge léger et fruité, parfait pour l'agneau.</li>
  <li><strong>Pinot noir de Sancerre</strong> : plus rare, à découvrir chez les vignerons locaux.</li>
</ul>

<h2>Où manger pour Pâques dans la Nièvre ?</h2>
<p>De nombreux restaurants proposent des menus de Pâques spéciaux. Côté adresses : à <strong>Château-Chinon</strong>, les auberges du centre proposent des menus du terroir. À <strong>Nevers</strong>, quelques restaurants gastronomiques mettent l'agneau et les vins régionaux à l'honneur. Et si vous êtes en gîte, rien ne vaut un marché du matin et un repas préparé avec des produits du terroir directement dans votre cuisine de vacances.</p>`,

      en: `<p>In Burgundy, Easter means a well-laden table. It's the season when local producers come into their own: Charolais and Morvan lamb, the first seasonal vegetables, cheeses regaining their springtime flavour, and of course the artisan chocolates that appear in every patisserie in the region.</p>

<h2>Easter lamb from the Morvan</h2>
<p>Easter without lamb isn't Easter — and in the Nièvre, meat is prepared as nowhere else. Charolais lamb is renowned for its tenderness and mild flavour. For Easter, local butchers offer legs and shoulders ready to roast, often with fresh garden herbs. The traditional Nivernais recipe: herb-roasted leg of lamb with new-season garlic and butter-fried new potatoes.</p>
<p>To find quality lamb, go directly to producers. The markets in <strong>Corbigny</strong> or <strong>Clamecy</strong> bring together local farmers every week. At Easter, many offer whole lambs or individual cuts.</p>

<h2>Chocolate makers and pâtisseries</h2>
<p>While the Nièvre doesn't have the same chocolate reputation as Lyon or Paris, it is home to a few artisan confectioners worth visiting. In <strong>Nevers</strong>, several craft patisseries create original Easter pieces: dark chocolate hens, praline-filled eggs, salted caramel bars. The <strong>nougats of Nevers</strong>, a local speciality being rediscovered, also make fine Easter gifts.</p>

<h2>Spring cheeses</h2>
<p>Spring is the finest season for Burgundy goat's cheeses. Chaource, Soumaintrain and fresh goat's cheeses from Morvan farms regain their characteristic milky flavour when goats begin grazing on fresh spring grass. A local cheese board with a cool Chablis makes a perfect Easter aperitif.</p>

<h2>Burgundy wines for Easter</h2>
<ul>
  <li><strong>Pouilly-Fumé</strong>: the Loire white produced just across the river, perfect with starters and goat's cheese.</li>
  <li><strong>Chablis</strong>: mineral and fresh, ideal with fish or white asparagus.</li>
  <li><strong>Bourgogne Côtes d'Auxerre</strong>: a light, fruity red, perfect with lamb.</li>
  <li><strong>Sancerre Pinot Noir</strong>: rarer, worth seeking out from local wine producers.</li>
</ul>`,

      nl: `<p>In Bourgondië staat Pasen voor een goed gevulde tafel. Het is het seizoen van lokale producenten: Charolais- en Morvanlam, de eerste seizoensgroenten, kazen die hun lentekarakter terugkrijgen en natuurlijk de ambachtelijke chocolade die in elke patisserie van de regio verschijnt.</p>

<h2>Paaslam uit de Morvan</h2>
<p>Pasen zonder lam is geen Pasen — en in de Nièvre weet men vlees te bereiden als nergens anders. Charolais-lam staat bekend om zijn malsheid en milde smaak. Met Pasen bieden lokale slagers braadklare schenkels en schouders aan, vaak met verse tuinkruiden. Het traditionele recept: geroosterde lamsschenkels met verse knoflook en botergebakken nieuwe aardappeltjes.</p>

<h2>Chocolatiers en banketbakkers</h2>
<p>De Nièvre heeft niet dezelfde chocoladerepute als Lyon of Parijs, maar herbergt een paar ambachtelijke zoetwarenmakers die de moeite waard zijn. In <strong>Nevers</strong> creëren verscheidene banketbakkerijen originele Paasspecialiteiten: donkere chocoladehennen, met praliné gevulde eieren, gezouten karamelrepen. De <strong>nougats van Nevers</strong>, een lokale specialiteit die herontdekt wordt, zijn mooie Paasgeschenken.</p>

<h2>Lentekaazen</h2>
<p>De lente is het beste seizoen voor Bourgondische geitenkazen. Chaource, Soumaintrain en verse geitenkazen van Morvanboerderijen krijgen hun karakteristieke melkachtige smaak terug wanneer de geiten vers lentegras beginnen te grazen. Een lokaal kaasplateau met een frisse Chablis is een perfect Paasaperitiefje.</p>

<h2>Bourgondische wijnen voor Pasen</h2>
<ul>
  <li><strong>Pouilly-Fumé</strong>: de Loire-witte wijn net aan de overkant van de rivier, perfect bij voor- en geitenkaas.</li>
  <li><strong>Chablis</strong>: mineraal en fris, ideaal bij vis of witte asperges.</li>
  <li><strong>Bourgogne Côtes d'Auxerre</strong>: een lichte, fruitige rood, perfect bij lam.</li>
  <li><strong>Sancerre Pinot Noir</strong>: zeldzamer, het zoeken waard bij lokale wijnboeren.</li>
</ul>`,
    },
  },
];

export function getPost(slug) {
  return POSTS.find(p => p.slug === slug) || null;
}

export function getRelatedPosts(slug, count = 3) {
  return POSTS.filter(p => p.slug !== slug).slice(0, count);
}
