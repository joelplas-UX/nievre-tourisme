/**
 * Statische blogartikelen — handgeschreven, originele redactionele content.
 * Voeg nieuwe artikelen toe aan het begin van de array (nieuwste eerst).
 */

export const POSTS = [

  // ─── Hoge waterstanden Nièvre maart 2026 ─────────────────────
  {
    slug: 'crues-nievre-mars-2026',
    date: '2026-03-27',
    category: { fr: 'Actualité', en: 'News', nl: 'Nieuws' },
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=80',
    title: {
      fr: 'Crues en Nièvre : ce que vous devez savoir (mars 2026)',
      en: 'Flooding in the Nièvre: what you need to know (March 2026)',
      nl: 'Hoogwater in de Nièvre: wat u moet weten (maart 2026)',
    },
    excerpt: {
      fr: 'Après plusieurs semaines de pluies intenses et de fonte des neiges, la Loire, la Nièvre et leurs affluents sont en crue. Noah fait le point sur la situation et vous propose des alternatives pour profiter de la région malgré tout.',
      en: 'After weeks of heavy rain and snowmelt, the Loire, the Nièvre river and their tributaries are flooding. Noah takes stock of the situation and suggests alternatives to still enjoy the region.',
      nl: 'Na weken van hevige regen en smeltwater staan de Loire, de Nièvre en hun zijrivieren hoog. Noah brengt de situatie in kaart en stelt alternatieven voor om toch van de regio te genieten.',
    },
    content: {
      fr: `<p>Les semaines passées n'ont pas épargné la Nièvre. Depuis mi-mars 2026, des précipitations bien au-dessus des normales saisonnières conjuguées à une fonte tardive des neiges du Morvan ont provoqué une montée significative des eaux dans toute la région. La Loire a franchi plusieurs fois le seuil de vigilance orange à Nevers, et les affluents — la Nièvre, l'Aron, l'Yonne en amont — ont connu des niveaux record depuis plusieurs années.</p>

<h2>Quelles zones sont affectées ?</h2>
<p>Les secteurs les plus touchés sont les vals de Loire entre <strong>Nevers et Cosne-Cours-sur-Loire</strong>, ainsi que les basses vallées de l'Aron autour de <strong>Decize</strong> et de la Nièvre en aval de <strong>Guérigny</strong>. Le <strong>Canal du Nivernais</strong>, reliant Auxerre à Decize, a été temporairement fermé à la navigation entre le bief de Baye et Cercy-la-Tour en raison des niveaux d'eau trop élevés.</p>

<p>Dans le massif du <strong>Morvan</strong>, plusieurs chemins de randonnée longeant les ruisseaux de tête de bassin sont impraticables. Les accès aux plages du <strong>Lac des Settons</strong> et du <strong>Lac de Chaumeçon</strong> sont partiellement fermés, les berges basses étant immergées.</p>

<h2>Ce qui reste ouvert et accessible</h2>
<p>La bonne nouvelle, c'est que la grande majorité des sites touristiques de la région restent pleinement accessibles. Les villages perchés, les châteaux et les hauts plateaux du Morvan ne sont pas affectés par les crues :</p>
<ul>
  <li><strong>Vézelay</strong> et sa basilique restent accessibles sans difficulté.</li>
  <li>Les <strong>sentiers de crête du Morvan</strong> (Haut-Folin, signal d'Uchon, Mont Beuvray) sont praticables et offrent de magnifiques points de vue sur les vallées inondées — un spectacle impressionnant et rare.</li>
  <li>Les musées de <strong>Nevers</strong> (Faïence, Beaux-Arts) et les sites religieux sont ouverts normalement.</li>
  <li>Les <a href="/activites?cat=kastelen">châteaux et sites patrimoniaux</a> de la région n'ont pas été touchés.</li>
</ul>

<h2>Des activités adaptées à la saison</h2>
<p>Une crue, c'est aussi un spectacle naturel peu ordinaire. Quelques idées pour en profiter intelligemment :</p>
<ul>
  <li><strong>Randonnée sur les hauteurs :</strong> Les <a href="/activites?cat=wandelen">sentiers en altitude du Morvan</a> sont dégagés et la vue sur les vallées depuis les points hauts est saisissante. Le GR13, dans sa partie haute, est accessible.</li>
  <li><strong>Observation de la faune :</strong> Les crues déplacent la faune vers les hauteurs. Bécassines, hérons cendrés et parfois des balbuzards sont observables depuis les levées de Loire.</li>
  <li><strong>Visites intérieures :</strong> Profitez-en pour découvrir les <a href="/activites?cat=kastelen">sites patrimoniaux</a> couverts : cave du musée de la Faïence à Nevers, ateliers de faïenciers, distillerie artisanale de Corbigny.</li>
  <li><strong>Gastronomie :</strong> Un temps pluvieux est l'occasion parfaite pour s'attabler dans un restaurant local autour d'un bœuf bourguignon ou d'une potée nivernaise.</li>
</ul>

<h2>Quand la situation va-t-elle se normaliser ?</h2>
<p>Selon Météo-France et Vigicrues, les niveaux devraient commencer à baisser d'ici fin mars 2026, sous réserve d'une accalmie pluviométrique. La décrue est généralement plus lente que la montée : comptez 10 à 15 jours après la fin des pluies pour que les vallées retrouvent leur aspect habituel.</p>

<p>Les <a href="/evenements">événements de printemps</a> prévus dans la région — notamment les marchés de Pâques et les randonnées organisées — se maintiennent pour la plupart. Renseignez-vous auprès de l'office de tourisme de votre destination avant de partir.</p>

<h2>Restez informés</h2>
<p>Pour suivre la situation en temps réel :</p>
<ul>
  <li><strong>Vigicrues</strong> : vigicrues.gouv.fr — niveaux des cours d'eau en direct</li>
  <li><strong>Météo-France</strong> : vigilance météo département 58 (Nièvre)</li>
  <li><strong>Préfecture de la Nièvre</strong> : prefecture58.gouv.fr</li>
</ul>

<p>Bonne découverte malgré tout — le Morvan reste une destination magnifique en toute saison, et une crue de la Loire est un spectacle naturel que peu de visiteurs ont l'occasion de voir !</p>`,
      en: `<p>The past weeks have been challenging for the Nièvre. Since mid-March 2026, above-average rainfall combined with late snowmelt from the Morvan massif has caused significant flooding across the region. The Loire has repeatedly crossed the orange alert threshold at Nevers, and its tributaries — the Nièvre, the Aron, the upper Yonne — have reached levels not seen for several years.</p>

<h2>Which areas are affected?</h2>
<p>The most affected areas are the Loire valleys between <strong>Nevers and Cosne-Cours-sur-Loire</strong>, the low-lying Aron valley around <strong>Decize</strong>, and the Nièvre river downstream from <strong>Guérigny</strong>. The <strong>Canal du Nivernais</strong> has been temporarily closed to boat traffic between Baye and Cercy-la-Tour due to high water levels.</p>

<p>In the <strong>Morvan</strong> massif, several hiking trails along streams are temporarily impassable. Access to beaches at <strong>Lac des Settons</strong> and <strong>Lac de Chaumeçon</strong> is partially restricted.</p>

<h2>What remains open and accessible</h2>
<p>The good news is that the vast majority of the region's tourist sites remain fully accessible. Hilltop villages, châteaux and the higher Morvan plateaus are not affected:</p>
<ul>
  <li><strong>Vézelay</strong> and its basilica are fully accessible.</li>
  <li>The <strong>Morvan ridge trails</strong> (Haut-Folin, signal d'Uchon, Mont Beuvray) offer spectacular views over flooded valleys.</li>
  <li>Museums in <strong>Nevers</strong> are open as normal.</li>
  <li>The region's <a href="/activites?cat=kastelen">châteaux and heritage sites</a> are unaffected.</li>
</ul>

<h2>Adapted activities for the season</h2>
<ul>
  <li><strong>High-altitude hiking:</strong> <a href="/activites?cat=wandelen">Morvan ridge trails</a> are clear and offer dramatic views of the flooded valleys below.</li>
  <li><strong>Wildlife watching:</strong> Flooding pushes wildlife uphill. Grey herons, snipe and even ospreys can be spotted from the Loire embankments.</li>
  <li><strong>Indoor heritage:</strong> Visit <a href="/activites?cat=kastelen">covered heritage sites</a> — the Faïence museum in Nevers, pottery workshops, artisan distilleries.</li>
  <li><strong>Gastronomy:</strong> Rainy weather is the perfect excuse for a bœuf bourguignon at a local restaurant.</li>
</ul>

<p>Check <a href="/evenements">upcoming events</a> — most Easter markets and organised hikes are going ahead as planned.</p>`,
      nl: `<p>De afgelopen weken waren niet gemakkelijk voor de Nièvre. Sinds half maart 2026 zorgen bovengemiddelde regenval en late sneeuwsmelt vanuit het Morvan-massief voor significante overstromingen in de hele regio. De Loire heeft bij Nevers herhaaldelijk de oranje alarmdrempel overschreden.</p>

<h2>Welke gebieden zijn getroffen?</h2>
<p>De meest getroffen gebieden zijn de Loire-valleien tussen <strong>Nevers en Cosne-Cours-sur-Loire</strong>, de lage Aron-vallei rond <strong>Decize</strong> en de Nièvre-rivier stroomafwaarts van <strong>Guérigny</strong>. Het <strong>Canal du Nivernais</strong> is tijdelijk gesloten voor scheepvaart.</p>

<p>In het <strong>Morvan</strong>-massief zijn meerdere wandelpaden langs beken tijdelijk onbegaanbaar. De toegang tot stranden bij <strong>Lac des Settons</strong> en <strong>Lac de Chaumeçon</strong> is gedeeltelijk beperkt.</p>

<h2>Wat is nog toegankelijk?</h2>
<p>Het goede nieuws is dat de meeste toeristische bezienswaardigheden volledig toegankelijk blijven:</p>
<ul>
  <li><strong>Vézelay</strong> en de basiliek zijn normaal toegankelijk.</li>
  <li>De <strong>hoge wandelroutes van het Morvan</strong> bieden spectaculaire uitzichten over de overstroomde valleien.</li>
  <li>De musea in <strong>Nevers</strong> zijn gewoon open.</li>
  <li>De <a href="/activites?cat=kastelen">kastelen en erfgoedsites</a> zijn niet getroffen.</li>
</ul>

<h2>Aangepaste activiteiten</h2>
<ul>
  <li><strong>Wandelen op hoogte:</strong> De <a href="/activites?cat=wandelen">Morvan-kamwegen</a> zijn vrij en bieden spectaculaire uitzichten.</li>
  <li><strong>Wildwaarneming:</strong> Hoogwater drijft fauna naar hogere gronden. Reigers en soms visarenden zijn te zien langs de Loire-dijken.</li>
  <li><strong>Binnen erfgoed:</strong> Bezoek het Faïence-museum in Nevers of ambachtelijke ateliers.</li>
</ul>

<p>Bekijk de <a href="/evenements">aankomende evenementen</a> — de meeste paasfestivals en georganiseerde wandelingen gaan door zoals gepland.</p>`,
    },
  },

  // ─── Top 5 wandelingen in het Morvan ──────────────────────────
  {
    slug: 'top-5-randonnees-morvan',
    date: '2026-03-25',
    category: { fr: 'Randonnée', en: 'Hiking', nl: 'Wandelen' },
    readTime: 7,
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d047a?w=1200&q=80',
    title: {
      fr: 'Top 5 des randonnées incontournables dans le Morvan',
      en: 'Top 5 must-do hikes in the Morvan',
      nl: 'Top 5 wandelingen die je niet mag missen in het Morvan',
    },
    excerpt: {
      fr: 'Forêts profondes, lacs sauvages, sommets panoramiques : le Morvan est l'un des meilleurs terrains de randonnée de France. Noah vous guide à travers ses cinq itinéraires préférés pour tous les niveaux.',
      en: 'Deep forests, wild lakes, panoramic summits: the Morvan is one of France's finest hiking destinations. Noah guides you through his five favourite routes for all levels.',
      nl: 'Diepe bossen, wilde meren, panoramische toppen: het Morvan is een van de beste wandelgebieden van Frankrijk. Noah begeleidt je langs zijn vijf favoriete routes voor alle niveaus.',
    },
    content: {
      fr: `<p>Le Morvan est fait pour la randonnée. Ce massif granitique au cœur de la Bourgogne offre plus de <strong>600 km de sentiers balisés</strong>, des lacs de retenue aux eaux sombres, des forêts de hêtres centenaires et des sommets qui culminent à plus de 900 mètres. Que vous soyez marcheur occasionnel ou randonneur aguerri, voici mes cinq randonnées favorites.</p>

<p>Toutes ces randonnées sont accessibles depuis les activités référencées sur le site — retrouvez-les dans la section <a href="/activites?cat=wandelen">Randonnée</a>.</p>

<h2>1. Le Tour du lac des Settons (14 km — facile)</h2>
<p>C'est la randonnée iconique du Morvan. Le <strong>lac des Settons</strong>, retenue artificielle créée au XIXe siècle pour alimenter les flotteurs de la Loire, est entouré d'une pinède aux senteurs résineuses. Le tour complet (14 km) longe les deux rives avec des points de vue à couper le souffle sur l'eau sombre et les collines boisées.</p>
<ul>
  <li><strong>Départ :</strong> parking principal des Settons (Montsauche-les-Settons)</li>
  <li><strong>Durée :</strong> 3h30 à 4h</li>
  <li><strong>Dénivelé :</strong> +180m</li>
  <li><strong>Idéal pour :</strong> familles, premiers randonneurs</li>
</ul>
<p>Conseil de Noah : faites-le en début de matinée pour profiter du lac dans la brume. En été, les plages du lac accueillent baigneurs et kayakistes.</p>

<h2>2. Le Haut-Folin (8 km — modéré)</h2>
<p>À 901 mètres, le <strong>Haut-Folin</strong> est le point culminant du Morvan et le toit de la Bourgogne. La randonnée depuis Saint-Prix traverse une magnifique forêt de résineux avant d'atteindre le sommet dégagé d'où le panorama par temps clair s'étend jusqu'aux Alpes.</p>
<ul>
  <li><strong>Départ :</strong> parking de la Maison forestière, Saint-Prix</li>
  <li><strong>Durée :</strong> 2h30 à 3h</li>
  <li><strong>Dénivelé :</strong> +320m</li>
  <li><strong>Idéal pour :</strong> panoramas et couchers de soleil</li>
</ul>
<p>Conseil de Noah : apportez des jumelles — les conditions atmosphériques du Morvan offrent des panoramas rares. Le sommet est enneigé de novembre à mars.</p>

<h2>3. Le Mont Beuvray et Bibracte (6 km — facile)</h2>
<p>Le <strong>Mont Beuvray</strong> (821 m) est l'un des sites archéologiques les plus importants de la Gaule : c'est ici que se trouvait <strong>Bibracte</strong>, la capitale des Éduens, là où Vercingétorix aurait été élu chef des Gaulois avant la bataille d'Alésia. La randonnée fait le tour du plateau sommital en passant par les vestiges des remparts et le musée de site.</p>
<ul>
  <li><strong>Départ :</strong> parking du musée de Bibracte (Saint-Léger-sous-Beuvray)</li>
  <li><strong>Durée :</strong> 2h à 2h30</li>
  <li><strong>Dénivelé :</strong> +180m</li>
  <li><strong>Idéal pour :</strong> histoire et archéologie, familles</li>
</ul>
<p>Conseil de Noah : visitez le musée de Bibracte avant ou après la rando — il est l'un des mieux conçus de France pour la préhistoire gauloise.</p>

<h2>4. La Cure en forêt (12 km — modéré)</h2>
<p>La rivière <strong>Cure</strong> est l'une des plus belles rivières du Morvan — claire, vive, parsemée de cascades et de vasques naturelles. Cette randonnée en boucle depuis <strong>Quarré-les-Tombes</strong> descend jusqu'au fond du val pour longer la rivière sur plusieurs kilomètres avant de remonter par les crêtes forestières.</p>
<ul>
  <li><strong>Départ :</strong> place de l'église, Quarré-les-Tombes</li>
  <li><strong>Durée :</strong> 4h à 4h30</li>
  <li><strong>Dénivelé :</strong> +380m</li>
  <li><strong>Idéal pour :</strong> amoureux des rivières, photographes</li>
</ul>
<p>Conseil de Noah : prenez un pique-nique et arrêtez-vous au bord de la Cure — les vasques au fond du val sont parfaites pour piquer les pieds en été.</p>

<h2>5. Le Signal d'Uchon (10 km — modéré)</h2>
<p>Moins connu que le Haut-Folin, le <strong>Signal d'Uchon</strong> (681 m) est un chaos granitique spectaculaire qui offre un panorama à 360° sur le Morvan, le Charolais et par temps clair jusqu'au Mont-Blanc. La randonnée depuis le village d'Uchon traverse des landes de bruyère typiques du Morvan méridional.</p>
<ul>
  <li><strong>Départ :</strong> village d'Uchon (Saône-et-Loire, limite Morvan)</li>
  <li><strong>Durée :</strong> 3h à 3h30</li>
  <li><strong>Dénivelé :</strong> +260m</li>
  <li><strong>Idéal pour :</strong> panoramas et géologie</li>
</ul>
<p>Conseil de Noah : les chaos granitiques en automne, couverts de mousse et baignés dans la lumière rasante, sont d'une beauté photographique rare.</p>

<h2>Conseils pratiques pour randonner dans le Morvan</h2>
<ul>
  <li><strong>Équipement :</strong> Le Morvan est humide — même en été, prévoyez une veste imperméable.</li>
  <li><strong>Cartes :</strong> Emportez les cartes IGN Top 25 (séries 2823OT, 2724OT) ou utilisez l'application Komoot.</li>
  <li><strong>Refuges et ravitaillement :</strong> Les bourgs sont petits — prévoyez votre ravitaillement à l'avance.</li>
  <li><strong>Période idéale :</strong> Avril–juin (verdure, pas de foule) et septembre–octobre (feuillage automnal).</li>
</ul>

<p>Retrouvez toutes les randonnées disponibles dans la région dans notre section <a href="/activites?cat=wandelen">activités Randonnée</a>, ou consultez l'<a href="/evenements">agenda des randonnées organisées</a> pour marcher en groupe.</p>`,
      en: `<p>The Morvan is made for hiking. This granite massif in the heart of Burgundy offers more than <strong>600 km of marked trails</strong>, dark-watered lakes, ancient beech forests and summits reaching over 900 metres. Whether you're an occasional walker or seasoned hiker, here are my five favourite routes.</p>

<p>All of these hikes are listed in our <a href="/activites?cat=wandelen">Hiking activities</a> section.</p>

<h2>1. Lac des Settons circuit (14 km — easy)</h2>
<p>The iconic Morvan hike. The <strong>Lac des Settons</strong> is surrounded by a pine forest and the full circuit (14 km) follows both shores with breathtaking views over the dark water.</p>
<ul><li><strong>Start:</strong> Main car park, Montsauche-les-Settons</li><li><strong>Duration:</strong> 3.5–4 hours</li><li><strong>Elevation:</strong> +180m</li><li><strong>Best for:</strong> families, first-time hikers</li></ul>

<h2>2. Haut-Folin summit (8 km — moderate)</h2>
<p>At 901 metres, <strong>Haut-Folin</strong> is Burgundy's highest point. Clear-day views extend as far as the Alps.</p>
<ul><li><strong>Duration:</strong> 2.5–3 hours</li><li><strong>Elevation:</strong> +320m</li></ul>

<h2>3. Mont Beuvray and Bibracte (6 km — easy)</h2>
<p>Archaeological walking at Bibracte, the ancient Gaulish capital where Vercingetorix was elected leader before the battle of Alesia.</p>
<ul><li><strong>Duration:</strong> 2–2.5 hours</li><li><strong>Best for:</strong> history lovers, families</li></ul>

<h2>4. La Cure river valley (12 km — moderate)</h2>
<p>One of the Morvan's most beautiful rivers — clear, lively, with natural pools perfect for cooling your feet in summer.</p>
<ul><li><strong>Start:</strong> Quarré-les-Tombes church square</li><li><strong>Duration:</strong> 4–4.5 hours</li><li><strong>Elevation:</strong> +380m</li></ul>

<h2>5. Signal d'Uchon (10 km — moderate)</h2>
<p>A spectacular granite chaos with 360° views over the Morvan and Charolais. One of the region's hidden gems.</p>
<ul><li><strong>Duration:</strong> 3–3.5 hours</li></ul>

<p>Find all available hikes in our <a href="/activites?cat=wandelen">Hiking activities</a> section, or check the <a href="/evenements">events calendar</a> for organised group walks.</p>`,
      nl: `<p>Het Morvan is gemaakt voor wandelaars. Dit granietmassief biedt meer dan <strong>600 km gemarkeerde paden</strong>, donkere meren, eeuwenoude beukenbossen en toppen tot boven de 900 meter. Hier zijn mijn vijf favoriete routes.</p>

<p>Al deze wandelingen zijn terug te vinden in onze sectie <a href="/activites?cat=wandelen">Wandelactiviteiten</a>.</p>

<h2>1. Rondwandeling Lac des Settons (14 km — makkelijk)</h2>
<p>De iconische Morvan-wandeling. Het <strong>Lac des Settons</strong> is omgeven door een dennenhos en de volledige rondwandeling volgt beide oevers met adembenemende uitzichten.</p>
<ul><li><strong>Duur:</strong> 3,5–4 uur</li><li><strong>Hoogteverschil:</strong> +180m</li><li><strong>Ideaal voor:</strong> gezinnen, beginners</li></ul>

<h2>2. Haut-Folin (8 km — gemiddeld)</h2>
<p>Het hoogste punt van Bourgondië op 901 meter. Bij helder weer uitzicht tot de Alpen.</p>
<ul><li><strong>Duur:</strong> 2,5–3 uur</li><li><strong>Hoogteverschil:</strong> +320m</li></ul>

<h2>3. Mont Beuvray en Bibracte (6 km — makkelijk)</h2>
<p>Wandelen over het Gallische oppidum Bibracte, waar Vercingetorix tot aanvoerder werd gekozen vóór de slag bij Alesia.</p>
<ul><li><strong>Duur:</strong> 2–2,5 uur</li><li><strong>Ideaal voor:</strong> geschiedenisliefhebbers, gezinnen</li></ul>

<h2>4. De Cure-rivier (12 km — gemiddeld)</h2>
<p>Een van de mooiste rivieren van het Morvan — helder, levendig, met natuurlijke zwembadjes.</p>
<ul><li><strong>Duur:</strong> 4–4,5 uur</li><li><strong>Hoogteverschil:</strong> +380m</li></ul>

<h2>5. Signal d'Uchon (10 km — gemiddeld)</h2>
<p>Een spectaculair granietchaos met panoramisch uitzicht over het Morvan en het Charolais.</p>
<ul><li><strong>Duur:</strong> 3–3,5 uur</li></ul>

<p>Vind alle beschikbare wandelingen in onze sectie <a href="/activites?cat=wandelen">Wandelactiviteiten</a>, of bekijk de <a href="/evenements">evenementenkalender</a> voor georganiseerde groepswandelingen.</p>`,
    },
  },

  // ─── Wandelen met kinderen in de Nièvre ───────────────────────
  {
    slug: 'randonner-enfants-nievre',
    date: '2026-03-22',
    category: { fr: 'Randonnée', en: 'Hiking', nl: 'Wandelen' },
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
    title: {
      fr: 'Randonner avec des enfants dans la Nièvre : les meilleures balades',
      en: 'Hiking with children in the Nièvre: the best family walks',
      nl: 'Wandelen met kinderen in de Nièvre: de beste gezinswandelingen',
    },
    excerpt: {
      fr: 'La Nièvre est une destination idéale pour les familles avec de jeunes enfants. Noah sélectionne les randonnées courtes, sécurisées et ludiques qui transformeront vos balades en véritables aventures pour les petits.',
      en: 'The Nièvre is an ideal destination for families with young children. Noah selects the short, safe and fun hikes that will turn your walks into real adventures for the little ones.',
      nl: 'De Nièvre is een ideale bestemming voor gezinnen met jonge kinderen. Noah selecteert de korte, veilige en speelse wandelingen die uw tochten tot echte avonturen voor de kleintjes maken.',
    },
    content: {
      fr: `<p>Emmener des enfants en randonnée, c'est tout un art. Il faut des paysages qui les captivent, des objectifs concrets qui les motivent, et surtout des distances raisonnables. La Nièvre et le Morvan sont parfaits pour ça : la nature y est spectaculaire, les sentiers bien balisés, et il n'y a jamais loin vers un lac pour piquer-niquer ou une rivière pour se tremper les pieds.</p>

<p>Découvrez toutes les <a href="/activites?cat=wandelen">randonnées disponibles</a> dans la région, adaptées à tous les niveaux.</p>

<h2>La règle des 30 minutes par an d'âge</h2>
<p>En pédiatrie de plein air, on parle de la règle des 30 minutes par an d'âge : un enfant de 4 ans peut marcher environ 2 heures, un enfant de 6 ans 3 heures, etc. Restez en dessous de ces limites et tout le monde rentrera content.</p>

<h2>1. Le sentier des Loutres — Lac de Saint-Agnan (5 km)</h2>
<p>Le <strong>lac de Saint-Agnan</strong> est l'un des lacs les plus accessibles du Morvan. Le sentier qui en fait le tour est plat, ombragé et parsemé de panneaux pédagogiques sur la faune locale — notamment les loutres qui ont recolonisé la rivière Cousin voisine. Idéal pour les 4–8 ans.</p>
<ul>
  <li><strong>Départ :</strong> aire de pique-nique du lac de Saint-Agnan (Chevigny)</li>
  <li><strong>Distance :</strong> 5 km</li>
  <li><strong>Durée :</strong> 1h30</li>
  <li><strong>Point fort :</strong> plage avec baignade surveillée en été</li>
</ul>

<h2>2. La forêt des Fées — Pierre Écrite (3 km)</h2>
<p>Entre <strong>Vézelay</strong> et <strong>Pierre-Perthuis</strong>, ce petit sentier traverse une forêt de hêtres aux allures de décor de conte. La Pierre Écrite, un rocher gravé de l'époque romaine, fascine les enfants qui adorent chercher les inscriptions cachées dans la mousse.</p>
<ul>
  <li><strong>Distance :</strong> 3 km</li>
  <li><strong>Durée :</strong> 1h15</li>
  <li><strong>Idéal pour :</strong> 3–7 ans</li>
  <li><strong>Bonus :</strong> le pont de Pierre-Perthuis enjambe la Cure — spectaculaire !</li>
</ul>

<h2>3. Le village et les lavoirs de Bazoches (4 km)</h2>
<p>Une boucle facile depuis le <strong>château de Bazoches</strong> (demeure du Maréchal Vauban) qui traverse les champs et longe les ruisseaux du village. Les lavoirs médiévaux fascinent les enfants, tout comme les chevaux et les vaches qui paissent dans les prés alentour.</p>
<ul>
  <li><strong>Distance :</strong> 4 km</li>
  <li><strong>Durée :</strong> 1h30</li>
  <li><strong>À combiner avec :</strong> la visite du château de Bazoches</li>
</ul>

<h2>4. Les cascades de la Canche (6 km)</h2>
<p>Le long de la <strong>Canche</strong>, torrent du Morvan, une série de petites cascades et de vasques naturelles jalonnent le sentier. En été, les vasques sont parfaites pour barboter. Les enfants s'arrêtent toutes les cinq minutes — ce qui est un avantage quand la randonnée est plus longue que prévu !</p>
<ul>
  <li><strong>Départ :</strong> Planchez</li>
  <li><strong>Distance :</strong> 6 km</li>
  <li><strong>Durée :</strong> 2h à 2h30</li>
  <li><strong>Idéal pour :</strong> 6 ans et plus</li>
</ul>

<h2>5. Bibracte en famille — Le sentier des Remparts (4 km)</h2>
<p>Le sentier des Remparts du <strong>Mont Beuvray</strong> est conçu pour les familles : panneaux interactifs sur la vie gauloise, reconstitutions d'artisanat, et une végétation spectaculaire tout au long du parcours. Le musée de Bibracte propose des activités pédagogiques spéciales pour les enfants les mercredis et pendant les vacances.</p>
<ul>
  <li><strong>Distance :</strong> 4 km</li>
  <li><strong>Durée :</strong> 1h30 (+ visite du musée)</li>
  <li><strong>Idéal pour :</strong> enfants curieux d'histoire, 5 ans et plus</li>
</ul>

<h2>Quoi emporter pour randonner avec des enfants ?</h2>
<ul>
  <li>Chaussures imperméables (même en été, le Morvan est humide)</li>
  <li>K-way pour chacun</li>
  <li>Loupe de botaniste ou carnet naturaliste pour les enfants</li>
  <li>Provisions en quantité — les enfants ont toujours plus faim dehors</li>
  <li>Un appareil photo jetable pour les enfants (ça les occupe et ça crée de beaux souvenirs)</li>
</ul>

<p>Consultez notre <a href="/activites?cat=wandelen">guide complet des randonnées</a> pour trouver l'itinéraire parfait selon l'âge et le niveau de vos enfants, et les <a href="/evenements">sorties nature organisées</a> qui accueillent les familles.</p>`,
      en: `<p>Taking children hiking is an art. You need landscapes that captivate them, concrete goals that motivate them, and above all reasonable distances. The Nièvre and Morvan are perfect for this — spectacular nature, well-marked trails, and always a lake nearby for a picnic or a river to paddle in.</p>

<p>Find all available <a href="/activites?cat=wandelen">hiking routes</a> in the region.</p>

<h2>The 30-minute rule</h2>
<p>A useful guideline: 30 minutes of hiking per year of age. A 4-year-old can walk about 2 hours, a 6-year-old 3 hours. Stay within these limits.</p>

<h2>1. The Otters' Trail — Lac de Saint-Agnan (5 km)</h2>
<p>Flat, shaded loop with educational panels about local wildlife (otters!). Perfect for ages 4–8. Supervised swimming beach in summer.</p>
<ul><li><strong>Duration:</strong> 1.5 hours</li></ul>

<h2>2. The Fairies' Forest — Pierre Écrite (3 km)</h2>
<p>A magical beech forest walk near Vézelay leading to an inscribed Roman rock that children love searching for in the moss.</p>
<ul><li><strong>Duration:</strong> 1h15</li><li><strong>Best for:</strong> ages 3–7</li></ul>

<h2>3. Bazoches village and wash-houses (4 km)</h2>
<p>Easy loop from Bazoches château through fields and along streams. Medieval wash-houses and farm animals fascinate young children.</p>
<ul><li><strong>Duration:</strong> 1.5 hours</li></ul>

<h2>4. La Canche waterfalls (6 km)</h2>
<p>Natural pools perfect for paddling. Children stop every five minutes — which is actually helpful on longer hikes!</p>
<ul><li><strong>Duration:</strong> 2–2.5 hours</li><li><strong>Best for:</strong> ages 6+</li></ul>

<h2>5. Bibracte Family Trail (4 km)</h2>
<p>Designed for families with interactive panels about Gaulish life. Combine with the Bibracte museum for a full educational day.</p>
<ul><li><strong>Duration:</strong> 1.5 hours (+museum visit)</li></ul>

<p>Browse our <a href="/activites?cat=wandelen">full hiking guide</a> and <a href="/evenements">nature events calendar</a> for family-friendly organised walks.</p>`,
      nl: `<p>Kinderen meenemen op wandeling is een kunst. Je hebt landschappen nodig die boeien, concrete doelen die motiveren, en redelijke afstanden. De Nièvre en het Morvan zijn hier perfect voor — spectaculaire natuur, goed bewegwijzerde paden en altijd een meer of rivier in de buurt.</p>

<p>Vind alle beschikbare <a href="/activites?cat=wandelen">wandelroutes</a> in de regio.</p>

<h2>De 30-minutenregel</h2>
<p>Een handige richtlijn: 30 minuten wandelen per leeftijdsjaar. Een kind van 4 kan circa 2 uur lopen, een kind van 6 jaar circa 3 uur.</p>

<h2>1. Het Otterpad — Lac de Saint-Agnan (5 km)</h2>
<p>Vlakke, beschaduwde rondwandeling met educatieve panelen over otter en andere fauna. Ideaal voor 4–8 jaar. Bewaamd zwemstrand in de zomer.</p>
<ul><li><strong>Duur:</strong> 1,5 uur</li></ul>

<h2>2. Het Sprookjesbos — Pierre Écrite (3 km)</h2>
<p>Een magisch beukenbos nabij Vézelay dat uitkomt bij een beschreven Romeinse rots. Kinderen zoeken graag de inscripties in het mos.</p>
<ul><li><strong>Duur:</strong> 1u15</li><li><strong>Ideaal voor:</strong> 3–7 jaar</li></ul>

<h2>3. Bazoches en de wasplaatsen (4 km)</h2>
<p>Makkelijke rondwandeling langs middeleeuwse wasplaatsen en weilanden met boerderijdieren.</p>
<ul><li><strong>Duur:</strong> 1,5 uur</li></ul>

<h2>4. De Canche-watervallen (6 km)</h2>
<p>Natuurlijke zwembaadjes perfect om in te pootjebaden. Kinderen stoppen elke vijf minuten — wat eigenlijk handig is bij langere wandelingen!</p>
<ul><li><strong>Duur:</strong> 2–2,5 uur</li><li><strong>Ideaal voor:</strong> 6 jaar en ouder</li></ul>

<h2>5. Bibracte gezinspad (4 km)</h2>
<p>Speciaal ontworpen voor gezinnen met interactieve panelen over het Gallische leven. Combineer met een museumbezoek.</p>
<ul><li><strong>Duur:</strong> 1,5 uur (+museum)</li></ul>

<p>Bekijk onze <a href="/activites?cat=wandelen">volledige wandelgids</a> en de <a href="/evenements">natuur-evenementenkalender</a> voor georganiseerde gezinswandelingen.</p>`,
    },
  },
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'guide-nevers-que-faire',
    date: '2026-03-30',
    category: { fr: 'Guide', en: 'Guide', nl: 'Gids' },
    readTime: 6,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Nevers_-_Cath%C3%A9drale_Saint-Cyr-et-Sainte-Julitte_%281%29.jpg/1280px-Nevers_-_Cath%C3%A9drale_Saint-Cyr-et-Sainte-Julitte_%281%29.jpg',
    title: {
      fr: 'Que faire à Nevers ? Notre guide de la capitale nivernaise',
      en: 'What to do in Nevers? Our guide to the Nièvre\'s capital',
      nl: 'Wat te doen in Nevers? Onze gids voor de hoofdstad van de Nièvre',
    },
    excerpt: {
      fr: 'Cathédrale, palais ducal, faïences, bords de Loire et circuit de Magny-Cours : Nevers est une ville surprenante qui mérite bien plus qu\'une simple escale.',
      en: 'Cathedral, ducal palace, faience pottery, the Loire riverbanks and Magny-Cours circuit: Nevers is a surprising city that deserves far more than a quick stop.',
      nl: 'Kathedraal, hertogelijk paleis, aardewerk, Loire-oevers en Magny-Cours: Nevers is een verrassende stad die veel meer verdient dan een vluchtig bezoek.',
    },
    content: {
      fr: `<p>Nevers est souvent vue comme une ville de passage sur la route du Sud. C'est une erreur. La préfecture de la Nièvre recèle un patrimoine remarquable, une vie culturelle vivante et une situation géographique exceptionnelle au confluent de la Loire et de la Nièvre. Voici un guide complet pour découvrir Nevers autrement.</p>

<h2>La cathédrale Saint-Cyr-et-Sainte-Julitte</h2>
<p>C'est l'édifice le plus remarquable de Nevers. La <strong>cathédrale Saint-Cyr-et-Sainte-Julitte</strong> présente la particularité unique en France d'avoir deux absis — une à chaque extrémité — résultat de plusieurs siècles de construction entre le Xe et le XVIe siècle. L'intérieur est étonnamment lumineux grâce aux vitraux contemporains réalisés après les bombardements de la Seconde Guerre mondiale par des artistes comme Jean Bazaine et Marc Ingrand. Ne manquez pas la crypte romane.</p>

<h2>Le palais ducal</h2>
<p>Face à la cathédrale, le <strong>palais ducal</strong> de style Renaissance (XVe–XVIe siècle) est l'un des premiers exemples du style Renaissance en France. Ses tourelles caractéristiques et sa façade ornée dominent la vieille ville. Aujourd'hui siège de la préfecture, il n'est pas ouvert au public en permanence, mais ses façades extérieures et la cour intérieure se visitent lors des Journées du Patrimoine. Depuis l'esplanade devant le palais, la vue sur la Loire est exceptionnelle.</p>

<h2>Les faïences de Nevers</h2>
<p>Nevers est mondialement connue pour sa <strong>faïence</strong>, un artisanat qui remonte au XVIe siècle quand des potiers italiens s'installèrent en ville sous la protection du duc de Nevers. Les pièces typiques se reconnaissent à leurs fonds bleus cobalt et blanc, ornés de scènes mythologiques ou bibliques. Le <strong>musée de la Faïence et des Beaux-Arts</strong>, installé dans l'ancien palais épiscopal, conserve une collection de référence. Plusieurs ateliers de faïenciers sont encore actifs en ville et proposent des visites.</p>

<h2>Sainte Bernadette Soubirous</h2>
<p>Nevers est le dernier lieu de vie de <strong>Bernadette Soubirous</strong>, la voyante de Lourdes. Le couvent Saint-Gildard, où elle vécut ses dernières années et mourut en 1879, conserve son corps intact — devenu lieu de pèlerinage pour des milliers de visiteurs chaque année. Que l'on soit croyant ou non, la visite du couvent et de son jardin est une expérience saisissante.</p>

<h2>Les bords de Loire</h2>
<p>Nevers est l'une des rares villes françaises à conserver ses <strong>bords de Loire</strong> non urbanisés. Les quais Louis-Codet et l'esplanade offrent une promenade de plusieurs kilomètres entre les saules et les bancs de sable de la Loire sauvage. Le soir, au coucher du soleil, les reflets sur le fleuve et la silhouette de la cathédrale créent l'un des plus beaux panoramas de la région. En été, des activités nautiques sont proposées au bord du fleuve.</p>

<h2>La porte du Croux et les remparts</h2>
<p>La <strong>porte du Croux</strong> est l'une des mieux préservées des remparts médiévaux de Nevers (XIVe siècle). Cette tour carrée imposante abrite aujourd'hui un petit musée archéologique. Une partie des remparts médiévaux est encore visible dans le quartier historique et donne un bel aperçu de l'ancienne fortification de la ville.</p>

<h2>Le circuit de Magny-Cours</h2>
<p>À seulement 12 km au sud de Nevers, le <strong>circuit de Nevers Magny-Cours</strong> est l'un des circuits automobiles les plus prestigieux de France. Il accueillit le Grand Prix de France de Formule 1 de 1991 à 2008. Aujourd'hui, le circuit accueille de nombreuses compétitions (GT, Endurance, Motos) et propose des journées de pilotage au volant de voitures de sport. Même sans événement, le musée de la Formule 1 sur place vaut la visite pour les passionnés de motorsport.</p>

<h2>Où manger à Nevers ?</h2>
<p>La ville compte plusieurs bonnes adresses autour des spécialités régionales :</p>
<ul>
  <li>Les restaurants du quartier de la cathédrale pour les cuisines du terroir nivernais.</li>
  <li>Les bistrots des bords de Loire pour une cuisine simple et locale.</li>
  <li>Les marchés du samedi matin place Carnot pour les produits frais des maraîchers et fromagers de la région.</li>
</ul>

<h2>Infos pratiques</h2>
<ul>
  <li><strong>Depuis Paris :</strong> 2h en TGV, gare SNCF à 10 min à pied du centre historique.</li>
  <li><strong>En voiture :</strong> A77 depuis Paris, sortie Nevers-Nord ou Nevers-Sud.</li>
  <li><strong>Office de tourisme :</strong> place Carnot, ouvert toute l'année.</li>
  <li><strong>Durée conseillée :</strong> 1 journée complète pour voir l'essentiel, 2 jours si vous souhaitez Magny-Cours et les environs.</li>
</ul>`,

      en: `<p>Nevers is often seen as a stopover on the way south. That's a mistake. The Nièvre's prefecture holds remarkable heritage, a lively cultural scene and an exceptional location at the confluence of the Loire and the Nièvre. Here is a complete guide to discovering Nevers differently.</p>

<h2>Saint-Cyr Cathedral</h2>
<p><strong>Saint-Cyr-et-Sainte-Julitte Cathedral</strong> has the unique distinction in France of having two apses — one at each end — the result of centuries of construction from the 10th to the 16th century. The interior is surprisingly luminous thanks to contemporary stained glass created after wartime bombing by artists including Jean Bazaine. Don't miss the Romanesque crypt.</p>

<h2>The Ducal Palace</h2>
<p>The <strong>Ducal Palace</strong> opposite the cathedral is one of France's earliest examples of Renaissance style (15th–16th century). Its characteristic turrets and ornate façade dominate the old town. Now the prefecture, it opens to the public during Heritage Days. From the esplanade, the view over the Loire is exceptional.</p>

<h2>Nevers Faience</h2>
<p>Nevers is world-famous for its <strong>faience pottery</strong>, a craft dating to the 16th century when Italian potters settled in the town. The typical pieces feature cobalt blue and white backgrounds with mythological or biblical scenes. The <strong>Faience and Fine Arts Museum</strong> in the former bishop's palace holds the definitive collection. Several active faience workshops in town offer visits.</p>

<h2>Saint Bernadette of Lourdes</h2>
<p>Nevers was the final home of <strong>Bernadette Soubirous</strong>, the Lourdes visionary. The Saint-Gildard convent, where she spent her last years and died in 1879, preserves her intact body — a pilgrimage site attracting thousands each year. Believer or not, the visit to the convent and its garden is a striking experience.</p>

<h2>The Loire Riverbanks</h2>
<p>Nevers is one of the few French cities to retain undeveloped <strong>Loire riverbanks</strong>. The quays offer several kilometres of walking between willows and Loire sandbars. At sunset, reflections on the river and the cathedral silhouette create one of the region's finest panoramas.</p>

<h2>Magny-Cours Circuit</h2>
<p>Just 12 km south of Nevers, the <strong>Nevers Magny-Cours Circuit</strong> hosted the French Formula 1 Grand Prix from 1991 to 2008. Today it hosts GT, Endurance and Motorcycle competitions, plus driving days. The on-site Formula 1 museum is worth a visit for motorsport fans.</p>

<h2>Practical information</h2>
<ul>
  <li><strong>From Paris:</strong> 2h by TGV, station is 10 minutes' walk from the historic centre.</li>
  <li><strong>By car:</strong> A77 motorway from Paris, exit Nevers-Nord or Nevers-Sud.</li>
  <li><strong>Recommended time:</strong> 1 full day for the essentials, 2 days to include Magny-Cours.</li>
</ul>`,

      nl: `<p>Nevers wordt vaak gezien als een doorgangspunt op weg naar het zuiden. Dat is een vergissing. De prefectuur van de Nièvre herbergt opmerkelijk erfgoed, een levendig cultureel leven en een uitzonderlijke ligging aan het samenstromen van de Loire en de Nièvre. Een complete gids om Nevers op een andere manier te ontdekken.</p>

<h2>Kathedraal Saint-Cyr</h2>
<p>De <strong>kathedraal Saint-Cyr-et-Sainte-Julitte</strong> heeft de unieke eigenschap in Frankrijk van twee apsen te hebben — één aan elk uiteinde — het resultaat van eeuwen bouwen van de 10e tot de 16e eeuw. Het interieur is verrassend licht dankzij hedendaagse glas-in-loodramen gemaakt na de oorlogsbombardementen door kunstenaars zoals Jean Bazaine. Mis de Romaanse crypte niet.</p>

<h2>Het hertogelijk paleis</h2>
<p>Het <strong>hertogelijk paleis</strong> tegenover de kathedraal is een van de vroegste voorbeelden van Renaissancestijl in Frankrijk (15e–16e eeuw). Zijn karakteristieke torentjes en versierde gevel domineren de oude stad. Vanuit de esplanade is het uitzicht over de Loire uitzonderlijk.</p>

<h2>Nevers aardewerk</h2>
<p>Nevers is wereldberoemd om zijn <strong>faience-aardewerk</strong>, een ambacht dat dateert uit de 16e eeuw toen Italiaanse pottenbakkers zich in de stad vestigden. De typische stukken kenmerken zich door kobaltblauwe en witte achtergronden met mythologische of bijbelse taferelen. Het <strong>Faïence- en Schone Kunstenmuseum</strong> heeft de definitieve collectie. Meerdere actieve ateliers in de stad bieden bezoeken aan.</p>

<h2>De heilige Bernadette</h2>
<p>Nevers was de laatste woonplaats van <strong>Bernadette Soubirous</strong>, de visionair van Lourdes. Het klooster Saint-Gildard, waar zij haar laatste jaren doorbracht en stierf in 1879, bewaart haar intact lichaam — een bedevaartsoord dat jaarlijks duizenden bezoekers trekt.</p>

<h2>De Loire-oevers</h2>
<p>Nevers is een van de weinige Franse steden met onbebouwde <strong>Loire-oevers</strong>. De kades bieden kilometers wandelen tussen wilgen en Loire-zandbanken. Bij zonsondergang creëren de weerspiegelingen op de rivier en het silhouet van de kathedraal een van de mooiste panorama's van de regio.</p>

<h2>Magny-Cours circuit</h2>
<p>Op slechts 12 km ten zuiden van Nevers ligt het <strong>Nevers Magny-Cours Circuit</strong>, dat de Franse Formule 1 Grand Prix organiseerde van 1991 tot 2008. Vandaag herbergt het GT-, Endurance- en Motorevenementen en rijdagen. Het Formule 1-museum op de site is een bezoek waard voor motorsportliefhebbers.</p>

<h2>Praktische informatie</h2>
<ul>
  <li><strong>Vanuit Parijs:</strong> 2u per TGV, station op 10 minuten lopen van het historische centrum.</li>
  <li><strong>Per auto:</strong> A77 snelweg vanuit Parijs, afrit Nevers-Noord of Nevers-Zuid.</li>
  <li><strong>Aanbevolen tijd:</strong> 1 volle dag voor het essentiële, 2 dagen inclusief Magny-Cours.</li>
</ul>`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'canal-du-nivernais-guide',
    date: '2026-03-29',
    category: { fr: 'Nature & Vélo', en: 'Nature & Cycling', nl: 'Natuur & Fietsen' },
    readTime: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Canal_du_Nivernais_Baye.JPG/1280px-Canal_du_Nivernais_Baye.JPG',
    title: {
      fr: 'Le Canal du Nivernais : guide complet pour une escapade nature',
      en: 'Canal du Nivernais: complete guide for a nature getaway',
      nl: 'Canal du Nivernais: complete gids voor een natuuruitstap',
    },
    excerpt: {
      fr: 'Classé parmi les plus beaux canaux de France, le Canal du Nivernais offre 174 km de voyage lent entre écluses, villages et forêts. À vélo ou en bateau, c\'est l\'aventure verte par excellence.',
      en: 'Ranked among France\'s most beautiful waterways, the Canal du Nivernais offers 174 km of slow travel between locks, villages and forests. By bike or by boat, it\'s the ultimate green adventure.',
      nl: 'Als een van de mooiste waterwegen van Frankrijk biedt het Canal du Nivernais 174 km langzaam reizen langs sluizen, dorpen en bossen. Per fiets of boot: de ultieme groene avontuur.',
    },
    content: {
      fr: `<p>Le <strong>Canal du Nivernais</strong> est l'un des joyaux méconnus du patrimoine fluvial français. Construit entre 1784 et 1842 pour transporter le bois du Morvan vers Paris, ce canal de 174 kilomètres relie Auxerre à Decize, traversant la Bourgogne du nord au sud à travers des paysages d'une beauté remarquable. Aujourd'hui classé parmi les plus beaux canaux de France, il est devenu un paradis pour les amateurs de tourisme fluvial, de vélo et de nature.</p>

<h2>L'histoire du canal</h2>
<p>À l'époque de sa construction, le Canal du Nivernais avait une mission claire : acheminer le bois du Morvan — indispensable au chauffage et à la construction — vers les grandes villes du Nord et surtout vers Paris. Les flotteurs de bois, appelés "galvachers", guidaient d'immenses radeaux de troncs depuis les forêts du Morvan jusqu'à la capitale. Le canal comptait jusqu'à 110 écluses sur son tracé, ce qui en fait l'un des plus escarpés de France — et aujourd'hui l'un des plus pittoresques pour les plaisanciers qui naviguent au rythme de ces passages.</p>

<h2>À vélo sur la voie verte</h2>
<p>La <strong>Voie Verte du Canal du Nivernais</strong> est l'un des itinéraires cyclables les plus agréables de Bourgogne. L'ancienne voie de halage, parfaitement aménagée, longe le canal sur des dizaines de kilomètres sans circulation automobile. C'est un parcours plat, ombragé et reposant, idéal pour les familles et les cyclistes de tous niveaux.</p>
<p>Quelques étapes incontournables à vélo :</p>
<ul>
  <li><strong>Corbigny — Châtillon-en-Bazois</strong> (35 km) : traversée de villages authentiques, belles écluses et paysages de bocage. L'étape la plus accessible pour une journée.</li>
  <li><strong>Clamecy — Chitry-les-Mines</strong> (25 km) : passage par la gorge de Sardy et les sources du canal dans le nord de la Nièvre. Section sauvage et peu fréquentée.</li>
  <li><strong>Châtillon-en-Bazois — Decize</strong> (45 km) : l'étape finale avec l'entrée dans la plaine nivernaise et la confluence avec la Loire à Decize.</li>
</ul>

<h2>En bateau sur le canal</h2>
<p>La navigation de plaisance sur le Canal du Nivernais est une expérience incomparable. Plusieurs bases nautiques proposent la location de bateaux habitables (sans permis jusqu'à 15 m/h) à la semaine ou au week-end :</p>
<ul>
  <li><strong>Auxerre</strong> : point de départ nord du canal, bon choix pour une descente complète vers le sud.</li>
  <li><strong>Corbigny</strong> : au cœur de la Nièvre, idéal pour des circuits de 3 à 5 jours.</li>
  <li><strong>Decize</strong> : au sud, pour remonter vers le Morvan en naviguant contre-courant.</li>
</ul>
<p>Le rythme sur le canal est volontairement lent — 8 km/h maximum autorisé — ce qui en fait une forme de voyage méditative et ressourçante. Compter en moyenne 3–4 heures pour franchir une dizaine d'écluses.</p>

<h2>Les villages du canal</h2>
<p>Le canal traverse une série de villages de caractère qui méritent chacun une halte :</p>
<ul>
  <li><strong>Clamecy</strong> : ancienne capitale des flotteurs de bois, ville médiévale avec sa collégiale Saint-Martin et ses maisons à colombages. Musée d'art et d'histoire régional.</li>
  <li><strong>Corbigny</strong> : bourg animé avec marché hebdomadaire, abbaye de Corbigny et nombreux services pour les cyclistes et plaisanciers.</li>
  <li><strong>Châtillon-en-Bazois</strong> : château médiéval accessible directement depuis le canal, l'un des sites les plus photographiés du parcours.</li>
  <li><strong>Decize</strong> : ville-presqu'île à la confluence de la Loire et du canal, avec son vieux château médiéval dominant le fleuve.</li>
</ul>

<h2>La faune et la flore du canal</h2>
<p>Le Canal du Nivernais est un corridor écologique remarquable. Les berges abritent une faune variée : <strong>martins-pêcheurs</strong> (facilement observables depuis un bateau ou un vélo silencieux), <strong>hérons cendrés</strong>, <strong>loutres</strong> (présentes mais discrètes), <strong>castors</strong> (notamment dans la section nord). Les rives sont couvertes de saules, d'aulnes et d'iris jaunes au printemps. En mai–juin, les renoncules aquatiques couvrent la surface du canal de tapis blancs et jaunes d'une beauté saisissante.</p>

<h2>Infos pratiques</h2>
<ul>
  <li><strong>Meilleure période :</strong> mai–octobre pour la navigation, avril–octobre pour le vélo.</li>
  <li><strong>Location de vélos :</strong> plusieurs loueurs à Corbigny, Clamecy et Auxerre.</li>
  <li><strong>Location de bateaux :</strong> Nicols, Crown Blue Line et Burgundy Cruisers proposent des bases sur le canal.</li>
  <li><strong>Écluses :</strong> le canal est géré par VNF (Voies Navigables de France). Les écluses sont en service de mars à novembre.</li>
  <li><strong>Haltes nautiques :</strong> pontons et services (eau, électricité) disponibles dans les principaux villages.</li>
</ul>`,

      en: `<p>The <strong>Canal du Nivernais</strong> is one of France's unsung waterway gems. Built between 1784 and 1842 to carry Morvan timber to Paris, this 174-kilometre canal links Auxerre to Decize, crossing Burgundy north to south through remarkable landscapes. Today ranked among France's most beautiful canals, it has become a paradise for boating, cycling and nature lovers.</p>

<h2>A brief history</h2>
<p>The canal was built to transport Morvan timber — essential for heating and construction — to northern cities, especially Paris. The timber floaters, known as "galvachers", guided vast log rafts from the Morvan forests to the capital. The canal's 110 locks make it one of France's steepest — and today one of its most picturesque for pleasure boaters.</p>

<h2>Cycling the towpath</h2>
<p>The <strong>Canal du Nivernais Greenway</strong> is one of Burgundy's most pleasant cycling routes. The converted former towpath follows the canal for dozens of kilometres, car-free, flat, shaded and peaceful. Perfect for families and cyclists of all levels.</p>
<p>Recommended stages by bike:</p>
<ul>
  <li><strong>Corbigny — Châtillon-en-Bazois</strong> (35 km): authentic villages, beautiful locks and bocage landscapes. The most accessible day stage.</li>
  <li><strong>Clamecy — Chitry-les-Mines</strong> (25 km): passing through the Sardy gorge and the canal's source in northern Nièvre. Wild and little-frequented.</li>
  <li><strong>Châtillon-en-Bazois — Decize</strong> (45 km): the final stage entering the Nivernais plain and the Loire confluence at Decize.</li>
</ul>

<h2>Boating the canal</h2>
<p>Pleasure boating on the Canal du Nivernais is an incomparable experience. Several bases hire self-drive houseboats (no licence required up to 15 km/h) by the week or weekend. The maximum speed of 8 km/h makes this a meditative, restorative form of travel.</p>

<h2>Canal villages</h2>
<ul>
  <li><strong>Clamecy</strong>: former capital of the timber floaters, medieval town with its collegiate church and half-timbered houses.</li>
  <li><strong>Corbigny</strong>: lively market town with abbey and services for cyclists and boaters.</li>
  <li><strong>Châtillon-en-Bazois</strong>: medieval castle accessible directly from the canal — one of the most photographed spots on the route.</li>
  <li><strong>Decize</strong>: peninsula town at the Loire confluence, with its medieval château overlooking the river.</li>
</ul>

<h2>Wildlife and flora</h2>
<p>The canal is a remarkable ecological corridor: <strong>kingfishers</strong> (easily spotted from a boat or silent bike), <strong>grey herons</strong>, <strong>otters</strong> (present but shy), and <strong>beavers</strong> in the northern section. In May–June, water crowfoot covers the canal surface in striking white and yellow carpets.</p>

<h2>Practical information</h2>
<ul>
  <li><strong>Best period:</strong> May–October for boating, April–October for cycling.</li>
  <li><strong>Boat hire:</strong> Nicols, Crown Blue Line and Burgundy Cruisers have bases on the canal.</li>
  <li><strong>Locks:</strong> managed by VNF (French Waterways). In service March to November.</li>
</ul>`,

      nl: `<p>Het <strong>Canal du Nivernais</strong> is een van de onbekende pareltjes van het Franse waterwegennet. Gebouwd tussen 1784 en 1842 om Morvan-hout naar Parijs te vervoeren, verbindt dit 174 kilometer lange kanaal Auxerre met Decize, door prachtige Bourgondische landschappen. Vandaag geldt het als een van de mooiste kanalen van Frankrijk, een paradijs voor vaarders, fietsers en natuurliefhebbers.</p>

<h2>Een korte geschiedenis</h2>
<p>Het kanaal werd aangelegd om Morvan-hout — onmisbaar voor verwarming en bouw — naar de noordelijke steden, vooral Parijs, te transporteren. De houtvlotters, "galvachers" genaamd, begeleidden enorme vlotten boomstammen vanuit de Morvan-bossen naar de hoofdstad. De 110 sluizen van het kanaal maken het een van de steilste van Frankrijk — en vandaag een van de schilderachtigste voor pleziervaarders.</p>

<h2>Fietsen langs het jaagpad</h2>
<p>Het <strong>fietspad langs het Canal du Nivernais</strong> is een van de aangenaamste fietsroutes van Bourgondië. Het voormalige jaagpad, perfect aangelegd, volgt het kanaal over tientallen kilometers zonder autoverkeer, vlak, beschaduwd en rustgevend. Ideaal voor gezinnen en fietsers van alle niveaus.</p>
<p>Aanbevolen etappes:</p>
<ul>
  <li><strong>Corbigny — Châtillon-en-Bazois</strong> (35 km): authentieke dorpen, mooie sluizen en bocagelandschappen.</li>
  <li><strong>Clamecy — Chitry-les-Mines</strong> (25 km): door de Sardy-kloof en de bronnen van het kanaal in het noorden van de Nièvre.</li>
  <li><strong>Châtillon-en-Bazois — Decize</strong> (45 km): het zuidelijke eindstuk naar de samenvloeiing met de Loire.</li>
</ul>

<h2>Varen op het kanaal</h2>
<p>Pleziervaart op het Canal du Nivernais is een onvergelijkbare ervaring. Meerdere vaarbases verhuren woonboten (zonder vaarbewijs tot 15 km/u) per week of weekend. De maximumsnelheid van 8 km/u maakt dit een meditatieve, herstellende reisvorm.</p>

<h2>Kanaalsdorpen</h2>
<ul>
  <li><strong>Clamecy</strong>: voormalige hoofdstad van de houtvlotters, middeleeuws stadje met collegiale kerk en vakwerkhuizen.</li>
  <li><strong>Corbigny</strong>: levendig marktstadje met abdij en diensten voor fietsers en vaarders.</li>
  <li><strong>Châtillon-en-Bazois</strong>: middeleeuws kasteel bereikbaar direct vanuit het kanaal — een van de meest gefotografeerde plekken.</li>
  <li><strong>Decize</strong>: schiereilandstad aan de Loire-samenvloeiing, met een middeleeuws kasteel dat over de rivier uitkijkt.</li>
</ul>

<h2>Fauna en flora</h2>
<p>Het kanaal is een opmerkelijke ecologische corridor: <strong>ijsvogels</strong> (makkelijk te spotten vanuit een boot of stille fiets), <strong>blauwe reigers</strong>, <strong>otters</strong> (aanwezig maar schuw) en <strong>bevers</strong> in het noordelijke deel. In mei–juni bedekt waterranonkel het kanaloppervlak met opvallende witte en gele tapijten.</p>

<h2>Praktische informatie</h2>
<ul>
  <li><strong>Beste periode:</strong> mei–oktober voor varen, april–oktober voor fietsen.</li>
  <li><strong>Bootverhuur:</strong> Nicols, Crown Blue Line en Burgundy Cruisers hebben bases langs het kanaal.</li>
  <li><strong>Sluizen:</strong> beheerd door VNF (Franse Waterwegen). In dienst van maart tot november.</li>
</ul>`,
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'ete-nievre-morvan-activites',
    date: '2026-03-28',
    category: { fr: 'Été', en: 'Summer', nl: 'Zomer' },
    readTime: 6,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Lac_des_settons.jpg/1280px-Lac_des_settons.jpg',
    title: {
      fr: 'Nièvre et Morvan en été : le guide des activités estivales',
      en: 'Nièvre and Morvan in summer: the guide to summer activities',
      nl: 'Nièvre en Morvan in de zomer: de gids voor zomerse activiteiten',
    },
    excerpt: {
      fr: 'Baignades en lac, festivals en plein air, véloroutes ombragées, marchés nocturnes : l\'été transforme la Nièvre en terrain de jeu grandeur nature pour toute la famille.',
      en: 'Lake swimming, open-air festivals, shaded cycling routes, night markets: summer turns the Nièvre into a full-scale playground for the whole family.',
      nl: 'Zwemmen in meren, openluchtfestivals, beschaduwde fietsroutes, nachtmarkten: de zomer verandert de Nièvre in een speeltuin voor het hele gezin.',
    },
    content: {
      fr: `<p>L'été, la Nièvre et le Morvan se révèlent sous leur meilleur jour. Les températures clémentes (25–30°C en juillet-août, rarement caniculaires), les lacs aux eaux claires et les forêts ombragées font de cette région l'une des plus agréables de France pour des vacances estivales. Loin de la foule des grandes stations balnéaires, ici l'été rime avec authenticité, nature et fêtes de village.</p>

<h2>Les baignades : lacs et rivières</h2>
<p>La Nièvre et le Morvan comptent plus de 90 lacs et étangs, dont plusieurs sont aménagés pour la baignade :</p>
<ul>
  <li><strong>Lac des Settons</strong> (Montsauche-les-Settons) : le plus grand lac du Morvan (359 ha). Plage surveillée en juillet-août, location de pédalos, kayaks et stand-up paddle. Petits restaurants et glaciers sur les rives.</li>
  <li><strong>Lac de Chaumeçon</strong> (Brassy) : plus sauvage et moins fréquenté que les Settons. Accès libre, parking, baignade non surveillée mais dans un cadre naturel exceptionnel.</li>
  <li><strong>Lac de Saint-Agnan</strong> (Saint-Agnan) : ambiance paisible, très appréciée des familles. Aire de jeux, pique-nique, accès plage.</li>
  <li><strong>La Nièvre à Saint-Sulpice</strong> : pour une baignade en rivière plus intimiste, certains tronçons de la Nièvre et du Beuvron permettent des baignades naturelles dans des eaux claires et fraîches.</li>
</ul>

<h2>Les festivals d'été</h2>
<p>L'été transforme la Nièvre en scène à ciel ouvert. Plusieurs festivals de renom animent la région :</p>
<ul>
  <li><strong>Festival de la Cité du Mot (La Charité-sur-Loire)</strong> : grand festival littéraire autour de la parole, du débat et de la langue. Juillet.</li>
  <li><strong>Festival des Nuits de Saint-Brisson (Morvan)</strong> : spectacles son et lumière dans le cadre naturel du Parc Naturel Régional. Juillet-août.</li>
  <li><strong>Les Musicales en Morvan</strong> : concerts de musique classique dans des chapelles et prieurés romans du Morvan. Été.</li>
  <li><strong>Festival Blues sur Seine (Cosne-Cours-sur-Loire)</strong> : jazz et blues au bord de la Loire. Juillet.</li>
  <li><strong>Marchés nocturnes de Corbigny et Clamecy</strong> : tous les jeudis soirs en juillet-août. Producteurs locaux, artisanat, ambiance festive.</li>
</ul>

<h2>Véloroutes et VTT</h2>
<p>L'été est la saison reine pour explorer le Morvan à vélo. La <strong>Route des Grands Lacs du Morvan</strong> est un circuit balisé de 260 km autour des principaux lacs du Parc, avec des dénivelés raisonnables et des paysages spectaculaires. Pour les adeptes du VTT, le Parc Naturel du Morvan dispose de plusieurs spots réputés :</p>
<ul>
  <li><strong>VTT des Settons</strong> : une quarantaine de km de single tracks autour du lac, pour tous niveaux.</li>
  <li><strong>Pumtrack du Lac de Pannecière</strong> : circuits débutants et confirmés dans un cadre de pinèdes et de lacs.</li>
  <li><strong>Enduro du Morvan</strong> : compétition annuelle qui attire les meilleurs riders français en juillet.</li>
</ul>

<h2>Activités nautiques</h2>
<p>Au-delà de la baignade, les lacs du Morvan offrent une palette d'activités nautiques :</p>
<ul>
  <li><strong>Voile</strong> : le lac des Settons dispose d'un centre de voile avec cours pour enfants et adultes (Optimist, 420, catamarans).</li>
  <li><strong>Kayak et canoë</strong> : location disponible sur les Settons et le lac de Chaumeçon. Descentes de rivières organisées sur la Cure et l'Yonne.</li>
  <li><strong>Pêche</strong> : la Nièvre est un département de pêche réputé, avec la Nièvre, le Beuvron et l'Aron en 1ère catégorie (truites). Permis obligatoire.</li>
  <li><strong>Stand-up paddle</strong> : location aux Settons et à Pannecière.</li>
</ul>

<h2>Randonnées et nature</h2>
<p>En été, les sentiers du Morvan sont à leur sommet de beauté. Les forêts offrent un ombrage naturel appréciable même par les journées chaudes. Quelques randonnées particulièrement adaptées à l'été :</p>
<ul>
  <li>Le <strong>Chemin de la Pierre Écrite</strong> (circuit de 12 km depuis Moux-en-Morvan) — inscriptions gallo-romaines et panoramas.</li>
  <li>La <strong>Montagne Saint-Jean</strong> (circuit de 8 km) — point culminant du nord Morvan avec vue à 360°.</li>
  <li>Les <strong>sentiers du Haut-Folin</strong> (902 m) — point culminant du Morvan, paysages alpestres en miniature.</li>
</ul>

<h2>Gastronomie d'été</h2>
<p>L'été est aussi la saison des marchés en plein air et des tables d'hôtes. Quelques produits à ne pas manquer :</p>
<ul>
  <li>Les <strong>myrtilles du Morvan</strong> : ramassage possible en forêt dès début juillet. Tartes, confitures et liqueurs locales.</li>
  <li>Les <strong>grillades charolaises</strong> sur les marchés de producteurs : la race Charolais se prête idéalement aux grillades estivales.</li>
  <li>Le <strong>Pouilly-Fumé bien frais</strong> : le blanc ligérien de la rive d'en face, idéal pour les soirées estivales au bord de l'eau.</li>
</ul>

<h2>Infos pratiques été</h2>
<ul>
  <li><strong>Réservation hébergement :</strong> juillet-août se remplit tôt. Réservez au minimum 3 mois à l'avance pour les gîtes bien situés.</li>
  <li><strong>Météo :</strong> les étés en Nièvre sont généralement doux et peu caniculaires (25–30°C). Les soirées restent fraîches en Morvan (altitude).</li>
  <li><strong>Moustiques :</strong> les bords de lacs peuvent être un peu agaçants le soir. Prévoir répulsif.</li>
  <li><strong>Feux :</strong> interdits en forêt d'avril à octobre. Barbecues autorisés uniquement dans les hébergements équipés.</li>
</ul>`,

      en: `<p>In summer, the Nièvre and Morvan reveal their best side. Mild temperatures (25–30°C in July–August, rarely scorching), clear lakes and shaded forests make this one of France's most pleasant regions for a summer holiday. Far from the crowds of seaside resorts, summer here means authenticity, nature and village festivals.</p>

<h2>Swimming: lakes and rivers</h2>
<p>The Nièvre and Morvan have over 90 lakes and ponds, several with designated swimming areas:</p>
<ul>
  <li><strong>Lac des Settons</strong>: the Morvan's largest lake (359 ha). Supervised beach July–August, pedalo, kayak and paddle-board hire.</li>
  <li><strong>Lac de Chaumeçon</strong>: wilder and less crowded than Settons. Free access in a stunning natural setting.</li>
  <li><strong>Lac de Saint-Agnan</strong>: peaceful family atmosphere, play area, picnic, beach access.</li>
</ul>

<h2>Summer festivals</h2>
<ul>
  <li><strong>Festival de la Cité du Mot (La Charité-sur-Loire)</strong>: major literary festival of speech and language. July.</li>
  <li><strong>Nuits de Saint-Brisson (Morvan)</strong>: sound and light shows in the Regional Natural Park. July–August.</li>
  <li><strong>Festival Blues sur Seine (Cosne-sur-Loire)</strong>: jazz and blues by the Loire. July.</li>
  <li><strong>Night markets (Corbigny, Clamecy)</strong>: every Thursday evening in July–August. Local producers, crafts, festive atmosphere.</li>
</ul>

<h2>Cycling and mountain biking</h2>
<p>The <strong>Route des Grands Lacs du Morvan</strong> is a waymarked 260 km circuit around the Park's main lakes. For mountain bikers, the Morvan offers numerous tracks around Settons and Pannecière for all levels.</p>

<h2>Water sports</h2>
<ul>
  <li><strong>Sailing</strong>: Lac des Settons has a sailing centre with courses for children and adults.</li>
  <li><strong>Kayak and canoe</strong>: hire available at Settons and Chaumeçon. Organised river descents on the Cure and Yonne.</li>
  <li><strong>Fishing</strong>: the Nièvre is a renowned fishing department, with Category 1 rivers (trout) including the Nièvre, Beuvron and Aron. Permit required.</li>
</ul>

<h2>Summer gastronomy</h2>
<ul>
  <li><strong>Morvan bilberries</strong>: picking possible in the forest from early July. Tarts, jams and local liqueurs.</li>
  <li><strong>Charolais grills</strong> at producer markets: the Charolais breed is perfect for summer barbecues.</li>
  <li><strong>Well-chilled Pouilly-Fumé</strong>: the Loire white from across the river — perfect for summer evenings by the water.</li>
</ul>

<h2>Practical summer information</h2>
<ul>
  <li><strong>Accommodation booking:</strong> July–August fills up early. Book at least 3 months ahead for the best-located gîtes.</li>
  <li><strong>Weather:</strong> Nièvre summers are generally mild (25–30°C). Evenings stay cool in the Morvan at altitude.</li>
  <li><strong>Fires:</strong> forbidden in forests April–October. Barbecues only at equipped accommodation.</li>
</ul>`,

      nl: `<p>In de zomer laten de Nièvre en de Morvan hun beste kant zien. Milde temperaturen (25–30°C in juli–augustus, zelden zwoel), heldere meren en beschaduwde bossen maken dit een van de aangenaamste regio's van Frankrijk voor een zomervakantie. Ver van de drukte van de kustplaatsen staat de zomer hier voor authenticiteit, natuur en dorpsfeesten.</p>

<h2>Zwemmen: meren en rivieren</h2>
<p>De Nièvre en de Morvan tellen meer dan 90 meren en vijvers, waarvan verscheidene zijn ingericht voor zwemmen:</p>
<ul>
  <li><strong>Lac des Settons</strong>: het grootste meer van de Morvan (359 ha). Bewaakt strand juli–augustus, verhuur van waterfietsen, kajaks en stand-up paddles.</li>
  <li><strong>Lac de Chaumeçon</strong>: wilder en minder druk dan Settons. Vrije toegang in een schitterend natuurlijk kader.</li>
  <li><strong>Lac de Saint-Agnan</strong>: rustige gezinssfeer, speeltuin, picknick, strandtoegang.</li>
</ul>

<h2>Zomerfestivals</h2>
<ul>
  <li><strong>Festival de la Cité du Mot (La Charité-sur-Loire)</strong>: groot literair festival over taal en debat. Juli.</li>
  <li><strong>Nuits de Saint-Brisson (Morvan)</strong>: klanken- en lichtspektakels in het Regionaal Natuurpark. Juli–augustus.</li>
  <li><strong>Festival Blues sur Seine (Cosne-sur-Loire)</strong>: jazz en blues aan de Loire. Juli.</li>
  <li><strong>Nachtmarkten (Corbigny, Clamecy)</strong>: elke donderdagavond in juli–augustus. Lokale producenten, ambacht, feestelijke sfeer.</li>
</ul>

<h2>Fietsen en mountainbiken</h2>
<p>De <strong>Route des Grands Lacs du Morvan</strong> is een bewegwijzerde lus van 260 km rond de belangrijkste meren van het Park. Voor mountainbikers biedt de Morvan talrijke paden rond Settons en Pannecière voor alle niveaus.</p>

<h2>Watersport</h2>
<ul>
  <li><strong>Zeilen</strong>: Lac des Settons heeft een zeilcentrum met cursussen voor kinderen en volwassenen.</li>
  <li><strong>Kajak en kano</strong>: verhuur bij Settons en Chaumeçon. Georganiseerde riviertochten op de Cure en l'Yonne.</li>
  <li><strong>Vissen</strong>: de Nièvre is een bekend vissersgebied met categorie 1-rivieren (forel) zoals de Nièvre, Beuvron en Aron. Vergunning verplicht.</li>
</ul>

<h2>Zomergastronomie</h2>
<ul>
  <li><strong>Morvan-bosbessen</strong>: plukken mogelijk in het bos vanaf begin juli. Taarten, jam en lokale likeuren.</li>
  <li><strong>Charolais-grillades</strong> op producentenmarkten: het Charolais-ras is perfect voor zomerse barbecues.</li>
  <li><strong>Goed gekoelde Pouilly-Fumé</strong>: de Loire-witte wijn van de overkant — perfect voor zomeravonden bij het water.</li>
</ul>

<h2>Praktische zomerinformatie</h2>
<ul>
  <li><strong>Overnachting boeken:</strong> juli–augustus raakt vroeg vol. Boek minstens 3 maanden van tevoren voor de best gelegen gîtes.</li>
  <li><strong>Weer:</strong> de zomers in de Nièvre zijn over het algemeen mild (25–30°C). Avonden blijven koel in de Morvan op hoogte.</li>
  <li><strong>Vuur:</strong> verboden in bossen van april tot oktober. Barbecues alleen bij uitgeruste accommodaties.</li>
</ul>`,
    },
  },

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
