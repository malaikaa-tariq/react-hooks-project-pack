import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Snowflake, Sun } from 'lucide-react'

const labels = {
  0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Freezing drizzle', 57: 'Heavy freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  77: 'Snow grains', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Storm with hail', 99: 'Severe storm',
}

export const getWeatherLabel = (code) => labels[Number(code)] || 'Changing skies'

export const getWeatherIcon = (code, isDay = 1) => {
  const value = Number(code)
  if (value === 0) return isDay ? Sun : Moon
  if (value <= 2) return CloudSun
  if (value === 3) return Cloud
  if ([45, 48].includes(value)) return CloudFog
  if (value >= 51 && value <= 57) return CloudDrizzle
  if ((value >= 61 && value <= 67) || (value >= 80 && value <= 82)) return CloudRain
  if ((value >= 71 && value <= 77) || value >= 85 && value <= 86) return value === 77 ? Snowflake : CloudSnow
  if (value >= 95) return CloudLightning
  return CloudSun
}

export const getWeatherMood = (code, isDay = 1, hour = 12) => {
  const value = Number(code)
  if (!isDay) return 'night'
  if (hour >= 17 || hour <= 6) return 'sunset'
  if ((value >= 51 && value <= 67) || (value >= 80 && value <= 82) || value >= 95) return 'rainy'
  if (value >= 3 || value === 45 || value === 48) return 'cloudy'
  return 'sunny'
}

export const getWeatherMeta = (code, isDay = 1, hour = 12) => ({
  label: getWeatherLabel(code),
  icon: getWeatherIcon(code, isDay),
  mood: getWeatherMood(code, isDay, hour),
})
