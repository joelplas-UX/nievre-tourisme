import { useEffect } from 'react';

const BASE = 'Nièvre & Morvan';

/**
 * Stelt document.title in voor de huidige pagina.
 * @param {string} title  — paginatitel (zonder "— Nièvre & Morvan")
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE;
    return () => { document.title = BASE; };
  }, [title]);
}
