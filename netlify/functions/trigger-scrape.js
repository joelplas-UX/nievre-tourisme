/**
 * HTTP Netlify Function — allows admin to manually trigger scraping
 * Called from the admin panel via POST /.netlify/functions/trigger-scrape
 */

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Trigger the background function by invoking it asynchronously
  // In production, the scraper runs as a background function on a schedule.
  // For manual triggers, we start it here and return immediately.
  try {
    // Dynamically import to share code without circular deps
    const { handler: scrapeHandler } = await import('./scrape-events.js');
    // Run in background (don't await — return 202 immediately)
    scrapeHandler().catch(err => console.error('Background scrape error:', err));

    return {
      statusCode: 202,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Scraping gestart op de achtergrond. Resultaten verschijnen over ~2-5 minuten.' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Fout: ' + err.message }),
    };
  }
};
