import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';

export function useActivities(categoryFilter = 'all') {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, 'morvan', 'data', 'activities');
    const q = categoryFilter === 'all'
      ? query(col, limit(2000))
      : query(col, where('category', '==', categoryFilter), limit(500));
    getDocs(q)
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
        console.error('[useActivities] fout:', err.code, err.message);
        setLoading(false);
      });
  }, [categoryFilter]);

  return { activities, loading };
}
