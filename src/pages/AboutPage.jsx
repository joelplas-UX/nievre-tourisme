import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const CONTENT = {
  fr: {
    title: 'À propos de Nièvre & Morvan',
    subtitle: 'Un guide indépendant pour découvrir la Nièvre et le Morvan autrement.',
    sections: [
      {
        h: 'Notre mission',
        p: `Nièvre & Morvan est un guide touristique indépendant consacré à la découverte de la Nièvre et du Parc Naturel Régional du Morvan. Notre objectif est simple : vous aider à trouver les meilleurs événements, randonnées, activités et bons plans dans cette région trop souvent méconnue, nichée au cœur de la Bourgogne.`,
      },
      {
        h: 'Ce que vous trouverez ici',
        p: `<strong>Événements :</strong> concerts, festivals, marchés, spectacles et animations de la région, mis à jour automatiquement chaque semaine.<br><br>
<strong>Activités :</strong> randonnées balisées, sites de baignade, châteaux, restaurants et hébergements — des centaines de suggestions pour tous les goûts et tous les âges.<br><br>
<strong>Blog :</strong> articles de fond sur la gastronomie, la nature, les traditions et les coups de cœur de la région.<br><br>
<strong>Newsletter :</strong> chaque jeudi, recevez les meilleures idées de la semaine directement dans votre boîte mail.`,
      },
      {
        h: 'La Nièvre & le Morvan, une région à (re)découvrir',
        p: `La Nièvre est l'un des départements les moins densément peuplés de France, et c'est précisément ce qui en fait son charme. Pas de béton, pas de foules, mais des forêts à perte de vue, des lacs aux eaux cristallines, des villages médiévaux endormis et une gastronomie de terroir authentique.<br><br>
Le <strong>Parc Naturel Régional du Morvan</strong>, qui couvre plus de 300 000 hectares, est le poumon vert de la Bourgogne. On y trouve certains des plus beaux sentiers de randonnée de France centrale, des cascades isolées, des tourbières préservées et une biodiversité remarquable.<br><br>
De <strong>Nevers</strong> sur la Loire à <strong>Vézelay</strong> et sa basilique romane classée UNESCO, en passant par <strong>Château-Chinon</strong>, la région regorge de sites historiques et culturels qui n'ont rien à envier aux destinations touristiques plus connues.`,
      },
      {
        h: 'Notre approche éditoriale',
        p: `Les informations sur ce site proviennent de sources officielles (DataTourisme, OpenStreetMap, Visorando) et sont complétées par une veille manuelle régulière. Les articles du blog sont rédigés par notre équipe éditoriale avec un regard personnel sur la région.<br><br>
Nous ne sommes affiliés à aucun office de tourisme ni à aucune organisation commerciale. Notre seule boussole est la qualité de l'information que nous vous proposons.`,
      },
      {
        h: 'Contribuer',
        p: `Vous connaissez un événement, une randonnée ou une activité qui devrait figurer sur notre site ? Utilisez notre <a href="/proposer">formulaire de proposition</a>. Nous examinons chaque suggestion avec attention.`,
      },
    ],
    cta: { label: 'Voir les événements →', to: '/evenements' },
    cta2: { label: 'Découvrir les activités →', to: '/activites' },
  },
  en: {
    title: 'About Nièvre & Morvan',
    subtitle: 'An independent guide to discovering the Nièvre and Morvan differently.',
    sections: [
      { h: 'Our mission', p: `Nièvre & Morvan is an independent tourist guide devoted to the Nièvre and the Morvan Regional Natural Park. Our aim is simple: to help you find the best events, hikes, activities and hidden gems in this often-overlooked region at the heart of Burgundy.` },
      { h: 'What you\'ll find here', p: `<strong>Events:</strong> concerts, festivals, markets and local events, updated automatically every week.<br><br><strong>Activities:</strong> marked hiking trails, swimming spots, châteaux, restaurants and accommodation — hundreds of suggestions for all tastes and ages.<br><br><strong>Blog:</strong> in-depth articles on gastronomy, nature, traditions and regional highlights.<br><br><strong>Newsletter:</strong> every Thursday, receive the week's best ideas directly in your inbox.` },
      { h: 'The Nièvre & Morvan: a region to (re)discover', p: `The Nièvre is one of the least densely populated departments in France, and that's precisely its charm. No crowds, no concrete, but forests stretching as far as the eye can see, crystal-clear lakes, sleepy medieval villages and authentic local gastronomy.<br><br>The <strong>Morvan Regional Natural Park</strong>, covering over 300,000 hectares, is Burgundy's green lung. It contains some of the finest walking trails in central France, isolated waterfalls, preserved peat bogs and remarkable biodiversity.<br><br>From <strong>Nevers</strong> on the Loire to <strong>Vézelay</strong> and its UNESCO-listed Romanesque basilica, the region is rich in historical and cultural sites.` },
      { h: 'Our editorial approach', p: `Information on this site comes from official sources (DataTourisme, OpenStreetMap, Visorando) and is supplemented by regular manual monitoring. Blog articles are written by our editorial team with a personal perspective on the region.<br><br>We are not affiliated with any tourist board or commercial organisation.` },
      { h: 'Contribute', p: `Do you know an event, walk or activity that should be on our site? Use our <a href="/proposer">suggestion form</a>. We review every suggestion carefully.` },
    ],
    cta: { label: 'See events →', to: '/evenements' },
    cta2: { label: 'Discover activities →', to: '/activites' },
  },
  nl: {
    title: 'Over Nièvre & Morvan',
    subtitle: 'Een onafhankelijke gids om de Nièvre en Morvan op een andere manier te ontdekken.',
    sections: [
      { h: 'Onze missie', p: `Nièvre & Morvan is een onafhankelijke toeristische gids gewijd aan de Nièvre en het Regionaal Natuurpark Morvan. Ons doel is eenvoudig: jou helpen de beste evenementen, wandelingen, activiteiten en verborgen parels te vinden in deze te weinig bekende regio in het hart van Bourgondië.` },
      { h: 'Wat je hier vindt', p: `<strong>Evenementen:</strong> concerten, festivals, markten en lokale activiteiten, elke week automatisch bijgewerkt.<br><br><strong>Activiteiten:</strong> bewegwijzerde wandelroutes, zwemplekken, kastelen, restaurants en overnachtingen — honderden suggesties voor alle smaken en leeftijden.<br><br><strong>Blog:</strong> diepgaande artikelen over gastronomie, natuur, tradities en regionale hoogtepunten.<br><br><strong>Nieuwsbrief:</strong> elke donderdag de beste ideeën van de week rechtstreeks in je mailbox.` },
      { h: 'De Nièvre & Morvan: een regio om (opnieuw) te ontdekken', p: `De Nièvre is een van de minst bevolkte departementen van Frankrijk, en dat is precies de charme. Geen drukte, geen beton, maar bossen zo ver het oog reikt, kristalheldere meren, slapende middeleeuwse dorpjes en een authentieke streekgastronomie.<br><br>Het <strong>Regionaal Natuurpark Morvan</strong>, met meer dan 300.000 hectare, is de groene long van Bourgondië. Het bevat enkele van de mooiste wandelpaden van centraal Frankrijk, afgelegen watervallen en een opmerkelijke biodiversiteit.` },
      { h: 'Onze redactionele aanpak', p: `Informatie op deze site komt van officiële bronnen (DataTourisme, OpenStreetMap, Visorando) en wordt aangevuld door regelmatige handmatige monitoring. Blogartikelen worden geschreven door onze redactie met een persoonlijk kijk op de regio.<br><br>We zijn niet gelieerd aan enig toerismebureau of commerciële organisatie.` },
      { h: 'Bijdragen', p: `Ken je een evenement, wandeling of activiteit die op onze site zou moeten staan? Gebruik ons <a href="/proposer">suggestieformulier</a>. We bekijken elke suggestie zorgvuldig.` },
    ],
    cta: { label: 'Evenementen bekijken →', to: '/evenements' },
    cta2: { label: 'Activiteiten ontdekken →', to: '/activites' },
  },
};

export default function AboutPage({ lang }) {
  usePageTitle(tr?.pageTitles?.about);
  const c = CONTENT[lang] || CONTENT.fr;
  return (
    <main className="page">
      <div className="page-header">
        <h1>{c.title}</h1>
        <p className="page-subtitle">{c.subtitle}</p>
      </div>

      <div className="section legal-content">
        {c.sections.map((s, i) => (
          <section key={i} className="legal-section">
            <h2>{s.h}</h2>
            <p dangerouslySetInnerHTML={{ __html: s.p }} />
          </section>
        ))}

        <div className="about-cta-row">
          <Link to={c.cta.to} className="btn btn-primary">{c.cta.label}</Link>
          <Link to={c.cta2.to} className="btn btn-outline">{c.cta2.label}</Link>
        </div>
      </div>
    </main>
  );
}
