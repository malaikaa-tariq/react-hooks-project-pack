import { countries } from '../data/whoFallbackData';
import { fetchJson } from '../utils/api';
import { makeWeatherGuidance } from '../utils/helpers';

export const getWeatherBreak = async (countryName = 'Pakistan') => {
  try {
    const country = countries.find((item) => item.name === countryName) || countries[0];
    const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(country.capital)}&count=1&language=en&format=json`, {}, 7000);
    const location = geo?.results?.[0];
    if (!location) throw new Error('Location unavailable');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const data = await fetchJson(url, {}, 7000);
    const current = data?.current;
    if (!current) throw new Error('Weather unavailable');
    const weather = {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
      location: `${location.name}, ${location.country}`,
    };
    return { weather, guidance: makeWeatherGuidance(weather), live: true };
  } catch {
    const weather = { temperature: 25, precipitation: 0, windSpeed: 8, location: countryName };
    return {
      weather,
      guidance: { title: 'Take a flexible reset', text: 'Weather details are unavailable right now. Choose a short indoor stretch or step outside if conditions feel comfortable.', icon: '◌' },
      live: false,
    };
  }
};
