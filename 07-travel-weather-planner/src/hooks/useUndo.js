import { useCallback, useRef, useState } from 'react'

export default function useUndo() {
  const actionRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)

  const pushUndo = useCallback((action) => {
    actionRef.current = action
    setCanUndo(Boolean(action))
  }, [])

  const undoLast = useCallback(() => {
    if (!actionRef.current) return false
    actionRef.current()
    actionRef.current = null
    setCanUndo(false)
    return true
  }, [])

  const clearUndo = useCallback(() => {
    actionRef.current = null
    setCanUndo(false)
  }, [])

  return { pushUndo, undoLast, clearUndo, canUndo }
}
