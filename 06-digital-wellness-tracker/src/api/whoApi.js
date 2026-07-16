import { countries, whoFallbackData } from '../data/whoFallbackData';
import { fetchJson } from '../utils/api';

const BASE = 'https://ghoapi.azureedge.net/api';

const topicQueries = {
  'mental wellbeing': ['mental health', 'suicide mortality'],
  'physical activity': ['physical activity', 'insufficient physical activity'],
  'sleep/rest education': ['healthy life expectancy'],
  'healthy habits': ['healthy life expectancy'],
  'youth wellbeing': ['adolescent', 'school health'],
  'general health awareness': ['life expectancy'],
};

const friendlyNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number >= 100 ? Math.round(number).toLocaleString() : number.toFixed(1);
};

const findIndicator = async (searchTerm) => {
  const filter = encodeURIComponent(`contains(IndicatorName, '${searchTerm.replaceAll("'", "''")}')`);
  const data = await fetchJson(`${BASE}/Indicator?$filter=${filter}&$top=12`, {}, 9000);
  return data?.value?.find((item) => item.IndicatorCode && item.IndicatorName) || null;
};

export const getWhoInsights = async ({ countryName = 'Pakistan', topic = 'physical activity' } = {}) => {
  const country = countries.find((item) => item.name === countryName) || countries[0];
  const fallback = whoFallbackData.filter((item) => item.topic === topic);
  try {
    let indicator = null;
    for (const term of topicQueries[topic] || topicQueries['general health awareness']) {
      indicator = await findIndicator(term);
      if (indicator) break;
    }
    if (!indicator) throw new Error('No indicator');
    const filter = encodeURIComponent(`SpatialDim eq '${country.code}'`);
    const data = await fetchJson(`${BASE}/${encodeURIComponent(indicator.IndicatorCode)}?$filter=${filter}&$orderby=TimeDim desc&$top=8`, {}, 10000);
    const values = (data?.value || []).filter((item) => item.NumericValue !== null && item.NumericValue !== undefined);
    if (!values.length) throw new Error('No country values');
    const latest = values[0];
    const value = friendlyNumber(latest.NumericValue);
    const unit = latest.Dim1 || latest.Low || latest.High ? '' : '';
    const insight = {
      id: `who-${indicator.IndicatorCode}-${country.code}-${latest.TimeDim}`,
      topic,
      title: indicator.IndicatorName,
      statistic: `${value}${unit} — latest available observation for ${country.name} (${latest.TimeDim || 'recent reporting period'}).`,
      explanation: 'This public-health indicator offers country-level context. Differences in definitions, reporting years, and population groups can affect comparisons.',
      digitalHabit: topic === 'physical activity'
        ? 'Use screen transitions as movement cues: stand, stretch, or walk briefly before opening the next app.'
        : topic === 'mental wellbeing'
          ? 'Protect small periods of quiet recovery and reach out to trusted support when digital stress feels persistent.'
          : 'Use this insight as a prompt to reflect on sleep, movement, connection, and balanced technology use.',
      sourceLabel: 'WHO Global Health Observatory',
      indicatorCode: indicator.IndicatorCode,
      country: country.name,
      year: latest.TimeDim,
      value: latest.NumericValue,
    };
    return { insights: [insight, ...fallback].slice(0, 3), live: true, message: '' };
  } catch {
    return {
      insights: fallback.length ? fallback : whoFallbackData.slice(0, 2),
      live: false,
      message: 'Live global health insights are unavailable right now. Showing saved wellness guidance.',
    };
  }
};
