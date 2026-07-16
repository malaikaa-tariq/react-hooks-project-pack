import { fetchJson } from '../utils/api';
import { localAdvice } from '../data/wellnessTips';

export const getDailyAdvice = async () => {
  try {
    const data = await fetchJson(`https://api.adviceslip.com/advice?fresh=${Date.now()}`, { cache: 'no-store' }, 7000);
    if (!data?.slip?.advice) throw new Error('Advice unavailable');
    return { id: String(data.slip.id), text: data.slip.advice, live: true };
  } catch {
    const text = localAdvice[Math.floor(Math.random() * localAdvice.length)];
    return { id: `local-${Date.now()}`, text, live: false };
  }
};
