import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getPost, getRelatedPosts } from '../data/posts';

const COPY = {
  fr: { back: '← Blog', related: 'Articles similaires', min: 'min de lecture', by: 'Rédaction Nièvre & Morvan' },
  en: { back: '← Blog', related: 'Related articles', min: 'min read', by: 'Nièvre & Morvan editorial' },
  nl: { back: '← Blog', related: 'Gerelateerde artikelen', min: 'min lezen', by: 'Nièvre & Morvan redactie' },
};

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  const locale = lang === 'nl' ? 'nl-NL' : lang === 'en' ? 'en-GB' : 'fr-FR';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPostPage({ lang }) {
  const { slug } = useParams();
  const post = getPost(slug);
  const c = COPY[lang] || COPY.fr;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const title   = post.title[lang]   || post.title.fr;
  const content = post.content[lang] || post.content.fr;
  const related = getRelatedPosts(slug, 3);

  return (
    <main className="page blog-post-page">

      {/* Hero */}
      {post.image && (
        <div className="blog-post-hero">
          <img src={post.image} alt={title} className="blog-post-hero-img" />
          <div className="blog-post-hero-overlay" />
        </div>
      )}

      <article className="blog-post-article">
        <div className="blog-post-header">
          <Link to="/blog" className="blog-back">{c.back}</Link>
          <div className="blog-post-meta">
            <span className="blog-cat">{post.category[lang] || post.category.fr}</span>
            <span className="blog-date">{formatDate(post.date, lang)}</span>
            <span className="blog-read">{post.readTime} {c.min}</span>
          </div>
          <h1 className="blog-post-title">{title}</h1>
          <p className="blog-post-by">{c.by}</p>
        </div>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>

      {/* Gerelateerde artikelen */}
      {related.length > 0 && (
        <section className="section blog-related">
          <h2 className="section-title">{c.related}</h2>
          <div className="blog-related-grid">
            {related.map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="blog-related-card">
                {p.image && <img src={p.image} alt={p.title[lang] || p.title.fr} className="blog-related-img" />}
                <div className="blog-related-body">
                  <span className="blog-cat">{p.category[lang] || p.category.fr}</span>
                  <h3>{p.title[lang] || p.title.fr}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
