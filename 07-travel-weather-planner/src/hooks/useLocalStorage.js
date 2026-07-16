import { useEffect, useRef, useState } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : (typeof initialValue === 'function' ? initialValue() : initialValue)
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })
  const timerRef = useRef(null)

  // Debounced persistence prevents repeated synchronous storage writes while forms are changing.
  useEffect(() => {
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* in-memory state still works */ }
    }, 180)
    return () => window.clearTimeout(timerRef.current)
  }, [key, value])

  return [value, setValue]
}
