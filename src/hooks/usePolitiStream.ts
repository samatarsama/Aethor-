import { useEffect, useRef } from 'react'
import { fetchOsloEvents, calcBackoff } from '@/services/politiloggen'
import { geocodeEvents } from '@/lib/geocoder'
import { useEventsStore } from '@/store/eventsStore'
import { logger } from '@/lib/logger'

const MODULE = 'usePolitiStream'

/**
 * Auto-refresh politilogg-hendelser med geocoding.
 * Bruker exponential backoff ved feil: 2min → 4min → 8min → max 30min.
 */
export function usePolitiStream(baseIntervalMs = 120_000) {
  const { setEvents, setLoading, setError } = useEventsStore()
  const attemptRef = useRef(0)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function run() {
      if (!mountedRef.current) return
      setLoading(true)

      try {
        const raw        = await fetchOsloEvents({ count: 100 })
        const enriched   = await geocodeEvents(raw)
        if (!mountedRef.current) return

        const isFallback = enriched.every((e) => e.id.startsWith('fallback-'))
        setEvents(enriched, isFallback)

        if (isFallback) {
          attemptRef.current += 1
          const delay = calcBackoff(attemptRef.current, baseIntervalMs)
          logger.warn(MODULE, `Fallback aktiv — retry om ${delay / 1000}s`)
        } else {
          attemptRef.current = 0
          logger.info(MODULE, `Lastet ${enriched.length} hendelser`)
        }
      } catch (err) {
        if (!mountedRef.current) return
        setError('Klarte ikke hente hendelser')
        attemptRef.current += 1
        logger.error(MODULE, 'Uventet feil', err)
      }

      if (!mountedRef.current) return
      const delay = calcBackoff(attemptRef.current, baseIntervalMs)
      timerRef.current = setTimeout(run, delay)
    }

    void run()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [baseIntervalMs, setEvents, setLoading, setError])
}
