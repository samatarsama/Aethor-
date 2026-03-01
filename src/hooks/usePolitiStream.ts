import { useEffect, useRef } from 'react'
import { fetchOsloEvents, calcBackoff } from '@/services/politiloggen'
import { useEventsStore } from '@/store/eventsStore'
import { logger } from '@/lib/logger'

const MODULE = 'usePolitiStream'

/**
 * Auto-refresh politilogg-hendelser.
 * Bruker exponential backoff ved feil: 2min → 4min → 8min → max 30min.
 */
export function usePolitiStream(baseIntervalMs = 120_000) {
  const { setEvents, setLoading, setError } = useEventsStore()
  const attemptRef  = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef  = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function fetch() {
      if (!mountedRef.current) return
      setLoading(true)

      try {
        const events = await fetchOsloEvents({ count: 100 })
        if (!mountedRef.current) return

        // Sjekk om vi fikk fallback (alle id-er starter med 'fallback-')
        const isFallback = events.every((e) => e.id.startsWith('fallback-'))
        setEvents(events, isFallback)

        if (isFallback) {
          attemptRef.current += 1
          logger.warn(MODULE, `Fallback aktivt, neste forsøk om ${calcBackoff(attemptRef.current, baseIntervalMs) / 1000}s`)
        } else {
          attemptRef.current = 0
        }
      } catch {
        if (!mountedRef.current) return
        setError('Klarte ikke hente hendelser')
        attemptRef.current += 1
      }

      if (!mountedRef.current) return
      const delay = calcBackoff(attemptRef.current, baseIntervalMs)
      timerRef.current = setTimeout(fetch, delay)
    }

    void fetch()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [baseIntervalMs, setEvents, setLoading, setError])
}
