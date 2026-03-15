import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useEvents(typeFilter = 'all') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'morvan', 'data', 'events'),
      orderBy('date', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(e => !e.hidden);

      if (typeFilter !== 'all') {
        data = data.filter(e => e.type === typeFilter);
      }

      setEvents(data);
      setLoading(false);
    }, (err) => {
      console.error('[useEvents] Firestore fout:', err);
      setLoading(false);
    });

    return unsub;
  }, [typeFilter]);

  return { events, loading };
}
