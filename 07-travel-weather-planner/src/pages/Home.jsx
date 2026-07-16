import { ArrowRight, ChevronLeft, ChevronRight, CloudRain, CloudSun, Columns3, MapPin, Search, ShieldCheck, Sparkles, SunMedium, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import WeatherScene from '../components/WeatherScene'
import ForecastCard from '../components/ForecastCard'
import useCarousel from '../hooks/useCarousel'
import { fallbackWeather } from '../data/fallbackWeather'

const tips = [
  { icon: CloudRain, title: 'Rain-ready mornings', text: 'Check the first six hours before choosing your commute or outdoor window.' },
  { icon: Wind, title: 'Wind matters too', text: 'A mild temperature can still feel uncomfortable when winds become strong.' },
  { icon: SunMedium, title: 'Plan around the heat', text: 'Move demanding errands away from the warmest part of the afternoon.' },
]

export default function Home() {
  const carousel = useCarousel(tips.length, 5200)
  const TipIcon = tips[carousel.index].icon
  return <div className="page home-page">
    <section className="hero content-width"><div className="hero-copy"><span className="hero-kicker"><Sparkles size={16} /> Weather that helps you decide</span><h1>Forecast Your Day Before It Surprises You.</h1><p>Search a city, understand comfort, and choose a better time for study, travel, errands, or outdoor plans.</p><div className="hero-actions"><Link className="button button-primary" to="/search"><Search size={18} /> Check Weather</Link><Link className="button button-soft" to="/compare"><Columns3 size={18} /> Compare Cities</Link><Link className="button button-ghost" to="/signup">Plan My Day <ArrowRight size={18} /></Link></div><div className="hero-trust"><span><ShieldCheck /> No API key</span><span><CloudSun /> Live forecasts</span><span><MapPin /> Global city search</span></div></div>
      <div className="hero-preview"><div className="phone-shell"><div className="phone-notch" /><WeatherScene weather={fallbackWeather} compact /><div className="mini-forecast-row">{fallbackWeather.hourly.slice(0, 3).map((item) => <ForecastCard key={item.time} item={item} unit="celsius" type="hourly" />)}</div></div><span className="floating-orbit orbit-one" /><span className="floating-orbit orbit-two" /></div>
    </section>

    <section className="content-width section-block"><div className="section-heading-centered"><p className="eyebrow">A simpler weather flow</p><h2>Three steps from forecast to decision</h2><p>SkySense keeps the useful information visible and leaves the clutter behind.</p></div><div className="how-grid"><article className="feature-card card"><span>01</span><Search /><h3>Find your city</h3><p>Choose the correct location from clean, accurate suggestions.</p></article><article className="feature-card card"><span>02</span><CloudSun /><h3>Read the whole picture</h3><p>See temperature, rain, wind, humidity, sunrise, and sunset together.</p></article><article className="feature-card card"><span>03</span><Sparkles /><h3>Plan with confidence</h3><p>Use the comfort score and activity planner to choose a better time.</p></article></div></section>

    <section className="lifestyle-band"><div className="content-width lifestyle-grid"><div><p className="eyebrow">Designed for everyday life</p><h2>Useful at a glance, detailed when you need it.</h2></div><article><strong>24</strong><span>hourly windows</span></article><article><strong>7</strong><span>day outlook</span></article><article><strong>2–4</strong><span>cities compared</span></article></div></section>

    <section className="content-width section-block tips-section"><div className="tips-visual"><span className="tips-glow" /><TipIcon size={60} /><small>Smart weather tip</small></div><div className="tips-copy"><p className="eyebrow">Plan a little smarter</p><h2>{tips[carousel.index].title}</h2><p>{tips[carousel.index].text}</p><div className="carousel-controls"><button className="icon-button" onClick={carousel.previous} aria-label="Previous tip"><ChevronLeft /></button><div className="carousel-dots">{tips.map((tip, index) => <button key={tip.title} className={index === carousel.index ? 'active' : ''} onClick={() => carousel.setIndex(index)} aria-label={`Show tip ${index + 1}`} />)}</div><button className="icon-button" onClick={carousel.next} aria-label="Next tip"><ChevronRight /></button></div></div></section>
  </div>
}
