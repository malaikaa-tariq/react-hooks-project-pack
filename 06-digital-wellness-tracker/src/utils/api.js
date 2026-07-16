export const fetchJson = async (url, options = {}, timeout = 9000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error('Request unavailable');
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};
