import { useCallback, useEffect, useRef, useState } from 'react';

export function useUndo(onRestore) {
  const actionRef = useRef(null);
  const [lastAction, setLastAction] = useState(null);

  const remember = useCallback((action) => {
    actionRef.current = action;
    setLastAction(action);
  }, []);

  const undo = useCallback(() => {
    const action = actionRef.current;
    if (!action) return false;
    onRestore(action);
    actionRef.current = null;
    setLastAction(null);
    return true;
  }, [onRestore]);

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;
      if (!typing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo]);

  return { lastAction, remember, undo, canUndo: Boolean(lastAction) };
}
