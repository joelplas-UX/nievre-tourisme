import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function useEvents(typeFilter = 'all') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = Timestamp.now();
    let q = query(
      collection(db, 'morvan', 'data', 'events'),
      where('date', '>=', now),
      orderBy('date', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (typeFilter !== 'all') {
        data = data.filter(e => e.type === typeFilter);
      }
      setEvents(data);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [typeFilter]);

  return { events, loading };
}
