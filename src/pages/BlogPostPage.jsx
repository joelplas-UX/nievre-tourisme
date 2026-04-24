import { useParams, Link, Navigate } from 'react-router-dom';
import { useSEO, useJsonLd, BASE_URL, DEFAULT_IMAGE } from '../hooks/useSEO';
import { useState, useEffect } from 'react';
import { getBlogPost } from '../hooks/useBlogPosts';
import { useBlogPosts } from '../hooks/useBlogPosts';

const COPY = {
  fr: { back: '← Blog', related: 'Articles similaires', min: 'min de lecture', by: 'Par Noah', loading: 'Chargement…' },
  en: { back: '← Blog', related: 'Related articles', min: 'min read', by: 'By Noah', loading: 'Loading…' },
  nl: { back: '← Blog', related: 'Gerelateerde artikelen', min: 'min lezen', by: 'Door Noah', loading: 'Laden…' },
};

function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  const locale = lang === 'nl' ? 'nl-NL' : lang === 'en' ? 'en-GB' : 'fr-FR';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPostPage({ lang }) {
  const { slug } = useParams();
  const c = COPY[lang] || COPY.fr;

  const [post, setPost] = useState(undefined); // undefined = loading, null = not found
  const { posts: allPosts } = useBlogPosts({ publishedOnly: true });

  useEffect(() => {
    window.scrollTo(0, 0);
    setPost(undefined);
    getBlogPost(slug).then(p => setPost(p || null));
  }, [slug]);

  // SEO: always call hooks (rules of hooks) — values zijn leeg tijdens laden
  const postTitle   = post?.title?.[lang]   || post?.title?.fr   || '';
  const postExcerpt = post?.excerpt?.[lang] || post?.excerpt?.fr || '';
  useSEO({ title: postTitle || undefined, description: postExcerpt || undefined, path: `/blog/${slug}`, image: post?.image, lang, type: 'article' });

  // JSON-LD: BlogPosting + BreadcrumbList (null zolang post nog niet geladen is)
  const blogPostingSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${slug}` },
    headline: postTitle,
    description: postExcerpt,
    image: post.image || DEFAULT_IMAGE,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'Noah' },
    publisher: {
      '@type': 'Organization',
      name: 'Nièvre & Morvan',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.svg` },
    },
    url: `${BASE_URL}/blog/${slug}`,
    inLanguage: lang === 'nl' ? 'nl-NL' : lang === 'en' ? 'en-GB' : 'fr-FR',
  } : null;

  const breadcrumbSchema = post ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: postTitle, item: `${BASE_URL}/blog/${slug}` },
    ],
  } : null;

  useJsonLd(blogPostingSchema && breadcrumbSchema ? [blogPostingSchema, breadcrumbSchema] : null);

  if (post === undefined) {
    return (
      <main className="page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>{c.loading}</p>
      </main>
    );
  }

  if (post === null) return <Navigate to="/blog" replace />;

  const title = post.title[lang] || post.title.fr;
  const content = post.content[lang] || post.content.fr;
  const related = allPosts.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <main className="page blog-post-page">

      {/* Hero — fetchpriority="high" zodat Google LCP sneller ziet */}
      {post.image && (
        <div className="blog-post-hero">
          <img
            src={post.image}
            alt={title}
            className="blog-post-hero-img"
            fetchpriority="high"
            decoding="async"
          />
          <div className="blog-post-hero-overlay" />
        </div>
      )}

      <article className="blog-post-article">
        <div className="blog-post-header">
          {/* Breadcrumb — zichtbaar + semantisch voor Google */}
          <nav className="blog-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true"> › </span>
            <Link to="/blog">Blog</Link>
            <span aria-hidden="true"> › </span>
            <span>{title}</span>
          </nav>
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
