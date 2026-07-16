import { useMemo } from 'react'
import { CloudRain, Flame, Sparkles } from 'lucide-react'
import ForecastCard from '../components/ForecastCard'
import SectionHeader from '../components/SectionHeader'
import { useApp } from '../context/AppContext'
import { calculateComfortScore, formatDate } from '../utils/helpers'

export default function WeeklyForecast() {
  const { activeWeather, profile } = useApp(); const days = useMemo(() => activeWeather?.daily || [], [activeWeather?.daily])
  const highlights = useMemo(() => {
    if (!days.length) return {}
    const hottest = [...days].sort((a, b) => b.max - a.max)[0]
    const rainiest = [...days].sort((a, b) => b.rainChance - a.rainChance)[0]
    const best = [...days].map((day) => ({ ...day, comfort: calculateComfortScore({ temperature: (day.max + day.min) / 2, rainChance: day.rainChance, windSpeed: day.windSpeed, humidity: 55 }).score })).sort((a, b) => b.comfort - a.comfort)[0]
    return { hottest, rainiest, best }
  }, [days])
  const badge = (day) => day.date === highlights.best?.date ? 'Best day' : day.date === highlights.hottest?.date ? 'Hottest' : day.date === highlights.rainiest?.date ? 'Rainiest' : ''
  return <div className="page private-page content-width-private"><div className="page-heading"><p className="eyebrow">Seven-day planning</p><h1>Weekly Forecast</h1><p>Find the easiest day to plan, the warmest peak, and the strongest chance of rain.</p></div><section className="weekly-highlight-grid"><article className="highlight-card best-highlight"><Sparkles /><span><small>Best day</small><strong>{formatDate(highlights.best?.date, { weekday: 'long' })}</strong><p>Most balanced comfort this week.</p></span></article><article className="highlight-card hot-highlight"><Flame /><span><small>Hottest day</small><strong>{formatDate(highlights.hottest?.date, { weekday: 'long' })}</strong><p>High near {Math.round(highlights.hottest?.max || 0)}°.</p></span></article><article className="highlight-card rain-highlight"><CloudRain /><span><small>Rainiest day</small><strong>{formatDate(highlights.rainiest?.date, { weekday: 'long' })}</strong><p>{Math.round(highlights.rainiest?.rainChance || 0)}% rain chance.</p></span></article></section><section className="section-block-small"><SectionHeader eyebrow={activeWeather?.location?.name || profile?.defaultCity} title="The full week" /><div className="weekly-list">{days.map((day) => <ForecastCard key={day.date} item={day} unit={activeWeather?.unit || profile?.unit} type="daily" badge={badge(day)} />)}</div></section></div>
}
