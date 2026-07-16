import { useMemo, useState } from 'react'
import { Clock3, Sparkles } from 'lucide-react'
import ForecastCard from '../components/ForecastCard'
import SectionHeader from '../components/SectionHeader'
import { useApp } from '../context/AppContext'
import { calculateComfortScore, formatTime } from '../utils/helpers'

export default function HourlyForecast() {
  const { activeWeather, profile } = useApp(); const [hours, setHours] = useState(12)
  const items = useMemo(() => activeWeather?.hourly?.slice(0, hours) || [], [activeWeather?.hourly, hours])
  const best = useMemo(() => [...items].map((item) => ({ ...item, score: calculateComfortScore({ temperature: item.temperature, rainChance: item.rainChance, windSpeed: item.windSpeed, humidity: item.humidity }).score })).sort((a, b) => b.score - a.score)[0], [items])
  return <div className="page private-page content-width-private"><div className="page-heading split-heading"><div><p className="eyebrow">Hour-by-hour detail</p><h1>Hourly Forecast</h1><p>Scan temperature, rain, and wind without opening dozens of panels.</p></div><div className="segmented-control">{[6, 12, 24].map((value) => <button key={value} className={hours === value ? 'active' : ''} onClick={() => setHours(value)}>{value} hours</button>)}</div></div><section className="best-time-banner"><Sparkles /><span><small>Most comfortable upcoming window</small><strong>{best ? formatTime(best.time) : '—'}</strong><p>Based on temperature, rain chance, humidity, and wind.</p></span></section><section className="section-block-small"><SectionHeader eyebrow={activeWeather?.location?.name || profile?.defaultCity} title="Upcoming weather windows" /><div className="hourly-grid">{items.map((item) => <ForecastCard key={item.time} item={item} unit={activeWeather?.unit || profile?.unit} type="hourly" badge={item.time === best?.time ? 'Best time' : ''} />)}</div></section></div>
}
