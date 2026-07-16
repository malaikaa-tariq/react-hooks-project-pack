export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const average = (values) => {
  const valid = values.map(Number).filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
};

export const newestFirst = (items, field = 'date') => [...items].sort((a, b) => String(b[field] || '').localeCompare(String(a[field] || '')));

export const downloadText = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const screenStatus = (total, goal) => {
  if (Number(total) <= Number(goal)) return 'Balanced';
  if (Number(total) <= Number(goal) * 1.2) return 'High Usage';
  return 'Over Limit';
};

export const makeWeatherGuidance = (weather) => {
  if (!weather) return null;
  const temperature = Math.round(weather.temperature ?? 24);
  const precipitation = Number(weather.precipitation || 0);
  const wind = Math.round(weather.windSpeed || 0);
  const hot = temperature >= 32;
  const cold = temperature <= 10;
  const wet = precipitation > 0.2;
  if (wet) return { title: 'Choose an indoor reset', text: `It is ${temperature}°C with precipitation nearby. Try a screen-free stretch, water break, or a few quiet laps indoors.`, icon: '⌂' };
  if (hot) return { title: 'Keep the break cool', text: `It is around ${temperature}°C. Take a shaded or indoor movement break and keep water close.`, icon: '◌' };
  if (cold) return { title: 'Warm up away from the screen', text: `It is around ${temperature}°C. A brief bundled walk or an indoor mobility break can refresh attention.`, icon: '☁' };
  return { title: 'Good moment for fresh air', text: `It is around ${temperature}°C with wind near ${wind} km/h. Consider a short screen-free walk and a hydration reset.`, icon: '↟' };
};
