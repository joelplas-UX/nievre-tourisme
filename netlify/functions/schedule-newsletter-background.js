/**
 * Cron-trigger voor de wekelijkse nieuwsbrief — background function.
 * Schedule: elke donderdag 07:00 UTC (na scraping om 06:00)
 * Zie netlify.toml voor de schedule configuratie.
 *
 * De naam eindigt op "-background" → Netlify geeft direct 202 terug
 * en laat de functie maximaal 15 minuten doordraaien.
 */
import { handler as sendNewsletter } from './send-newsletter-background.js';

export const handler = async (event) => {
  const token = event?.headers?.['x-cron-token'] || event?.queryStringParameters?.token;
  const cronToken = process.env.CRON_SECRET_TOKEN;
  if (cronToken && token !== cronToken && event?.headers?.['x-admin-trigger'] !== '1') {
    return { statusCode: 401, body: 'Unauthorized' };
  }
  console.log('[schedule-newsletter-background] Wekelijkse nieuwsbrief gestart');
  try {
    await sendNewsletter({}, {});
  } catch (err) {
    console.error('[schedule-newsletter-background] Fout:', err.message);
  }
  return { statusCode: 202 };
};
