import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AirVent, CircleGauge, Home, Leaf, PersonStanding, RefreshCw } from 'lucide-react'
import LoadingCard from '../components/LoadingCard'
import SectionHeader from '../components/SectionHeader'
import useWeatherApi from '../hooks/useWeatherApi'
import { useApp } from '../context/AppContext'
import { fallbackAirQuality } from '../data/fallbackWeather'

const guidanceFor = (aqi) => {
  if (aqi <= 50) return { label: 'Good', tone: 'good', health: 'Air conditions support normal outdoor activity.', outdoor: 'A comfortable window for walking, errands, and exercise.', indoor: 'Keep normal ventilation habits.' }
  if (aqi <= 100) return { label: 'Moderate', tone: 'moderate', health: 'Most people can continue usual plans. Sensitive people may prefer lighter activity.', outdoor: 'Choose a lighter pace and notice any irritation.', indoor: 'Close windows briefly if outdoor air feels dusty.' }
  if (aqi <= 150) return { label: 'Sensitive groups take care', tone: 'warning', health: 'Reduce prolonged exposure if you are sensitive to air pollution.', outdoor: 'Shorten exercise and choose a quieter route.', indoor: 'Prefer an indoor workout or study block.' }
  return { label: 'Poor', tone: 'poor', health: 'Reduce prolonged outdoor exposure and follow local health guidance.', outdoor: 'Move demanding activity indoors.', indoor: 'Keep the indoor space comfortable and limit outside air entry.' }
}

export default function AirQuality() {
  const { activeCity, activeWeather } = useApp(); const { loading, message, loadAirQuality } = useWeatherApi(); const [air, setAir] = useState(fallbackAirQuality); const loaded = useRef('')
  const city = activeCity || activeWeather?.location
  const refresh = useCallback(async (force = false) => { if (!city) return; if (!force && loaded.current === city.id) return; loaded.current = city.id; setAir(await loadAirQuality(city)) }, [city, loadAirQuality])
  useEffect(() => { refresh() }, [refresh])
  const usAqi = air.current?.usAqi || 0
  const guidance = useMemo(() => guidanceFor(usAqi), [usAqi])
  const metrics = [['PM2.5', air.current?.pm25, 'µg/m³'], ['PM10', air.current?.pm10, 'µg/m³'], ['Ozone', air.current?.ozone, 'µg/m³'], ['NO₂', air.current?.nitrogenDioxide, 'µg/m³'], ['CO', air.current?.carbonMonoxide, 'µg/m³'], ['European AQI', air.current?.europeanAqi, '']]
  return <div className="page private-page content-width-private"><div className="page-heading split-heading"><div><p className="eyebrow">Breathing conditions</p><h1>Air Quality</h1><p>Read the key indicators alongside simple outdoor and indoor guidance.</p></div><button className="button button-soft" onClick={() => refresh(true)} disabled={loading}><RefreshCw className={loading ? 'spin' : ''} size={17} /> Refresh</button></div>{message && <div className="friendly-banner"><AirVent size={18} /><span>{message}</span></div>}{loading ? <LoadingCard lines={6} /> : <><section className={`aqi-hero aqi-${guidance.tone}`}><div className="aqi-orb"><CircleGauge size={38} /><strong>{Math.round(air.current?.usAqi || 0)}</strong><small>US AQI</small></div><div><p className="eyebrow">{activeWeather?.location?.name}</p><h2>{guidance.label}</h2><p>{guidance.health}</p></div><span className="aqi-breeze" /></section><section className="section-block-small"><SectionHeader eyebrow="Air details" title="Current reading" /><div className="metric-grid">{metrics.map(([label, value, unit]) => <article className="metric-card card" key={label}><small>{label}</small><strong>{Number(value || 0).toFixed(1)}</strong><span>{unit}</span></article>)}</div></section><section className="advice-grid section-block-small"><article className="advice-card card"><span className="mini-icon"><PersonStanding /></span><h3>Outdoor advice</h3><p>{guidance.outdoor}</p></article><article className="advice-card card"><span className="mini-icon"><Home /></span><h3>Indoor alternative</h3><p>{guidance.indoor}</p></article><article className="advice-card card"><span className="mini-icon"><Leaf /></span><h3>Simple reminder</h3><p>Conditions can change through the day, especially near traffic and dusty areas.</p></article></section></>}</div>
}
