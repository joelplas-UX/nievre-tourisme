import { Link } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { usePageTitle } from '../hooks/usePageTitle';

const COPY = {
  fr: {
    title: 'Blog — Nièvre & Morvan',
    subtitle: 'Idées de séjours, randonnées, gastronomie et coups de cœur dans la Nièvre et le Morvan.',
    read: 'Lire l\'article',
    min: 'min de lecture',
    loading: 'Chargement…',
  },
  en: {
    title: 'Blog — Nièvre & Morvan',
    subtitle: 'Stay ideas, hiking, gastronomy and hidden gems in the Nièvre and Morvan.',
    read: 'Read article',
    min: 'min read',
    loading: 'Loading…',
  },
  nl: {
    title: 'Blog — Nièvre & Morvan',
    subtitle: 'Verblijfsideeën, wandelingen, gastronomie en verborgen parels in de Nièvre en Morvan.',
    read: 'Artikel lezen',
    min: 'min lezen',
    loading: 'Laden…',
  },
};

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  const locale = lang === 'nl' ? 'nl-NL' : lang === 'en' ? 'en-GB' : 'fr-FR';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPage({ lang }) {
  usePageTitle(tr?.pageTitles?.blog);
  const c = COPY[lang] || COPY.fr;
  const { posts, loading } = useBlogPosts({ publishedOnly: true });

  return (
    <main className="page">
      <div className="page-header">
        <h1>{c.title}</h1>
        <p className="page-subtitle">{c.subtitle}</p>
      </div>

      {loading ? (
        <p className="section" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{c.loading}</p>
      ) : (
        <div className="blog-grid section">
          {posts.map(post => (
            <article key={post.slug} className="blog-card">
              {post.image && (
                <Link to={`/blog/${post.slug}`} className="blog-card-img-wrap">
                  <img
                    src={post.image}
                    alt={post.title[lang] || post.title.fr}
                    className="blog-card-img"
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </Link>
              )}
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="blog-cat">{post.category[lang] || post.category.fr}</span>
                  <span className="blog-date">{formatDate(post.date, lang)}</span>
                  <span className="blog-read">{post.readTime} {c.min}</span>
                </div>
                <h2 className="blog-card-title">
                  <Link to={`/blog/${post.slug}`}>{post.title[lang] || post.title.fr}</Link>
                </h2>
                <p className="blog-card-excerpt">{post.excerpt[lang] || post.excerpt.fr}</p>
                <Link to={`/blog/${post.slug}`} className="blog-read-more">{c.read} →</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
