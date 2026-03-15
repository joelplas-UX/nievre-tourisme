/**
 * Netlify Scheduled Function — elke maandag 06:00 UTC
 * Logica staat in _shared/scraper.js
 */
import { runScrape } from './_shared/scraper.js';

export const handler = async () => {
  console.log('[scrape-events] Wekelijkse scraping gestart');
  await runScrape();
  return { statusCode: 200 };
};
