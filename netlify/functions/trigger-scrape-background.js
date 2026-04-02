/**
 * Netlify Background Function — triggered handmatig via admin panel
 *
 * De naam eindigt op "-background" → Netlify geeft direct 202 terug
 * en laat de functie maximaal 15 minuten doordraaien.
 *
 * Aangeroepen via: POST /.netlify/functions/trigger-scrape-background
 */
import { runScrape } from './_shared/scraper.js';

export const handler = async (event) => {
  // Sta aanroepen toe van admin panel (zonder token) OF via cron-job.org (met token)
  const token = event.headers?.['x-cron-token'] || event.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken) {
    // Geen token vereist als CRON_SECRET_TOKEN niet is ingesteld (backwards compat)
    const isAdmin = event.headers?.['x-admin-trigger'] === '1';
    if (!isAdmin) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
  }

  console.log('[trigger-scrape-background] Scraping gestart');
  const result = await runScrape();
  console.log('[trigger-scrape-background] Klaar:', result);
  return { statusCode: 200, body: JSON.stringify(result) };
};
