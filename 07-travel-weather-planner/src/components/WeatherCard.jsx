import { Droplets, Sunrise, Sunset, ThermometerSun, Wind } from 'lucide-react'
import WeatherScene from './WeatherScene'
import { formatTemperature, formatTime } from '../utils/helpers'

export default function WeatherCard({ weather, actions, compact = false }) {
  const current = weather?.current || {}
  const today = weather?.daily?.[0] || {}
  return <div className="weather-card-stack"><WeatherScene weather={weather} compact={compact} /><div className="weather-detail-grid"><article className="detail-card"><ThermometerSun /><span><small>Feels like</small><strong>{formatTemperature(current.apparentTemperature, weather?.unit)}</strong></span></article><article className="detail-card"><Droplets /><span><small>Precipitation</small><strong>{Number(current.precipitation || 0).toFixed(1)} mm</strong></span></article><article className="detail-card"><Wind /><span><small>Wind speed</small><strong>{Math.round(current.windSpeed || 0)} km/h</strong></span></article><article className="detail-card"><Sunrise /><span><small>Sunrise</small><strong>{formatTime(today.sunrise)}</strong></span></article><article className="detail-card"><Sunset /><span><small>Sunset</small><strong>{formatTime(today.sunset)}</strong></span></article></div>{actions && <div className="weather-card-actions">{actions}</div>}</div>
}
