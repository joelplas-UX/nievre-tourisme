import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useActivities(categoryFilter = 'all') {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'morvan', 'data', 'activities'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (categoryFilter !== 'all') {
        data = data.filter(a => a.category === categoryFilter);
      }
      setActivities(data);
      setLoading(false);
    }, (err) => {
      console.error('[useActivities] Firestore fout:', err);
      setLoading(false);
    });

    return unsub;
  }, [categoryFilter]);

  return { activities, loading };
}
