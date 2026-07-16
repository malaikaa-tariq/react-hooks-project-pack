import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const steps = [
  { number: '01', title: 'Notice one pattern', text: 'Save only the screen time and apps that meaningfully affect your day.', benefit: 'You get a useful baseline without turning tracking into another distraction.' },
  { number: '02', title: 'Choose one boundary', text: 'Reduce one notification, one over-limit app, or one automatic scrolling window.', benefit: 'A small boundary is easier to repeat than an all-day restriction.' },
  { number: '03', title: 'Protect attention and recovery', text: 'Use a defined focus block, then record mood, sleep, and breaks together.', benefit: 'You can see whether productivity is still leaving room for recovery.' },
  { number: '04', title: 'Review after a few days', text: 'Look for the strongest habit and the clearest pressure point.', benefit: 'You keep the changes that actually help instead of chasing perfect numbers.' },
];

export default function WellnessMethod() {
  return (
    <>
      <main className="public-main method-page">
        <section className="method-hero shell method-hero-bg">
          <div className="method-hero-copy">
            <span className="eyebrow">The DigiBalance method</span>
            <h1>A simple rhythm for healthier screen habits.</h1>
            <p>Track less, notice more, and make one adjustment at a time. The method is designed to support real routines—not perfect ones.</p>
            <Link className="button" to="/signup">Build my wellness space</Link>
          </div>
          <img src="/assets/usage-real.png" alt="A realistic digital wellness workspace showing healthy routine planning" />
        </section>

        <section className="method-steps shell">
          {steps.map((step, index) => (
            <article className={index % 2 ? 'reverse' : ''} key={step.number}>
              <div className="method-step-number">{step.number}</div>
              <div className="method-step-copy"><h2>{step.title}</h2><p>{step.text}</p><strong>{step.benefit}</strong></div>
              <div className="method-step-shape"><i /><i /><i /></div>
            </article>
          ))}
        </section>

        <section className="method-end shell">
          <div><span className="eyebrow light">The main rule</span><h2>DigiBalance should reduce digital pressure, not add to it.</h2></div>
          <p>Use the app when a record or tool will help you decide. Close it when the next healthy action is already clear.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
