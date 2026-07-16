import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const ref = useRef(null)
  const frame = useRef(null)
  useEffect(() => {
    const cursor = ref.current
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return undefined
    let x = 0; let y = 0
    const render = () => { cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`; frame.current = null }
    const move = (event) => { x = event.clientX; y = event.clientY; if (!frame.current) frame.current = requestAnimationFrame(render) }
    const over = (event) => cursor.classList.toggle('is-active', Boolean(event.target.closest('a, button, input, select, textarea')))
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('pointerover', over, { passive: true })
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerover', over); if (frame.current) cancelAnimationFrame(frame.current) }
  }, [])
  return <span ref={ref} className="custom-cursor" aria-hidden="true" />
}
