import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Award, Columns3, Plus, Trash2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import CitySearchBox from '../components/CitySearchBox'
import EmptyState from '../components/EmptyState'
import useWeatherApi from '../hooks/useWeatherApi'
import { useApp } from '../context/AppContext'
import { calculateComfortScore, formatTemperature } from '../utils/helpers'
import { getWeatherIcon, getWeatherLabel } from '../utils/weatherCodes'

function CompareCard({ entry, best, onRemove }) {
  const current = entry.weather.current; const Icon = getWeatherIcon(current.weatherCode, current.isDay)
  return <article className={`compare-card card ${best ? 'best-city' : ''}`}>{best && <span className="best-ribbon"><Award size={14} /> Best weather</span>}<div className="compare-card-head"><span className="compare-icon"><Icon /></span><button className="icon-button danger-icon" onClick={onRemove}><Trash2 size={17} /></button></div><p className="eyebrow">{entry.city.country}</p><h3>{entry.city.name}</h3><p>{getWeatherLabel(current.weatherCode)}</p><strong className="compare-temp">{formatTemperature(current.temperature, entry.weather.unit)}</strong><div className="compare-stats"><span><small>Rain</small><strong>{Math.round(current.rainChance || 0)}%</strong></span><span><small>Wind</small><strong>{Math.round(current.windSpeed || 0)} km/h</strong></span><span><small>Comfort</small><strong>{entry.comfort}%</strong></span></div></article>
}

export default function CompareCities() {
  const { profile } = useApp(); const { loading, loadWeather } = useWeatherApi(); const [cities, setCities] = useState([]); const citiesRef = useRef([]); const location = useLocation(); const initialCityRef = useRef(location.state?.city)
  useEffect(() => { citiesRef.current = cities }, [cities])
  const add = useCallback(async (city) => {
    if (!city || citiesRef.current.some((entry) => entry.city.id === city.id) || citiesRef.current.length >= 4) return
    const weather = await loadWeather(city, profile?.unit || 'celsius')
    const comfort = calculateComfortScore({ temperature: weather.current.temperature, rainChance: weather.current.rainChance, windSpeed: weather.current.windSpeed, humidity: weather.current.humidity }).score
    setCities((current) => current.some((entry) => entry.city.id === city.id) || current.length >= 4 ? current : [...current, { city, weather, comfort }])
  }, [loadWeather, profile?.unit])
  useEffect(() => { if (initialCityRef.current) { const initial = initialCityRef.current; initialCityRef.current = null; add(initial) } }, [add])
  const bestId = useMemo(() => [...cities].sort((a, b) => b.comfort - a.comfort)[0]?.city.id, [cities])
  return <div className="page content-width compare-page"><div className="page-heading"><p className="eyebrow">Side-by-side weather</p><h1>Compare Cities</h1><p>Add two to four cities and quickly see which one has the friendliest conditions.</p></div><section className="compare-search card"><div><span className="mini-icon"><Plus /></span><div><h2>Add a city</h2><p>{cities.length}/4 selected</p></div></div><CitySearchBox compact onSelect={add} buttonLabel="Add" /></section>{cities.length ? <div className="compare-grid">{cities.map((entry) => <CompareCard key={entry.city.id} entry={entry} best={entry.city.id === bestId && cities.length > 1} onRemove={() => setCities((current) => current.filter((item) => item.city.id !== entry.city.id))} />)}</div> : <EmptyState icon={Columns3} title="Add your first city" message="Start with any city, then add another to compare comfort, rain, wind, and temperature." />}{loading && <p className="loading-note">Adding live weather…</p>}</div>
}
