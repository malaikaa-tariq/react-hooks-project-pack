export const fallbackCity = {
  id: 'karachi-pk',
  name: 'Karachi',
  country: 'Pakistan',
  admin1: 'Sindh',
  latitude: 24.8607,
  longitude: 67.0011,
  timezone: 'Asia/Karachi',
}

export const fallbackCities = [
  fallbackCity,
  { id: 'lahore-pk', name: 'Lahore', country: 'Pakistan', admin1: 'Punjab', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { id: 'islamabad-pk', name: 'Islamabad', country: 'Pakistan', admin1: 'Islamabad', latitude: 33.6844, longitude: 73.0479, timezone: 'Asia/Karachi' },
  { id: 'dubai-ae', name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'london-gb', name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5072, longitude: -0.1276, timezone: 'Europe/London' },
  { id: 'tokyo-jp', name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 'new-york-us', name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
]

const now = Date.now()
const isoHour = (offset) => new Date(now + offset * 3600000).toISOString().slice(0, 13) + ':00'
const isoDay = (offset) => new Date(now + offset * 86400000).toISOString().slice(0, 10)

export const fallbackWeather = {
  location: fallbackCity,
  unit: 'celsius',
  source: 'saved',
  current: {
    time: new Date().toISOString(),
    temperature: 31,
    apparentTemperature: 35,
    humidity: 66,
    precipitation: 0,
    rainChance: 18,
    windSpeed: 19,
    windDirection: 245,
    weatherCode: 2,
    isDay: 1,
  },
  hourly: Array.from({ length: 24 }, (_, index) => ({
    time: isoHour(index),
    temperature: Math.round(31 - Math.sin((index / 24) * Math.PI) * 4 + (index < 5 ? -1 : 0)),
    apparentTemperature: 34,
    humidity: 62 + (index % 4) * 3,
    rainChance: index > 6 && index < 12 ? 36 : 14,
    precipitation: index === 9 ? 0.4 : 0,
    weatherCode: index > 7 && index < 12 ? 61 : index > 16 ? 1 : 2,
    windSpeed: 16 + (index % 5),
    isDay: index < 13 ? 1 : 0,
  })),
  daily: Array.from({ length: 7 }, (_, index) => ({
    date: isoDay(index),
    weatherCode: [2, 61, 3, 1, 2, 80, 1][index],
    max: [32, 30, 31, 33, 34, 30, 32][index],
    min: [27, 26, 26, 27, 28, 26, 27][index],
    sunrise: `${isoDay(index)}T05:52`,
    sunset: `${isoDay(index)}T19:24`,
    rainChance: [18, 62, 32, 10, 20, 58, 12][index],
    precipitation: [0, 4.2, 0.5, 0, 0, 3.4, 0][index],
    windSpeed: [20, 24, 18, 17, 21, 26, 19][index],
  })),
}

export const fallbackAirQuality = {
  source: 'saved',
  current: { usAqi: 72, europeanAqi: 48, pm25: 21.4, pm10: 42.8, carbonMonoxide: 310, nitrogenDioxide: 17.2, ozone: 63.5 },
}
