import { useState, useEffect, useCallback, useRef } from "react"

export function useAutoError(duration = 4000) {
  const [error, setErrorState] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const setError = useCallback(
    (msg: string | null) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setErrorState(msg)
      if (msg) {
        timerRef.current = setTimeout(() => setErrorState(null), duration)
      }
    },
    [duration],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return [error, setError] as const
}
