import { useEffect } from 'react'
import { useEventsStore } from '@/store/eventsStore'
import { usePredictionStore } from '@/store/predictionStore'
import { computePredictions } from '@/prediction/engine'
import { logger } from '@/lib/logger'

/**
 * Kjører prediksjonsmotor hver gang events eller tid endrer seg.
 * Oppdaterer predictionStore med nye soner.
 */
export function usePredictions() {
  const events   = useEventsStore((s) => s.events)
  const setZones = usePredictionStore((s) => s.setZones)

  // Kjør ved events-endring
  useEffect(() => {
    if (events.length === 0) return
    const zones = computePredictions(events)
    setZones(zones)
    logger.debug('usePredictions', `Beregnet ${zones.length} soner`)
  }, [events, setZones])

  // Tidsstyrt re-kjøring hvert 5. minutt (temporal faktor endrer seg)
  useEffect(() => {
    const id = setInterval(() => {
      const currentEvents = useEventsStore.getState().events
      if (currentEvents.length === 0) return
      const zones = computePredictions(currentEvents)
      setZones(zones)
      logger.debug('usePredictions', 'Tidsbasert re-kjøring')
    }, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [setZones])
}
