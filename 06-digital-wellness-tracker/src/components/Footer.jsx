import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand"><img src="/digibalance-mark.svg" alt="" /><span><strong>Digi</strong>Balance</span></div>
          <p>Small digital choices, calmer attention, healthier routines.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/wellness-method">How it works</Link>
          <Link to="/signup">Get started</Link>
        </div>
        <p className="footer-note">Public wellness context supports reflection and awareness, not medical diagnosis.</p>
      </div>
    </footer>
  );
}
