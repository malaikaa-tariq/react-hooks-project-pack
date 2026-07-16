import { useMemo, useState } from 'react'
import { CloudSun, MapPin, Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import SectionHeader from '../components/SectionHeader'
import ViewAllModal from '../components/ViewAllModal'
import { useApp } from '../context/AppContext'
import { formatDateTime, formatTemperature } from '../utils/helpers'
import { getWeatherIcon, getWeatherLabel } from '../utils/weatherCodes'

function SavedCard({ city, onOpen, onDelete, unit }) {
  const Icon = getWeatherIcon(city.weatherCode)
  return <article className="saved-city-card card"><div className="saved-city-top"><span className="saved-weather-icon"><Icon /></span><button className="icon-button danger-icon" onClick={onDelete} aria-label="Delete city"><Trash2 size={17} /></button></div><div><p className="eyebrow">{city.country}</p><h3>{city.name}</h3><p>{getWeatherLabel(city.weatherCode)}</p></div><div className="saved-city-temp"><strong>{formatTemperature(city.temperature, unit)}</strong><span>{Math.round(city.rainChance || 0)}% rain · {Math.round(city.windSpeed || 0)} km/h</span></div><small>Saved {formatDateTime(city.savedAt)}</small><button className="button button-primary" onClick={onOpen}><MapPin size={16} /> Open Weather</button></article>
}

export default function SavedCities() {
  const { savedCities, removeSavedCity, removeManySavedCities, profile } = useApp(); const navigate = useNavigate()
  const [query, setQuery] = useState(''); const [viewAll, setViewAll] = useState(false)
  const filtered = useMemo(() => savedCities.filter((city) => `${city.name} ${city.country}`.toLowerCase().includes(query.toLowerCase())), [query, savedCities])
  const open = (city) => navigate('/search', { state: { city } })
  return <div className="page private-page content-width-private"><div className="page-heading"><p className="eyebrow">Your weather shortcuts</p><h1>Saved Cities</h1><p>Keep the places you check often within one click.</p></div><section className="card saved-toolbar"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved cities" /></label><span>{savedCities.length} saved</span></section><section className="section-block-small"><SectionHeader eyebrow="Your places" title="Weather you return to" action={savedCities.length > 4 ? <button className="button button-soft button-small" onClick={() => setViewAll(true)}>View All</button> : null} />{filtered.length ? <div className="card-grid-3">{filtered.slice(0, 6).map((city) => <SavedCard key={city.id} city={city} unit={profile?.unit} onOpen={() => open(city)} onDelete={() => removeSavedCity(city.id)} />)}</div> : <EmptyState icon={CloudSun} title="No saved cities yet" message="Search for weather and save the places you want to revisit." action={<button className="button button-primary" onClick={() => navigate('/search')}>Search a City</button>} />}</section><ViewAllModal open={viewAll} onClose={() => setViewAll(false)} title="All saved cities" items={savedCities} getSearchText={(city) => `${city.name} ${city.country}`} onDelete={removeSavedCity} onDeleteSelected={removeManySavedCities} renderItem={(city) => <button className="modal-city-item" onClick={() => { setViewAll(false); open(city) }}><MapPin /><span><strong>{city.name}</strong><small>{city.country}</small></span></button>} /></div>
}
