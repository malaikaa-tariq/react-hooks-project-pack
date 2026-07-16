import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, wide = false }) {
  const closeRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    document.body.classList.add('modal-open'); window.addEventListener('keydown', onKey); closeRef.current?.focus()
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKey) }
  }, [onClose, open])
  if (!open) return null
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className={`modal-card ${wide ? 'modal-card-wide' : ''}`} role="dialog" aria-modal="true"><div className="modal-head"><h2>{title}</h2><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close modal"><X /></button></div>{children}</section></div>
}
