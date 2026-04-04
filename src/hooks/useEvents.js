import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Normaliseer scraper-typen (Frans/Engels) naar NL-typen die de UI verwacht
const TYPE_MAP = {
  concert: 'muziek', musique: 'muziek', music: 'muziek',
  spectacle: 'cultuur', theatre: 'cultuur', théâtre: 'cultuur',
  exposition: 'cultuur', culture: 'cultuur', cultural: 'cultuur',
  'marché': 'markt', marche: 'markt', foire: 'markt', brocante: 'markt',
  'vide-grenier': 'markt', market: 'markt',
  festival: 'festival',
  sport: 'sport', sportif: 'sport',
  balade: 'natuur', rando: 'natuur', 'randonnée': 'natuur', nature: 'natuur',
  autre: 'overig', other: 'overig', overig: 'overig',
};
const VALID_TYPES = new Set(['festival','muziek','markt','sport','natuur','cultuur','overig']);

function normalizeType(type) {
  if (!type) return 'overig';
  const t = type.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (VALID_TYPES.has(t)) return t;
  return TYPE_MAP[t] || 'overig';
}

export function useEvents(typeFilter = 'all') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    );

    Promise.race([
      getDocs(collection(db, 'morvan', 'data', 'events')),
      timeout,
    ])
      .then(snap => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const FAR_FUTURE = new Date(8640000000000000);
        let data = snap.docs.map(d => {
          const raw = d.data();
          return { id: d.id, ...raw, type: normalizeType(raw.type) };
        })
          .filter(e => {
            if (e.hidden) return false;
            const relevant = e.endDate?.toDate?.() || e.date?.toDate?.();
            return relevant ? relevant >= now : true;
          });
        if (typeFilter !== 'all') {
          data = data.filter(e => e.type === typeFilter);
        }
        // Null-datum events naar het einde, rest chronologisch
        data.sort((a, b) => {
          const da = a.date?.toDate?.() ?? FAR_FUTURE;
          const db2 = b.date?.toDate?.() ?? FAR_FUTURE;
          return da - db2;
        });
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[useEvents] fout:', err.code || err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [typeFilter]);

  return { events, loading, error };
}
