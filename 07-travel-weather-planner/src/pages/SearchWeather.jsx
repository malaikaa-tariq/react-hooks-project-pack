import { useCallback, useEffect, useRef, useState } from 'react'
import { Activity, Bookmark, CalendarDays, Clock3, Columns3, RefreshCw } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import CitySearchBox from '../components/CitySearchBox'
import WeatherCard from '../components/WeatherCard'
import LoadingCard from '../components/LoadingCard'
import EmptyState from '../components/EmptyState'
import useWeatherApi from '../hooks/useWeatherApi'
import { useApp } from '../context/AppContext'

export default function SearchWeather() {
  const { profile, activeWeather, activeCity, setActiveWeather, setActiveCity, addRecentSearch, saveCity, isAuthenticated, showToast } = useApp()
  const { loading, message, loadWeather } = useWeatherApi()
  const [weather, setWeather] = useState(activeWeather)
  const [city, setCity] = useState(activeCity)
  const location = useLocation(); const navigate = useNavigate(); const initialCityRef = useRef(location.state?.city)

  const selectCity = useCallback(async (nextCity) => {
    setCity(nextCity)
    const nextWeather = await loadWeather(nextCity, profile?.unit || 'celsius')
    setWeather(nextWeather); setActiveCity(nextCity); setActiveWeather(nextWeather); addRecentSearch(nextCity, nextWeather)
  }, [addRecentSearch, loadWeather, profile?.unit, setActiveCity, setActiveWeather])

  useEffect(() => {
    if (initialCityRef.current) { const initial = initialCityRef.current; initialCityRef.current = null; selectCity(initial) }
  }, [selectCity])
  const requireLogin = (action) => { if (!isAuthenticated) { showToast({ type: 'guidance', title: 'Create an account to save', message: 'Live search works for everyone. Sign in to keep cities and plans.' }); navigate('/signup'); return false } action(); return true }

  return <div className="page content-width search-page"><div className="page-heading"><p className="eyebrow">Live city weather</p><h1>Search once. Understand the whole day.</h1><p>Choose a city suggestion to load current conditions, hourly details, and the seven-day outlook.</p></div><section className="search-hero card"><CitySearchBox onSelect={selectCity} autoFocus buttonLabel="Find Weather" /><div className="search-helper"><span>Try Karachi</span><span>London</span><span>Dubai</span><span>Tokyo</span></div></section>
    {message && <div className="friendly-banner"><RefreshCw size={18} /><span>{message}</span></div>}
    {loading ? <LoadingCard lines={8} /> : weather ? <WeatherCard weather={weather} actions={<><button className="button button-primary" onClick={() => requireLogin(() => saveCity(city, weather))}><Bookmark size={17} /> Save City</button><button className="button button-soft" onClick={() => navigate('/hourly')}><Clock3 size={17} /> Hourly</button><button className="button button-soft" onClick={() => navigate('/weekly')}><CalendarDays size={17} /> Weekly</button><button className="button button-soft" onClick={() => navigate('/compare', { state: { city } })}><Columns3 size={17} /> Compare</button><button className="button button-ghost" onClick={() => requireLogin(() => navigate('/activity-planner'))}><Activity size={17} /> Plan Activity</button></>} /> : <EmptyState title="Search for a city" message="Current conditions will appear here after you choose a location." />}
  </div>
}
