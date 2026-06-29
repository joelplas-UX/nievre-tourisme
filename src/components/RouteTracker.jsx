import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Stuurt een GA4 page_view bij elke route-wissel in de SPA.
 * Vuurt alleen als gtag daadwerkelijk geladen is (d.w.z. de bezoeker heeft
 * cookies geaccepteerd). De allereerste paginalaad wordt overgeslagen, want
 * die page_view wordt al door index.html / CookieBanner verstuurd.
 */
export default function RouteTracker() {
  const location = useLocation();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (typeof window.gtag !== 'function') return;
    if (localStorage.getItem('cookie_consent') !== 'all') return;

    const path = location.pathname + location.search;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
