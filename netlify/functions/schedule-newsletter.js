/**
 * Cron-trigger voor de wekelijkse nieuwsbrief.
 * Schedule: elke donderdag 07:00 UTC (na scraping om 06:00)
 * Zie netlify.toml voor de schedule configuratie.
 */
import { handler as sendNewsletter } from './send-newsletter-background.js';

export const handler = async () => {
  console.log('[schedule-newsletter] Wekelijkse nieuwsbrief gestart');
  await sendNewsletter();
  return { statusCode: 200 };
};
