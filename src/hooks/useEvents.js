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
      const now = new Date();
      let data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(e => !e.hidden)
        .filter(e => {
          const d = e.date?.toDate?.();
          return !d || d >= now; // toon alleen toekomstige events
        });

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
