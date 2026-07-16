import { useMemo } from 'react'
import { Droplets, Gauge, MapPin, Wind } from 'lucide-react'
import { getWeatherMeta } from '../utils/weatherCodes'
import { formatTemperature } from '../utils/helpers'

export default function WeatherScene({ weather, compact = false, children }) {
  const current = weather?.current || {}
  const location = weather?.location || {}
  const meta = useMemo(() => getWeatherMeta(current.weatherCode, current.isDay, new Date(current.time || Date.now()).getHours()), [current.isDay, current.time, current.weatherCode])
  const Icon = meta.icon
  return <section className={`weather-scene scene-${meta.mood} ${compact ? 'weather-scene--compact' : ''}`}>
    <div className="scene-backdrop" aria-hidden="true" />
    <div className="scene-art" aria-hidden="true"><span className="sun-orb" /><span className="moon-orb" /><span className="star star-1" /><span className="star star-2" /><span className="star star-3" /><span className="star star-4" /><span className="cloud cloud-1" /><span className="cloud cloud-2" /><span className="cloud cloud-3" /><span className="wind-line wind-line-1" /><span className="wind-line wind-line-2" /><span className="rain rain-1" /><span className="rain rain-2" /><span className="rain rain-3" /><span className="rain rain-4" /><span className="rain rain-5" /><span className="hill hill-back" /><span className="hill hill-front" /></div>
    <div className="scene-content"><div className="scene-topline"><span><MapPin size={16} /> {location.name || 'Karachi'}{location.country ? `, ${location.country}` : ''}</span><span className="condition-pill"><Icon size={17} /> {meta.label}</span></div><div className="scene-main"><div><p className="eyebrow">Right now</p><strong className="scene-temperature">{formatTemperature(current.temperature, weather?.unit)}</strong><p>Feels like {formatTemperature(current.apparentTemperature, weather?.unit)}</p></div><Icon className="scene-weather-icon" size={compact ? 58 : 88} strokeWidth={1.4} /></div><div className="scene-stats"><span><Droplets size={17} /><strong>{Math.round(current.rainChance || 0)}%</strong><small>Rain</small></span><span><Wind size={17} /><strong>{Math.round(current.windSpeed || 0)}</strong><small>km/h</small></span><span><Gauge size={17} /><strong>{Math.round(current.humidity || 0)}%</strong><small>Humidity</small></span></div>{children}</div>
  </section>
}
