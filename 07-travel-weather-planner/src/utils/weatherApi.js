import { fallbackAirQuality, fallbackCities, fallbackCity, fallbackWeather } from '../data/fallbackWeather'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const memoryCache = new Map()
const inFlight = new Map()

const hash = (value) => {
  let output = 0
  for (let index = 0; index < value.length; index += 1) output = ((output << 5) - output + value.charCodeAt(index)) | 0
  return Math.abs(output).toString(36)
}

const readSessionCache = (url, maxAge) => {
  const memory = memoryCache.get(url)
  if (memory && Date.now() - memory.time < maxAge) return memory.data
  try {
    const saved = JSON.parse(sessionStorage.getItem(`skysense-cache-${hash(url)}`) || 'null')
    if (saved && Date.now() - saved.time < maxAge) {
      memoryCache.set(url, saved)
      return saved.data
    }
  } catch { /* ignore unavailable cache */ }
  return null
}

const writeSessionCache = (url, data) => {
  const entry = { time: Date.now(), data }
  memoryCache.set(url, entry)
  try { sessionStorage.setItem(`skysense-cache-${hash(url)}`, JSON.stringify(entry)) } catch { /* ignore unavailable cache */ }
}

const fetchJson = async (url, { timeout = 8000, maxAge = 10 * 60 * 1000 } = {}) => {
  const cached = readSessionCache(url, maxAge)
  if (cached) return cached
  if (inFlight.has(url)) return inFlight.get(url)

  const request = (async () => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error('Weather service unavailable')
      const data = await response.json()
      writeSessionCache(url, data)
      return data
    } finally {
      window.clearTimeout(timer)
      inFlight.delete(url)
    }
  })()
  inFlight.set(url, request)
  return request
}

export const normalizeCity = (city) => ({
  id: String(city.id || `${city.latitude}-${city.longitude}`),
  name: city.name,
  country: city.country || city.country_code || '',
  admin1: city.admin1 || '',
  latitude: Number(city.latitude),
  longitude: Number(city.longitude),
  timezone: city.timezone || 'auto',
})

export const searchCities = async (query) => {
  const clean = query.trim()
  if (!clean) return []
  try {
    const url = `${GEOCODING_URL}?name=${encodeURIComponent(clean)}&count=6&language=en&format=json`
    const data = await fetchJson(url, { maxAge: 24 * 60 * 60 * 1000 })
    return (data.results || []).map(normalizeCity)
  } catch {
    const needle = clean.toLowerCase()
    return fallbackCities.filter((city) => `${city.name} ${city.country} ${city.admin1}`.toLowerCase().includes(needle))
  }
}

const pick = (array, index, fallback = 0) => Array.isArray(array) ? (array[index] ?? fallback) : fallback

export const fetchWeather = async (city = fallbackCity, unit = 'celsius') => {
  const params = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: 'auto',
    temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
    wind_speed_unit: 'kmh',
    forecast_days: '7',
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
    hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
  })
  const data = await fetchJson(`${FORECAST_URL}?${params}`)
  const currentIndex = Math.max(0, (data.hourly?.time || []).findIndex((time) => time >= data.current?.time))
  const hourly = (data.hourly?.time || []).map((time, index) => ({
    time,
    temperature: pick(data.hourly.temperature_2m, index),
    apparentTemperature: pick(data.hourly.apparent_temperature, index),
    humidity: pick(data.hourly.relative_humidity_2m, index),
    rainChance: pick(data.hourly.precipitation_probability, index),
    precipitation: pick(data.hourly.precipitation, index),
    weatherCode: pick(data.hourly.weather_code, index),
    windSpeed: pick(data.hourly.wind_speed_10m, index),
    isDay: pick(data.hourly.is_day, index, 1),
  })).slice(currentIndex, currentIndex + 24)
  const daily = (data.daily?.time || []).map((date, index) => ({
    date,
    weatherCode: pick(data.daily.weather_code, index),
    max: pick(data.daily.temperature_2m_max, index),
    min: pick(data.daily.temperature_2m_min, index),
    sunrise: pick(data.daily.sunrise, index, null),
    sunset: pick(data.daily.sunset, index, null),
    rainChance: pick(data.daily.precipitation_probability_max, index),
    precipitation: pick(data.daily.precipitation_sum, index),
    windSpeed: pick(data.daily.wind_speed_10m_max, index),
  }))
  return {
    location: normalizeCity(city), unit, source: 'live',
    current: {
      time: data.current?.time,
      temperature: data.current?.temperature_2m,
      apparentTemperature: data.current?.apparent_temperature,
      humidity: data.current?.relative_humidity_2m,
      precipitation: data.current?.precipitation,
      rainChance: hourly[0]?.rainChance || 0,
      windSpeed: data.current?.wind_speed_10m,
      windDirection: data.current?.wind_direction_10m,
      weatherCode: data.current?.weather_code,
      isDay: data.current?.is_day,
    },
    hourly, daily,
  }
}

export const fetchAirQuality = async (city = fallbackCity) => {
  const params = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: 'auto',
    current: 'us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone',
  })
  const data = await fetchJson(`${AIR_QUALITY_URL}?${params}`, { maxAge: 20 * 60 * 1000 })
  return { source: 'live', current: {
    usAqi: data.current?.us_aqi ?? 0,
    europeanAqi: data.current?.european_aqi ?? 0,
    pm25: data.current?.pm2_5 ?? 0,
    pm10: data.current?.pm10 ?? 0,
    carbonMonoxide: data.current?.carbon_monoxide ?? 0,
    nitrogenDioxide: data.current?.nitrogen_dioxide ?? 0,
    ozone: data.current?.ozone ?? 0,
  } }
}

export const weatherFallbackFor = (city = fallbackCity, unit = 'celsius') => ({
  ...structuredClone(fallbackWeather),
  location: normalizeCity(city),
  unit,
})

export const airFallback = () => structuredClone(fallbackAirQuality)
