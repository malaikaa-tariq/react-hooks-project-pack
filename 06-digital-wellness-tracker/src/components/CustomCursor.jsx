import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return undefined;

    const move = (event) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${event.clientX - 6}px, ${event.clientY - 6}px, 0)`;
    };
    const hover = (event) => {
      cursorRef.current?.classList.toggle('cursor-over-control', Boolean(event.target.closest('button, a, input, select, textarea')));
    };
    const hide = () => cursorRef.current?.classList.add('cursor-hidden');
    const show = () => cursorRef.current?.classList.remove('cursor-hidden');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', hover, { passive: true });
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);

    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', hover);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
    };
  }, []);

  return <div ref={cursorRef} className="cursor-soft-glow" aria-hidden="true" />;
}
