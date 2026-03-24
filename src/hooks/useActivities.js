import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';

export function useActivities(categoryFilter = 'all') {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const col = collection(db, 'morvan', 'data', 'activities');
    const q = categoryFilter === 'all'
      ? query(col, limit(500))
      : query(col, where('category', '==', categoryFilter), limit(500));

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 12000)
    );

    Promise.race([getDocs(q), timeout])
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const ta = a.title?.fr || a.title?.nl || '';
          const tb = b.title?.fr || b.title?.nl || '';
          return ta.localeCompare(tb, 'fr');
        });
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[useActivities] fout:', err.code || err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [categoryFilter]);

  return { activities, loading, error };
}
