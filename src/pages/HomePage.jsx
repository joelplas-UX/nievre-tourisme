import { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import EventCard from '../components/EventCard';
import ActivityCard from '../components/ActivityCard';
import MapSection from '../components/MapSection';
import AdBanner from '../components/AdBanner';
import { useEvents } from '../hooks/useEvents';
import { useActivities } from '../hooks/useActivities';

export default function HomePage({ lang, tr }) {
  const { events } = useEvents();
  const { activities } = useActivities();

  const featuredEvents = events.slice(0, 3);
  const featuredActivities = activities.slice(0, 4);

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
