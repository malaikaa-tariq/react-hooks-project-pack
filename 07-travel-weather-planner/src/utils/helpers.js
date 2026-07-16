export const createId = (prefix = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const formatTemperature = (value, unit = 'celsius') => `${Math.round(Number(value) || 0)}°${unit === 'fahrenheit' ? 'F' : 'C'}`

export const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export const formatDate = (value, options = { weekday: 'short', month: 'short', day: 'numeric' }) => {
  if (!value) return '—'
  const date = new Date(`${value}${String(value).length === 10 ? 'T12:00:00' : ''}`)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', options).format(date)
}

export const formatDateTime = (value) => {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

export const calculateComfortScore = ({ temperature = 24, rainChance = 0, windSpeed = 10, humidity = 50, aqi = 50 }) => {
  const tempPenalty = Math.min(42, Math.abs(Number(temperature) - 23) * 3.3)
  const rainPenalty = Math.min(22, Number(rainChance) * 0.22)
  const windPenalty = Math.max(0, Number(windSpeed) - 18) * 0.75
  const humidityPenalty = Math.max(0, Math.abs(Number(humidity) - 52) - 12) * 0.34
  const airPenalty = Math.max(0, Number(aqi) - 50) * 0.12
  const score = Math.max(5, Math.min(100, Math.round(100 - tempPenalty - rainPenalty - windPenalty - humidityPenalty - airPenalty)))
  if (score >= 76) return { score, status: 'Comfortable', guidance: 'Conditions are friendly for most plans.' }
  if (score >= 50) return { score, status: 'Manageable', guidance: 'A few small adjustments will make the day easier.' }
  return { score, status: 'Harsh', guidance: 'Prefer shorter outdoor windows and carry weather protection.' }
}

export const buildActivityAdvice = (weather, activity, preferredTime) => {
  const current = weather?.current || {}
  const hourly = weather?.hourly || []
  const candidates = hourly.filter((item) => {
    const hour = new Date(item.time).getHours()
    if (preferredTime === 'Morning') return hour >= 6 && hour < 12
    if (preferredTime === 'Afternoon') return hour >= 12 && hour < 17
    if (preferredTime === 'Evening') return hour >= 17 && hour < 22
    return true
  })
  const ranked = [...candidates].sort((a, b) => {
    const score = (item) => Math.abs((item.temperature || 24) - 23) * 2 + (item.rainChance || 0) + Math.max(0, (item.windSpeed || 0) - 20)
    return score(a) - score(b)
  })
  const best = ranked[0] || hourly[0]
  const rain = Math.max(current.rainChance || 0, best?.rainChance || 0)
  const hot = Math.max(current.temperature || 0, best?.temperature || 0) >= 32
  const windy = Math.max(current.windSpeed || 0, best?.windSpeed || 0) >= 28
  const checklist = ['Water bottle']
  if (rain >= 35) checklist.push('Umbrella or light rain layer')
  if (hot) checklist.push('Sunscreen and breathable clothes')
  if (windy) checklist.push('Secure loose belongings')
  if (activity === 'Study') checklist.push('A quiet indoor backup spot')
  return {
    bestTime: best ? formatTime(best.time) : preferredTime,
    summary: `${activity} looks most comfortable around ${best ? formatTime(best.time) : preferredTime.toLowerCase()}.`,
    risks: [rain >= 35 ? 'Rain may interrupt the plan.' : '', hot ? 'Heat may feel tiring.' : '', windy ? 'Wind may be noticeable.' : ''].filter(Boolean).join(' ') || 'No major weather risk stands out.',
    checklist,
  }
}

export const downloadText = (filename, content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
