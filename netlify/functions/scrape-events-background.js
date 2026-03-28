/**
 * Netlify Scheduled Background Function — elke donderdag 06:00 UTC
 *
 * De naam eindigt op "-background" → Netlify geeft direct 202 terug
 * en laat de functie maximaal 15 minuten doordraaien.
 * Zo time-out de cron niet meer na 10 seconden.
 *
 * Logica staat in _shared/scraper.js
 */
import { runScrape } from './_shared/scraper.js';

export const handler = async () => {
  console.log('[scrape-events-background] Wekelijkse scraping gestart');
  try {
    const result = await runScrape();
    console.log('[scrape-events-background] Klaar:', result);
  } catch (err) {
    console.error('[scrape-events-background] Fout:', err.message);
  }
  return { statusCode: 202 };
};
