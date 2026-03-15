/**
 * Netlify Background Function — triggered handmatig via admin panel
 *
 * De naam eindigt op "-background" → Netlify geeft direct 202 terug
 * en laat de functie maximaal 15 minuten doordraaien.
 *
 * Aangeroepen via: POST /.netlify/functions/trigger-scrape-background
 */
import { runScrape } from './_shared/scraper.js';

export const handler = async () => {
  console.log('[trigger-scrape-background] Handmatige scraping gestart');
  const result = await runScrape();
  console.log('[trigger-scrape-background] Klaar:', result);
  return { statusCode: 200 };
};
