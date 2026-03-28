import { usePageTitle } from '../hooks/usePageTitle';

const CONTENT = {
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : 27 mars 2026',
    sections: [
      {
        h: '1. Responsable du traitement',
        p: `Ce site, <strong>Nièvre & Morvan</strong> (nievre-morvan.fr), est édité à titre personnel. Pour toute question relative à vos données personnelles, vous pouvez nous contacter via le <a href="/contact">formulaire de contact</a>.`,
      },
      {
        h: '2. Données collectées',
        p: `Nous collectons les données suivantes :<br><br>
<strong>Newsletter :</strong> lorsque vous vous inscrivez à notre newsletter, nous collectons votre adresse e-mail, votre code postal (optionnel) et votre préférence de langue. Ces données sont utilisées exclusivement pour l'envoi de la newsletter hebdomadaire.<br><br>
<strong>Formulaire de contact et propositions :</strong> les informations que vous saisissez dans nos formulaires (prénom, nom, email, description) sont utilisées pour traiter votre demande ou votre proposition d'événement/activité.<br><br>
<strong>Données de navigation :</strong> comme tout site web, notre serveur peut enregistrer automatiquement certaines informations techniques (adresse IP anonymisée, type de navigateur, pages visitées) à des fins statistiques.`,
      },
      {
        h: '3. Cookies',
        p: `Notre site utilise les cookies suivants :<br><br>
<strong>Cookies nécessaires :</strong> stockage de votre préférence de langue et de votre choix de consentement aux cookies. Ces cookies sont indispensables au fonctionnement du site et ne nécessitent pas votre consentement.<br><br>
<strong>Cookies publicitaires (Google AdSense) :</strong> avec votre consentement, Google peut déposer des cookies pour afficher des publicités personnalisées. Google utilise ces données conformément à sa <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">politique de confidentialité</a>.<br><br>
Vous pouvez modifier vos préférences à tout moment via le bouton "Gérer les cookies" en bas de page.`,
      },
      {
        h: '4. Base légale du traitement',
        p: `Le traitement de vos données repose sur :<br>
• <strong>Consentement</strong> : pour la newsletter (vous pouvez vous désabonner à tout moment) et les cookies publicitaires.<br>
• <strong>Intérêt légitime</strong> : pour les données statistiques de navigation anonymisées.`,
      },
      {
        h: '5. Durée de conservation',
        p: `Données newsletter : conservées jusqu'à votre désinscription.<br>
Données formulaires : conservées le temps du traitement de votre demande, maximum 12 mois.<br>
Données de navigation anonymisées : maximum 26 mois.`,
      },
      {
        h: '6. Partage des données',
        p: `Nous ne vendons pas vos données. Nous faisons appel aux services tiers suivants :<br>
• <strong>Firebase / Google</strong> (stockage des données) — <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">politique de confidentialité Google</a><br>
• <strong>Resend</strong> (envoi des e-mails) — données transmises uniquement pour l'envoi de la newsletter<br>
• <strong>Google AdSense</strong> (publicité) — avec votre consentement uniquement<br>
• <strong>Cloudinary</strong> (hébergement d'images) — images uploadées par l'administrateur uniquement`,
      },
      {
        h: '7. Vos droits (RGPD)',
        p: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :<br>
• <strong>Droit d'accès</strong> : obtenir une copie de vos données<br>
• <strong>Droit de rectification</strong> : corriger des données inexactes<br>
• <strong>Droit à l'effacement</strong> : demander la suppression de vos données<br>
• <strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré<br>
• <strong>Droit d'opposition</strong> : vous opposer au traitement de vos données<br><br>
Pour exercer ces droits, contactez-nous via le <a href="/contact">formulaire de contact</a>. Vous pouvez également introduire une réclamation auprès de la <strong>CNIL</strong> (cnil.fr).`,
      },
      {
        h: '8. Sécurité',
        p: `Vos données sont stockées sur des serveurs sécurisés Firebase (Google Cloud) avec des règles de sécurité Firestore strictes. Les communications sont chiffrées via HTTPS.`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 27 March 2026',
    sections: [
      { h: '1. Data controller', p: `This website, <strong>Nièvre & Morvan</strong> (nievre-morvan.fr), is operated privately. For any questions about your personal data, please contact us via the <a href="/contact">contact form</a>.` },
      { h: '2. Data collected', p: `<strong>Newsletter:</strong> when you subscribe, we collect your email address, optional postcode and language preference, used solely to send the weekly newsletter.<br><br><strong>Contact forms:</strong> information you enter in our forms is used to process your request or event/activity suggestion.<br><br><strong>Browsing data:</strong> our server may automatically record anonymised technical information (IP address, browser type, pages visited) for statistical purposes.` },
      { h: '3. Cookies', p: `<strong>Necessary cookies:</strong> storing your language preference and cookie consent choice — essential for the site to function.<br><br><strong>Advertising cookies (Google AdSense):</strong> with your consent, Google may place cookies to display personalised ads in accordance with its <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">privacy policy</a>.<br><br>You can update your preferences at any time via the "Manage cookies" button at the bottom of the page.` },
      { h: '4. Legal basis', p: `Data processing is based on:<br>• <strong>Consent</strong>: for the newsletter (unsubscribe at any time) and advertising cookies.<br>• <strong>Legitimate interest</strong>: for anonymised browsing statistics.` },
      { h: '5. Retention', p: `Newsletter data: retained until you unsubscribe.<br>Form data: retained for the duration of processing, maximum 12 months.<br>Anonymised browsing data: maximum 26 months.` },
      { h: '6. Data sharing', p: `We do not sell your data. We use the following third-party services:<br>• <strong>Firebase / Google</strong> (data storage)<br>• <strong>Resend</strong> (email delivery) — data transmitted solely for newsletter sending<br>• <strong>Google AdSense</strong> (advertising) — with your consent only` },
      { h: '7. Your rights (GDPR)', p: `Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, erase, port and object to the processing of your data. To exercise these rights, contact us via the <a href="/contact">contact form</a>.` },
      { h: '8. Security', p: `Your data is stored on secure Firebase (Google Cloud) servers with strict Firestore security rules. All communications are encrypted via HTTPS.` },
    ],
  },
  nl: {
    title: 'Privacybeleid',
    updated: 'Laatste update: 27 maart 2026',
    sections: [
      { h: '1. Verwerkingsverantwoordelijke', p: `Deze website, <strong>Nièvre & Morvan</strong> (nievre-morvan.fr), wordt privé beheerd. Voor vragen over je persoonsgegevens kun je contact opnemen via het <a href="/contact">contactformulier</a>.` },
      { h: '2. Verzamelde gegevens', p: `<strong>Nieuwsbrief:</strong> bij inschrijving verzamelen we je e-mailadres, optionele postcode en taalvoorkeur, uitsluitend gebruikt voor het verzenden van de wekelijkse nieuwsbrief.<br><br><strong>Contactformulieren:</strong> informatie die je invult in onze formulieren wordt gebruikt om je aanvraag te verwerken.<br><br><strong>Navigatiegegevens:</strong> onze server kan automatisch geanonimiseerde technische informatie vastleggen voor statistische doeleinden.` },
      { h: '3. Cookies', p: `<strong>Noodzakelijke cookies:</strong> opslag van je taalvoorkeur en cookiekeuze — noodzakelijk voor de werking van de site.<br><br><strong>Advertentiecookies (Google AdSense):</strong> met jouw toestemming kan Google cookies plaatsen voor gepersonaliseerde advertenties conform het <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">privacybeleid van Google</a>.<br><br>Je kunt je voorkeuren op elk moment wijzigen via de knop "Cookies beheren" onderaan de pagina.` },
      { h: '4. Rechtsgrondslag', p: `• <strong>Toestemming</strong>: voor de nieuwsbrief (afmelden altijd mogelijk) en advertentiecookies.<br>• <strong>Gerechtvaardigd belang</strong>: voor geanonimiseerde navigatiestatistieken.` },
      { h: '5. Bewaartermijn', p: `Nieuwsbriefgegevens: bewaard tot uitschrijving.<br>Formuliergegevens: bewaard voor de duur van verwerking, maximaal 12 maanden.<br>Geanonimiseerde navigatiegegevens: maximaal 26 maanden.` },
      { h: '6. Gegevensdeling', p: `We verkopen je gegevens niet. We gebruiken de volgende externe diensten:<br>• <strong>Firebase / Google</strong> (gegevensopslag)<br>• <strong>Resend</strong> (e-mailverzending)<br>• <strong>Google AdSense</strong> (reclame) — alleen met jouw toestemming` },
      { h: '7. Jouw rechten (AVG)', p: `Op grond van de Algemene Verordening Gegevensbescherming (AVG) heb je recht op inzage, rectificatie, verwijdering, overdraagbaarheid en bezwaar. Neem contact op via het <a href="/contact">contactformulier</a>.` },
      { h: '8. Beveiliging', p: `Je gegevens worden opgeslagen op beveiligde Firebase-servers (Google Cloud) met strikte Firestore-beveiligingsregels. Alle communicatie is versleuteld via HTTPS.` },
    ],
  },
};

export default function PrivacyPage({ lang, tr }) {
  usePageTitle(tr?.pageTitles?.privacy);
  const c = CONTENT[lang] || CONTENT.fr;
  return (
    <main className="page">
      <div className="page-header">
        <h1>{c.title}</h1>
        <p className="page-subtitle">{c.updated}</p>
      </div>
      <div className="legal-content section">
        {c.sections.map((s, i) => (
          <section key={i} className="legal-section">
            <h2>{s.h}</h2>
            <p dangerouslySetInnerHTML={{ __html: s.p }} />
          </section>
        ))}
      </div>
    </main>
  );
}
