import { useMemo } from 'react'
import { ShieldCheck } from 'lucide-react'
import { calculateComfortScore } from '../utils/helpers'

export default function ComfortScore({ weather, aqi = 50, compact = false }) {
  const current = weather?.current || {}
  const comfort = useMemo(() => calculateComfortScore({ temperature: current.temperature, rainChance: current.rainChance, windSpeed: current.windSpeed, humidity: current.humidity, aqi }), [aqi, current.humidity, current.rainChance, current.temperature, current.windSpeed])
  return <article className={`comfort-card ${compact ? 'comfort-card--compact' : ''}`}><div className="comfort-ring" style={{ '--score': `${comfort.score * 3.6}deg` }}><strong>{comfort.score}%</strong></div><div className="comfort-copy"><span className="eyebrow"><ShieldCheck size={15} /> Weather comfort</span><h3>{comfort.status}</h3><p>{comfort.guidance}</p></div></article>
}
