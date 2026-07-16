import { useCallback, useEffect, useRef, useState } from 'react'

export default function useCarousel(length, delay = 5000) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)
  const next = useCallback(() => setIndex((current) => length ? (current + 1) % length : 0), [length])
  const previous = useCallback(() => setIndex((current) => length ? (current - 1 + length) % length : 0), [length])

  useEffect(() => {
    if (length < 2) return undefined
    timerRef.current = window.setInterval(next, delay)
    return () => window.clearInterval(timerRef.current)
  }, [delay, length, next])

  return { index, setIndex, next, previous }
}
