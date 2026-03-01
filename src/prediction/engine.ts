import type { PolitiEvent } from '@/types/politiloggen'
import { CATEGORY_SEVERITY } from '@/types/politiloggen'
import { DISTRICTS } from './districts'

export type RiskLevel = 'KRITISK' | 'HØY' | 'MIDDELS' | 'LAV'

export interface PredictionZone {
  id:             string
  name:           string
  center:         [number, number]  // [lng, lat]
  radiusM:        number
  riskScore:      number            // 0–100
  riskLevel:      RiskLevel
  predictedTypes: string[]
  confidence:     number            // 0–1
  nextUpdateAt:   Date
  factors: {
    historical: number
    temporal:   number
    liveBoost:  number
    seasonal:   number
  }
}

// ─── Haversine-avstand i meter ────────────────────────────────
function distanceM(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
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

// ─── Temporal faktor ──────────────────────────────────────────
/**
 * Returnerer en multiplikator basert på tid på døgnet og ukedag.
 * Natt og helg er statistisk farligere.
 */
function temporalFactor(now: Date): number {
  const hour    = now.getHours()
  const weekday = now.getDay() // 0=søndag, 6=lørdag

  let timeFactor: number
  if (hour >= 23 || hour < 5)       timeFactor = 1.8   // natt
  else if (hour >= 18)               timeFactor = 1.35  // kveld
  else if (hour >= 14)               timeFactor = 1.1   // ettermiddag
  else if (hour >= 9)                timeFactor = 0.95  // dagtid
  else                               timeFactor = 0.75  // tidlig morgen

  const isWeekend    = weekday === 0 || weekday === 6
  const isFridayEvening = weekday === 5 && hour >= 16
  const weekFactor   = isWeekend || isFridayEvening ? 1.45 : 1.0

  return timeFactor * weekFactor
}

// ─── Sesongfaktor ─────────────────────────────────────────────
function seasonalFactor(now: Date): number {
  const month = now.getMonth() // 0-basert
  if (month >= 5 && month <= 7) return 1.28  // sommer (jun–aug)
  if (month >= 11 || month <= 1) return 0.88  // vinter (des–feb)
  if (month >= 2 && month <= 4)  return 1.05  // vår
  return 1.0                                   // høst
}

// ─── Live-boost fra hendelser siste 2 timer ───────────────────
function liveBoost(
  districtLng: number,
  districtLat: number,
  radiusM: number,
  events: PolitiEvent[],
  now: Date,
): number {
  const twoHoursAgo = now.getTime() - 2 * 60 * 60 * 1000
  // Dobbelt radius for å fange opp hendelser i nærheten
  const catchRadius = radiusM * 2

  let boost = 0
  for (const e of events) {
    if (!e.coordinates) continue
    if (new Date(e.timestamp).getTime() < twoHoursAgo) continue

    const dist = distanceM(
      districtLat, districtLng,
      e.coordinates.lat, e.coordinates.lng,
    )
    if (dist > catchRadius) continue

    const severity   = CATEGORY_SEVERITY[e.category] ?? 1
    const activeMult = e.status === 'Pågår' ? 1.5 : 1.0
    // Hendelser nærmere sentrum bidrar mer
    const proximity  = 1 - (dist / catchRadius) * 0.5
    boost += severity * activeMult * proximity * 4
  }

  return Math.min(boost, 40) // maks +40 fra live boost
}

// ─── Klassifiser risikonivå ───────────────────────────────────
function classify(score: number): RiskLevel {
  if (score >= 80) return 'KRITISK'
  if (score >= 60) return 'HØY'
  if (score >= 35) return 'MIDDELS'
  return 'LAV'
}

// ─── Prediker vanligste hendelsestyper for distriktet ─────────
function predictedTypes(
  district: (typeof DISTRICTS)[number],
  events: PolitiEvent[],
  now: Date,
): string[] {
  const twoHoursAgo = now.getTime() - 2 * 60 * 60 * 1000
  const recent      = events.filter(
    (e) =>
      e.coordinates &&
      new Date(e.timestamp).getTime() > twoHoursAgo &&
      distanceM(
        district.center[1], district.center[0],
        e.coordinates.lat, e.coordinates.lng,
      ) < district.radiusM * 2,
  )

  if (recent.length > 0) {
    // Tell kategorier fra nylige hendelser
    const counts = new Map<string, number>()
    for (const e of recent) {
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat)
  }

  return district.typicalTypes.slice(0, 3)
}

// ─── Hoved-funksjon ───────────────────────────────────────────
/**
 * Beregner prediksjoner for alle Oslo-bydeler.
 *
 * Algoritme per bydel:
 *   score = baseline × temporal × seasonal + liveBoost
 *   clamped 0–100, classified, sorted DESC
 *
 * Confidence øker med antall live events i nærheten.
 */
export function computePredictions(
  events: PolitiEvent[],
  now: Date = new Date(),
): PredictionZone[] {
  const temporal = temporalFactor(now)
  const seasonal = seasonalFactor(now)
  const nextUpdate = new Date(now.getTime() + 5 * 60 * 1000) // 5 min

  return DISTRICTS.map((d) => {
    const [lng, lat] = d.center

    const boost     = liveBoost(lng, lat, d.radiusM, events, now)
    const rawScore  = d.baseline * temporal * seasonal + boost
    const score     = Math.round(Math.max(0, Math.min(100, rawScore)))

    // Confidence basert på datamengde
    const nearbyCount = events.filter(
      (e) =>
        e.coordinates &&
        distanceM(lat, lng, e.coordinates.lat, e.coordinates.lng) < d.radiusM * 3,
    ).length
    const confidence = Math.min(0.95, 0.40 + nearbyCount * 0.06)

    return {
      id:             d.id,
      name:           d.name,
      center:         d.center,
      radiusM:        d.radiusM,
      riskScore:      score,
      riskLevel:      classify(score),
      predictedTypes: predictedTypes(d, events, now),
      confidence,
      nextUpdateAt:   nextUpdate,
      factors: {
        historical: Math.round(d.baseline),
        temporal:   Math.round(temporal * 100) / 100,
        liveBoost:  Math.round(boost),
        seasonal:   Math.round(seasonal * 100) / 100,
      },
    }
  }).sort((a, b) => b.riskScore - a.riskScore)
}
