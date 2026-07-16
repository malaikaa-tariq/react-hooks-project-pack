import { useEffect, useRef } from 'react';

export default function Modal({ open, title, onClose, children, size = 'medium' }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKey);
      previous?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-panel modal-${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="Close modal">×</button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
