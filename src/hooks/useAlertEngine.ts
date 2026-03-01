import { useEffect, useRef } from 'react'
import { useEventsStore } from '@/store/eventsStore'
import { usePredictionStore } from '@/store/predictionStore'
import { useAlertStore } from '@/store/alertStore'
import { playAlertBeep } from '@/lib/audioAlert'
import { DISTRICTS } from '@/prediction/districts'
import { logger } from '@/lib/logger'

const MODULE = 'alertEngine'

// Hendelseskategorier som alltid trigger CRITICAL
const CRITICAL_CATEGORIES = new Set(['Voldshendelse', 'Brann', 'Redning'])
// Terskel for prediksjon-alert
const PREDICTION_THRESHOLD = 80
// Kluster: X hendelser i samme bydel innen Y minutter
const CLUSTER_COUNT = 3
const CLUSTER_WINDOW_MS = 30 * 60 * 1000

function distanceMSimple(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R    = 6_371_000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useAlertEngine() {
  const addAlert = useAlertStore((s) => s.addAlert)

  // Sett med allerede prosesserte event-IDer og sone-IDer (unngår duplicate alerts)
  const seenEventsRef     = useRef(new Set<string>())
  const alertedZonesRef   = useRef(new Set<string>())  // soner som allerede har fått alert
  const prevFallbackRef   = useRef<boolean | null>(null)

  // ─── Events-baserte alerts ─────────────────────────────────
  useEffect(() => {
    return useEventsStore.subscribe((state) => {
      const { events, isFallback, loading } = state

      // API-tap alert
      if (!loading && prevFallbackRef.current === false && isFallback) {
        addAlert({
          severity: 'INFO',
          category: 'SYSTEM',
          message:  'Politiloggen API utilgjengelig — viser fallback-data',
          source:   'system',
        })
        playAlertBeep('INFO')
        logger.warn(MODULE, 'API-tap detektert')
      }
      prevFallbackRef.current = isFallback

      const now         = Date.now()
      const windowStart = now - CLUSTER_WINDOW_MS

      for (const event of events) {
        if (seenEventsRef.current.has(event.id)) continue
        seenEventsRef.current.add(event.id)

        // CRITICAL: voldshendelse eller brann
        if (CRITICAL_CATEGORIES.has(event.category)) {
          addAlert({
            severity: 'CRITICAL',
            category: event.category.toUpperCase(),
            message:  event.title,
            location: event.coordinates
              ? { lat: event.coordinates.lat, lng: event.coordinates.lng, area: event.municipality ?? event.district }
              : undefined,
            source: 'politiloggen',
          })
          playAlertBeep('CRITICAL')
          logger.warn(MODULE, `CRITICAL: ${event.title}`)
        }
      }

      // Kluster-deteksjon per bydel
      const recent = events.filter(
        (e) => e.coordinates && new Date(e.timestamp).getTime() > windowStart,
      )

      for (const district of DISTRICTS) {
        const [dLng, dLat] = district.center
        const inDistrict   = recent.filter(
          (e) =>
            e.coordinates &&
            distanceMSimple(dLat, dLng, e.coordinates.lat, e.coordinates.lng) <
              district.radiusM * 1.5,
        )

        const clusterKey = `cluster-${district.id}`
        if (inDistrict.length >= CLUSTER_COUNT && !seenEventsRef.current.has(clusterKey)) {
          seenEventsRef.current.add(clusterKey)
          addAlert({
            severity: 'WARNING',
            category: 'KLUSTER',
            message:  `${inDistrict.length} hendelser i ${district.name} siste 30 min`,
            location: { lat: dLat, lng: dLng, area: district.name },
            source:   'politiloggen',
          })
          playAlertBeep('WARNING')
          logger.warn(MODULE, `Kluster i ${district.name}: ${inDistrict.length} hendelser`)
        }
      }
    })
  }, [addAlert])

  // ─── Prediksjon-baserte alerts ────────────────────────────
  useEffect(() => {
    return usePredictionStore.subscribe((state) => {
      for (const zone of state.zones) {
        if (zone.riskScore < PREDICTION_THRESHOLD) {
          // Fjern fra alertedZones så vi kan re-alert hvis den stiger igjen
          alertedZonesRef.current.delete(zone.id)
          continue
        }
        if (alertedZonesRef.current.has(zone.id)) continue

        alertedZonesRef.current.add(zone.id)
        addAlert({
          severity: zone.riskScore >= 90 ? 'CRITICAL' : 'WARNING',
          category: 'PREDIKSJON',
          message:  `${zone.name}: risikoscore ${zone.riskScore}/100 — ${zone.riskLevel}`,
          location: { lat: zone.center[1], lng: zone.center[0], area: zone.name },
          source:   'prediction',
        })
        playAlertBeep(zone.riskScore >= 90 ? 'CRITICAL' : 'WARNING')
        logger.warn(MODULE, `Prediksjon-alert: ${zone.name} score=${zone.riskScore}`)
      }
    })
  }, [addAlert])
}
