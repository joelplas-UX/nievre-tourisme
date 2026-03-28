/**
 * Hook die blogposts ophaalt uit Firestore én de statische posts.js.
 * Firestore-posts hebben voorrang bij gelijke slug.
 * Gepubliceerde Firestore-posts en alle statische posts worden samengevoegd,
 * gesorteerd op datum (nieuwste eerst).
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { POSTS as STATIC_POSTS, getPost as getStaticPost } from '../data/posts';

export function useBlogPosts({ publishedOnly = true } = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let firestorePosts = [];

      try {
        const q = publishedOnly
          ? query(
              collection(db, 'morvan', 'data', 'blog_posts'),
              where('published', '==', true),
              orderBy('date', 'desc')
            )
          : query(
              collection(db, 'morvan', 'data', 'blog_posts'),
              orderBy('date', 'desc')
            );
        const snap = await getDocs(q);
        firestorePosts = snap.docs.map(d => ({ id: d.id, _source: 'firestore', ...d.data() }));
      } catch {
        // Firestore niet beschikbaar of collectie bestaat nog niet — geen probleem
      }

      // Statische posts die geen Firestore-tegenhanger hebben
      const firestoreSlugs = new Set(firestorePosts.map(p => p.slug));
      const staticFallback = STATIC_POSTS.filter(p => !firestoreSlugs.has(p.slug))
        .map(p => ({ ...p, _source: 'static', published: true }));

      // Samenvoeging en sortering
      const all = [...firestorePosts, ...staticFallback].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setPosts(all);
      setLoading(false);
    }

    load();
  }, [publishedOnly]);

  return { posts, loading };
}

export async function getBlogPost(slug) {
  // Probeer eerst Firestore
  try {
    const snap = await getDocs(
      query(
        collection(db, 'morvan', 'data', 'blog_posts'),
        where('slug', '==', slug)
      )
    );
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, _source: 'firestore', ...d.data() };
    }
  } catch { /* val terug op statisch */ }

  // Statisch
  const p = getStaticPost(slug);
  return p ? { ...p, _source: 'static', published: true } : null;
}
