import { CloudSun, Github, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="footer"><div className="footer-inner"><div className="footer-brand"><span className="brand-mark"><CloudSun /></span><div><strong>SkySense</strong><p>A fast weather companion powered by Open-Meteo.</p></div></div><div className="footer-links"><Link to="/search">Weather search</Link><Link to="/compare">Compare cities</Link><Link to="/signup">Create account</Link></div><p className="footer-note"><Heart size={14} /> Built for calmer daily planning <Github size={14} /></p></div></footer>
}
