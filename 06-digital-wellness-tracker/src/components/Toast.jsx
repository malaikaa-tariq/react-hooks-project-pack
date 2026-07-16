import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(onClose, 5200);
    return () => window.clearTimeout(timeout);
  }, [onClose, toast]);

  if (!toast) return null;
  const icons = { success: '✓', error: '!', warning: '△', guidance: '◌' };
  return (
    <div className={`toast toast-${toast.type || 'guidance'}`} role="status">
      <span className="toast-icon">{icons[toast.type] || icons.guidance}</span>
      <p>{toast.message}</p>
      {toast.action && <button type="button" onClick={() => { toast.action(); onClose(); }}>{toast.actionLabel || 'Undo'}</button>}
      <button className="toast-close" type="button" onClick={onClose} aria-label="Close notification">×</button>
    </div>
  );
}
