import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(e => {
            if (e.hidden) return false;
            const relevant = e.endDate?.toDate?.() || e.date?.toDate?.();
            return relevant ? relevant >= now : true;
          });
        if (typeFilter !== 'all') {
          data = data.filter(e => e.type === typeFilter);
        }
        data.sort((a, b) => {
          const da = a.date?.toDate?.() ?? new Date(0);
          const db2 = b.date?.toDate?.() ?? new Date(0);
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
