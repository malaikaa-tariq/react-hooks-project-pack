import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Bookmark, CloudRain, CloudSun, RefreshCw, Search, Sparkles, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import WeatherScene from '../components/WeatherScene'
import ComfortScore from '../components/ComfortScore'
import ForecastCard from '../components/ForecastCard'
import LoadingCard from '../components/LoadingCard'
import SectionHeader from '../components/SectionHeader'
import useWeatherApi from '../hooks/useWeatherApi'
import { useApp } from '../context/AppContext'
import { buildActivityAdvice } from '../utils/helpers'

export default function Dashboard() {
  const { currentUser, profile, savedCities, recentSearches, activeWeather, setActiveWeather, setActiveCity } = useApp()
  const { loading, message, findCities, loadWeather } = useWeatherApi()
  const [weather, setWeather] = useState(activeWeather)
  const loadedKey = useRef('')
  const cityName = profile?.defaultCity || currentUser?.defaultCity || 'Karachi'
  const unit = profile?.unit || 'celsius'

  const refresh = useCallback(async (force = false) => {
    const key = `${cityName}-${unit}`
    if (!force && loadedKey.current === key) return
    loadedKey.current = key
    const results = await findCities(cityName)
    const city = results[0]
    if (!city) return
    const next = await loadWeather(city, unit)
    setWeather(next); setActiveCity(city); setActiveWeather(next)
  }, [cityName, findCities, loadWeather, setActiveCity, setActiveWeather, unit])

  useEffect(() => { refresh() }, [refresh])
  const advice = useMemo(() => buildActivityAdvice(weather, profile?.interest === 'Fitness' ? 'Workout' : profile?.interest === 'Study' ? 'Study' : 'Walk', 'Flexible'), [profile?.interest, weather])

  return <div className="page private-page content-width-private"><div className="page-heading split-heading"><div><p className="eyebrow">Good to see you, {currentUser?.fullName?.split(' ')[0]}</p><h1>Your weather at a glance</h1><p>One clean overview for the forecast, comfort, and best next action.</p></div><button className="button button-soft" onClick={() => refresh(true)} disabled={loading}><RefreshCw className={loading ? 'spin' : ''} size={17} /> Refresh</button></div>
    {message && <div className="friendly-banner"><CloudRain size={18} /><span>{message}</span></div>}
    {loading && !weather ? <LoadingCard lines={7} /> : <section className="dashboard-hero-grid"><WeatherScene weather={weather} /><div className="dashboard-side"><ComfortScore weather={weather} /><article className="suggestion-card card"><span className="mini-icon"><Sparkles /></span><p className="eyebrow">Best next move</p><h2>{advice.bestTime}</h2><p>{advice.summary}</p><Link className="button button-primary" to="/activity-planner">Plan an activity <ArrowRight size={17} /></Link></article></div></section>}
    <section className="section-block-small"><SectionHeader eyebrow="Next hours" title="The forecast without the noise" action={<Link className="button button-soft button-small" to="/hourly">Full hourly view</Link>} /><div className="forecast-scroll">{weather?.hourly?.slice(0, 6).map((item) => <ForecastCard key={item.time} item={item} unit={weather.unit} type="hourly" />)}</div></section>
    <section className="dashboard-lower-grid section-block-small"><article className="card quick-panel"><SectionHeader eyebrow="Quick actions" title="Where would you like to go?" /><div className="quick-action-grid"><Link to="/search"><Search /><span><strong>Search weather</strong><small>Find any city</small></span></Link><Link to="/saved-cities"><Bookmark /><span><strong>Saved cities</strong><small>{savedCities.length} saved</small></span></Link><Link to="/weekly"><CloudSun /><span><strong>Weekly outlook</strong><small>Plan seven days</small></span></Link><Link to="/compare"><Wind /><span><strong>Compare cities</strong><small>Pick the better weather</small></span></Link></div></article><article className="card recent-panel"><SectionHeader eyebrow="Recent searches" title="Jump back quickly" />{recentSearches.length ? <div className="recent-list">{recentSearches.slice(0, 4).map((city) => <Link key={city.id} to="/search" state={{ city }}><span><strong>{city.name}</strong><small>{city.country}</small></span><span>{Math.round(city.temperature || 0)}°</span></Link>)}</div> : <div className="compact-empty"><CloudSun /><p>Your recently searched cities will appear here.</p></div>}</article></section>
  </div>
}
