import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function useEvents(typeFilter = 'all') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'morvan', 'data', 'events'))
      .then(snap => {
        console.log('[useEvents] docs geladen:', snap.size);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(e => {
            if (e.hidden) return false;
            const relevant = e.endDate?.toDate?.() || e.date?.toDate?.();
            return relevant ? relevant >= now : true;
          });
        if (typeFilter !== 'all') {
          data = data.filter(e => e.type === typeFilter);
        }
        // Sorteer client-side op datum
        data.sort((a, b) => {
          const da = a.date?.toDate?.() ?? new Date(0);
          const db2 = b.date?.toDate?.() ?? new Date(0);
          return da - db2;
        });
        console.log('[useEvents] eerste event:', data[0]);
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[useEvents] fout:', err.code, err.message);
        setLoading(false);
      });
  }, [typeFilter]);

  return { events, loading };
}
