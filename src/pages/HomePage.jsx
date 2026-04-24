import { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import EventCard from '../components/EventCard';
import ActivityCard from '../components/ActivityCard';
import MapSection from '../components/MapSection';
import AdBanner from '../components/AdBanner';
import { useEvents } from '../hooks/useEvents';
import { useActivities } from '../hooks/useActivities';
import { useSEO, useJsonLd, BASE_URL } from '../hooks/useSEO';

export default function HomePage({ lang, tr }) {
  useSEO({ title: tr?.pageTitles?.home, description: tr?.seoDesc?.home, path: '/', lang });

  useJsonLd([
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: 'Nièvre & Morvan',
      url: BASE_URL,
      description: 'Région touristique au cœur de la Bourgogne, comprenant la Nièvre et le Parc Naturel Régional du Morvan.',
      touristType: ['Famille', 'Randonneurs', 'Cyclistes', 'Amoureux de la nature'],
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 47.1,
        longitude: 3.9,
      },
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Bourgogne-Franche-Comté',
        url: 'https://www.bourgognefranchecomte.fr',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Nièvre & Morvan',
      url: BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/activites?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]);
  const { events } = useEvents();
  const { activities } = useActivities();

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const featuredEvents = [...events]
    .sort((a, b) => {
      const startA = a.date?.toDate?.();
      const startB = b.date?.toDate?.();
      const endA   = a.endDate?.toDate?.() || startA;
      const endB   = b.endDate?.toDate?.() || startB;
      // Meerdaags lopend (al begonnen, nog niet afgelopen) → naar achter
      const ongoingA = startA && startA < now && endA >= now;
      const ongoingB = startB && startB < now && endB >= now;
      if (ongoingA && !ongoingB) return 1;
      if (ongoingB && !ongoingA) return -1;
      // Geen datum → helemaal achteraan
      if (!startA && !startB) return 0;
      if (!startA) return 1;
      if (!startB) return -1;
      return startA - startB;
    })
    .slice(0, 3);

  // Activiteiten: filter overnachting/hebergement eruit voor homepage
  const EXCLUDE_CATS = new Set(['overnachting', 'hebergement', 'restaurant', 'eten']);
  const EXCLUDE_WORDS = ['gîte', 'gite', 'camping', 'piscine', 'bowling', 'hébergement', 'hôtel', 'hotel'];
  const filteredActivities = activities
    .filter(a => !EXCLUDE_CATS.has(a.category))
    .filter(a => {
      const title = (a.title?.fr || a.title?.nl || a.title?.en || '').toLowerCase();
      return !EXCLUDE_WORDS.some(w => title.includes(w));
    });
  const featuredActivities = filteredActivities.slice(0, 4);

  return (
    <main>
      <Hero tr={tr} />

      {/* Ad: Leaderboard below hero — highest visibility */}
      <div className="ad-section">
        <AdBanner type="leaderboard" adSlot={import.meta.env.VITE_AD_SLOT_LEADERBOARD} />
      </div>

      {/* Upcoming events */}
      <section className="section">
        <div className="section-header">
          <h2>{tr.events.title}</h2>
          <p>{tr.events.subtitle}</p>
        </div>
        <div className="cards-grid">
          {featuredEvents.map(e => (
            <EventCard key={e.id} event={e} lang={lang} tr={tr} />
          ))}
        </div>
        {featuredEvents.length === 0 && <p className="empty">{tr.events.noEvents}</p>}
        <div className="section-cta">
          <Link to="/evenements" className="btn btn-outline">
            {tr.nav.events} →
          </Link>
        </div>
      </section>

      {/* Ad: In-feed between events and activities */}
      <div className="ad-section ad-center">
        <AdBanner type="infeed" adSlot={import.meta.env.VITE_AD_SLOT_INFEED} />
      </div>

      {/* Activities */}
      <section className="section section-alt">
        <div className="section-header">
          <h2>{tr.activities.title}</h2>
          <p>{tr.activities.subtitle}</p>
        </div>
        <div className="cards-grid cards-grid-4">
          {featuredActivities.map(a => (
            <ActivityCard key={a.id} activity={a} lang={lang} tr={tr} />
          ))}
        </div>
        {featuredActivities.length === 0 && <p className="empty">{tr.activities.noActivities}</p>}
        <div className="section-cta">
          <Link to="/activites" className="btn btn-outline">
            {tr.nav.activities} →
          </Link>
        </div>
      </section>

      {/* Map */}
      <MapSection events={events} activities={activities} lang={lang} tr={tr} />

      {/* Ad: Multiplex native ad — good RPM before footer */}
      <div className="ad-section">
        <AdBanner type="multiplex" adSlot={import.meta.env.VITE_AD_SLOT_MULTIPLEX} />
      </div>
    </main>
  );
}
