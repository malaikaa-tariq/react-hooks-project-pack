import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, MapPin, Search } from 'lucide-react'
import useWeatherApi from '../hooks/useWeatherApi'

export default function CitySearchBox({ onSelect, initialValue = '', buttonLabel = 'Search', autoFocus = false, compact = false }) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState([])
  const [fieldError, setFieldError] = useState('')
  const { loading, message, findCities, clearMessage } = useWeatherApi()
  const inputRef = useRef(null)

  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])
  useEffect(() => { setQuery(initialValue) }, [initialValue])

  const submit = async (event) => {
    event?.preventDefault()
    if (!query.trim()) { setFieldError('Please enter a city name before searching.'); setSuggestions([]); return }
    setFieldError(''); clearMessage()
    const results = await findCities(query)
    setSuggestions(results || [])
  }

  const select = (city) => {
    setQuery(`${city.name}${city.country ? `, ${city.country}` : ''}`)
    setSuggestions([])
    onSelect(city)
  }

  return <div className={`city-search-box ${compact ? 'city-search-box--compact' : ''}`}>
    <form className="city-search-form" onSubmit={submit}><label className="search-field"><Search size={19} /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setFieldError(''); setSuggestions([]) }} placeholder="Search city or region" aria-label="City name" /></label><button className="button button-primary" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <Search size={18} />}{buttonLabel}</button></form>
    {(fieldError || message) && <p className="field-message error-text">{fieldError || message}</p>}
    {suggestions.length > 0 && <div className="suggestion-list" role="listbox">{suggestions.map((city) => <button key={city.id} type="button" onClick={() => select(city)}><MapPin size={17} /><span><strong>{city.name}</strong><small>{[city.admin1, city.country].filter(Boolean).join(', ')}</small></span></button>)}</div>}
  </div>
}
