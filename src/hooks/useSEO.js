/**
 * useSEO — stelt per pagina in:
 *  - document.title
 *  - <meta name="description">
 *  - <link rel="canonical">
 *  - Open Graph: og:site_name, og:type, og:title, og:description, og:url, og:image, og:locale
 *  - Twitter Card: twitter:card, twitter:title, twitter:description, twitter:image
 *  - hreflang: fr, en, nl, x-default (zelfde URL, geen taalprefix in pad)
 *
 * useJsonLd — injecteert een of meerdere JSON-LD schema's in <head>
 */

import { useEffect } from 'react';

const BASE_TITLE   = 'Nièvre & Morvan';
const SITE_NAME    = 'Nièvre & Morvan';
export const BASE_URL = 'https://nievremorvan.com';
export const DEFAULT_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ouroux-en-Morvan._Paysage_typique.JPG/1280px-Ouroux-en-Morvan._Paysage_typique.JPG';

const OG_LOCALES = { fr: 'fr_FR', en: 'en_GB', nl: 'nl_NL' };

// ── DOM helpers ─────────────────────────────────────────────────
function setMeta(selector, value, attrName = 'content') {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (selector.includes('property=')) {
      el.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
    } else if (selector.includes('name=')) {
      el.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attrName, value);
}

function setLink(rel, hreflang, href) {
  const selector = hreflang
    ? `link[rel="alternate"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// ── Hoofd hook ──────────────────────────────────────────────────
export function useSEO({ title, description, path = '/', image, lang = 'fr', type = 'website' } = {}) {
  useEffect(() => {
    const fullTitle    = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    const canonicalUrl = `${BASE_URL}${path}`;
    const imgUrl       = image || DEFAULT_IMAGE;
    const ogLocale     = OG_LOCALES[lang] || 'fr_FR';

    // Title
    document.title = fullTitle;

    // Meta description
    setMeta('meta[name="description"]', description);

    // Canonical
    setLink('canonical', null, canonicalUrl);

    // Open Graph
    setMeta('meta[property="og:site_name"]',   SITE_NAME);
    setMeta('meta[property="og:type"]',        type);
    setMeta('meta[property="og:title"]',       fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]',         canonicalUrl);
    setMeta('meta[property="og:image"]',       imgUrl);
    setMeta('meta[property="og:locale"]',      ogLocale);

    // Twitter Card
    setMeta('meta[name="twitter:card"]',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       fullTitle);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]',       imgUrl);

    // hreflang — dezelfde URL voor alle talen (taalwisseling via state, niet URL)
    ['fr', 'en', 'nl', 'x-default'].forEach(l => setLink('alternate', l, canonicalUrl));

    // Cleanup: herstel title bij unmount
    return () => { document.title = BASE_TITLE; };
  }, [title, description, path, image, lang, type]);
}

// ── JSON-LD hook ─────────────────────────────────────────────────
/**
 * Injecteert één of meerdere Schema.org JSON-LD blokken in <head>.
 * Verwijdert ze automatisch bij unmount of bij wijziging.
 *
 * @param {object|object[]|null} schemas
 */
export function useJsonLd(schemas) {
  useEffect(() => {
    if (!schemas) return;
    const list = Array.isArray(schemas) ? schemas : [schemas];
    if (list.length === 0) return;

    const scripts = list.map(schema => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-jsonld', 'true');
      el.textContent = JSON.stringify(schema);
      document.head.appendChild(el);
      return el;
    });

    return () => scripts.forEach(el => el.remove());
  // JSON.stringify zorgt voor stabiele dependency zonder object-referentie-probleem
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(schemas)]);
}
