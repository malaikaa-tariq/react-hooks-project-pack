import { CloudRain, Wind } from 'lucide-react'
import { getWeatherIcon, getWeatherLabel } from '../utils/weatherCodes'
import { formatDate, formatTemperature, formatTime } from '../utils/helpers'

export default function ForecastCard({ item, unit = 'celsius', type = 'hourly', badge }) {
  const Icon = getWeatherIcon(item.weatherCode, item.isDay)
  const heading = type === 'hourly' ? formatTime(item.time) : formatDate(item.date, { weekday: 'long', month: 'short', day: 'numeric' })
  return <article className={`forecast-card forecast-card--${type}`}>{badge && <span className="card-badge">{badge}</span>}<div className="forecast-card-head"><div><p className="eyebrow">{type === 'hourly' ? 'Forecast' : 'Day outlook'}</p><h3>{heading}</h3></div><span className="forecast-icon"><Icon size={28} /></span></div><p className="muted">{getWeatherLabel(item.weatherCode)}</p><div className="forecast-temp">{type === 'hourly' ? <strong>{formatTemperature(item.temperature, unit)}</strong> : <><strong>{formatTemperature(item.max, unit)}</strong><span>{formatTemperature(item.min, unit)}</span></>}</div><div className="forecast-meta"><span><CloudRain size={15} /> {Math.round(item.rainChance || 0)}%</span><span><Wind size={15} /> {Math.round(item.windSpeed || 0)} km/h</span></div></article>
}
