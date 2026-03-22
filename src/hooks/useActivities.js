import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function useActivities(categoryFilter = 'all') {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'morvan', 'data', 'activities'))
      .then(snap => {
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (categoryFilter !== 'all') {
          data = data.filter(a => a.category === categoryFilter);
        }
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
