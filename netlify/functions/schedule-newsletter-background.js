/**
 * Cron-trigger voor de wekelijkse nieuwsbrief — background function.
 * Schedule: elke donderdag 07:00 UTC (na scraping om 06:00)
 * Zie netlify.toml voor de schedule configuratie.
 *
 * De naam eindigt op "-background" → Netlify geeft direct 202 terug
 * en laat de functie maximaal 15 minuten doordraaien.
 */
import { handler as sendNewsletter } from './send-newsletter-background.js';

export const handler = async () => {
  console.log('[schedule-newsletter-background] Wekelijkse nieuwsbrief gestart');
  try {
    await sendNewsletter({}, {});
  } catch (err) {
    console.error('[schedule-newsletter-background] Fout:', err.message);
  }
  return { statusCode: 202 };
};
