import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const benefits = [
  { number: '01', title: 'Notice', text: 'Save one daily snapshot instead of tracking every tap.' },
  { number: '02', title: 'Protect', text: 'Use focus blocks and realistic app limits when attention matters.' },
  { number: '03', title: 'Recover', text: 'Keep mood, sleep, and breaks together so recovery is easier to protect.' },
];

export default function Home() {
  return (
    <>
      <main className="public-main home-page">
        <section className="home-hero home-hero-bg">
          <div className="shell home-hero-grid">
            <div className="home-hero-copy">
              <span className="eyebrow light">A calmer way to use technology</span>
              <h1>Use Technology Better, <em>Not Longer.</em></h1>
              <p>Build healthier screen habits, protect focused work, and create recovery time without turning wellness into another complicated task.</p>
              <div className="hero-actions">
                <Link className="button button-light" to="/signup">Create my wellness space</Link>
                <Link className="button button-outline-light" to="/wellness-method">See the method</Link>
              </div>
              <div className="home-hero-note"><span>✓</span><p>Health-focused guidance, optional AI help, and simple tracking that does not overwhelm.</p></div>
            </div>
            <div className="home-hero-image home-real-image"><img src="/assets/dashboard-health-real.png" alt="A realistic digital wellness workspace with health-focused tools" /></div>
          </div>
        </section>

        <section className="home-story shell">
          <div className="home-story-heading">
            <span className="eyebrow">Built for real days</span>
            <h2>One clear loop instead of many disconnected tools.</h2>
            <p>DigiBalance helps you understand the day, make one small change, and review whether it helped.</p>
          </div>
          <div className="home-benefit-grid">
            {benefits.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </section>

        <section className="home-preview-section">
          <div className="shell home-preview-grid">
            <div className="home-preview-image home-real-image"><img src="/assets/health-guide-real.png" alt="A realistic wellness guidance consultation scene" /></div>
            <div className="home-preview-copy">
              <span className="eyebrow">Useful, not overwhelming</span>
              <h2>See the one pattern that deserves attention.</h2>
              <p>Your dashboard and analytics avoid repeating the same content. Each page has one job: track, focus, reset, check in, guide, or review.</p>
              <ul>
                <li>Simple daily screen-time and app tracking</li>
                <li>Popup instructions for new users</li>
                <li>WHO-inspired wellness guidance and AI assistant support</li>
              </ul>
              <Link className="button" to="/signup">Start with DigiBalance</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
