/**
 * prerender.mjs
 * Genereert statische HTML-snapshots van de belangrijkste routes na `vite build`.
 * Vereist: puppeteer (devDependency)
 *
 * Gebruik:
 *   node scripts/prerender.mjs          — normaal
 *   SKIP_PRERENDER=1 node ...           — overslaan (b.v. in CI zonder Chrome)
 *
 * Output: dist/over/index.html, dist/region/index.html, etc.
 * Netlify serveert bestaande bestanden altijd vóór de SPA-redirect (/*→/index.html),
 * dus crawlers zien de prerendered HTML direct.
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { createReadStream, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PLACES } from '../src/data/places.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST      = join(__dirname, '..', 'dist');
const PORT      = 4175;

// Routes om te prerenderen — alleen pagina's met substantiële statische inhoud
const ROUTES = [
  '/',
  '/over',
  '/region',
  '/blog',
  '/activites',
  '/evenements',
  '/privacy',
  '/contact',
  '/plaatsen',
  ...PLACES.map(p => `/plaatsen/${p.slug}`),
];

// ── Minimale statische server ──────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

function serveStatic(distPath) {
  return createServer((req, res) => {
    const url  = req.url.split('?')[0];
    let   file = join(distPath, url === '/' ? 'index.html' : url);
    if (!extname(file)) file = join(distPath, 'index.html'); // SPA-fallback
    if (!existsSync(file)) file = join(distPath, 'index.html');

    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    createReadStream(file)
      .on('error', () => { res.writeHead(404); res.end(); })
      .pipe(res);
  });
}

// ── Hoofd ──────────────────────────────────────────────────────────────────
async function run() {
  if (process.env.SKIP_PRERENDER === '1') {
    console.log('[prerender] Overgeslagen (SKIP_PRERENDER=1)');
    return;
  }

  if (!existsSync(DIST)) {
    console.warn('[prerender] dist/ niet gevonden — sla over');
    return;
  }

  // Start statische server
  const server = serveStatic(DIST);
  await new Promise((resolve, reject) =>
    server.listen(PORT, resolve).on('error', reject)
  );
  console.log(`[prerender] Statische server op poort ${PORT}`);

  // Start Puppeteer
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
      ],
    });
  } catch (err) {
    console.warn('[prerender] Puppeteer kon niet starten:', err.message);
    console.warn('[prerender] Build gaat door zonder prerendering');
    server.close();
    return;
  }

  let ok = 0, fail = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();

      // Blokkeer externe verzoeken die niet nodig zijn voor rendering
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        // Sta fonts en media toe (nodig voor juiste render), blokkeer tracking
        if (['image', 'media', 'font', 'document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(type)) {
          req.continue();
        } else {
          req.abort();
        }
      });

      // networkidle2 = max 2 openstaande verbindingen (tolereert Firestore keep-alive)
      try {
        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle2',
          timeout:   20000,
        });
      } catch {
        // Timeout? Pagina is al geladen, wacht gewoon een moment extra
      }

      // Wacht extra voor React hydration + Firestore lazy loads
      await new Promise(r => setTimeout(r, 3000));

      const html = await page.content();

      // Schrijf naar dist/<route>/index.html
      const parts = route === '/' ? [] : route.split('/').filter(Boolean);
      const dir   = join(DIST, ...parts);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), html, 'utf8');

      console.log(`[prerender] ✅ ${route}`);
      ok++;
      await page.close();
    } catch (err) {
      console.warn(`[prerender] ⚠️  ${route}: ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  server.close();
  console.log(`[prerender] Klaar: ${ok} geslaagd, ${fail} mislukt`);
}

run().catch(err => {
  // Nooit de build laten falen door prerender-probleem
  console.error('[prerender] Onverwachte fout:', err.message);
  process.exit(0);
});
