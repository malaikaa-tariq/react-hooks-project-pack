import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, RotateCcw, X } from 'lucide-react'

const icons = { success: CheckCircle2, error: AlertTriangle, warning: AlertTriangle, guidance: Lightbulb, info: Info }

export default function Toast({ toast, onClose }) {
  const Icon = icons[toast.type] || Info
  useEffect(() => { const timer = window.setTimeout(onClose, toast.duration || 4300); return () => window.clearTimeout(timer) }, [onClose, toast.duration])
  return <div className={`toast toast-${toast.type || 'info'}`} role="status"><span className="toast-icon"><Icon size={20} /></span><div className="toast-copy"><strong>{toast.title}</strong><p>{toast.message}</p>{toast.actionLabel && <button onClick={() => { toast.onAction?.(); onClose() }}><RotateCcw size={14} /> {toast.actionLabel}</button>}</div><button className="toast-close" onClick={onClose} aria-label="Close notification"><X size={18} /></button></div>
}
