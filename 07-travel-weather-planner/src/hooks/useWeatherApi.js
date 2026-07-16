import { useCallback, useRef, useState } from 'react'
import { airFallback, fetchAirQuality, fetchWeather, searchCities, weatherFallbackFor } from '../utils/weatherApi'

export default function useWeatherApi() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const requestCount = useRef(0)

  const run = useCallback(async (task, fallback, friendlyMessage) => {
    requestCount.current += 1
    setLoading(true)
    setMessage('')
    try {
      return await task()
    } catch {
      setMessage(friendlyMessage)
      return fallback()
    } finally {
      requestCount.current = Math.max(0, requestCount.current - 1)
      if (requestCount.current === 0) setLoading(false)
    }
  }, [])

  const findCities = useCallback(async (query) => {
    setLoading(true)
    setMessage('')
    try {
      const cities = await searchCities(query)
      if (!cities.length) setMessage('No city found. Try a nearby major city.')
      return cities
    } catch {
      setMessage('City search is taking a break. Try a major city name.')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWeather = useCallback((city, unit = 'celsius') => run(
    () => fetchWeather(city, unit),
    () => weatherFallbackFor(city, unit),
    'Live weather is unavailable right now. Showing saved weather insights.',
  ), [run])

  const loadAirQuality = useCallback((city) => run(
    () => fetchAirQuality(city),
    airFallback,
    'Fresh air details are unavailable right now. Showing saved guidance.',
  ), [run])

  return { loading, message, clearMessage: useCallback(() => setMessage(''), []), findCities, loadWeather, loadAirQuality }
}
