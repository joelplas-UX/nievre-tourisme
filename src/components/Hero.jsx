import { Link } from 'react-router-dom';

export default function Hero({ tr }) {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>{tr.hero.title}</h1>
        <p>{tr.hero.subtitle}</p>
        <Link to="/evenements" className="btn btn-primary">{tr.hero.cta} →</Link>
      </div>
    </section>
  );
}
