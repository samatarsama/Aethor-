import { logger } from '@/lib/logger'
import type { AvinorFlight } from '@/types/osint'

const MODULE = 'avinor'

const AIRPORT_NAMES: Record<string, string> = {
  OSL: 'Oslo Gardermoen', CPH: 'København', AMS: 'Amsterdam', LHR: 'London Heathrow',
  FRA: 'Frankfurt',       CDG: 'Paris CDG', ARN: 'Stockholm Arlanda', HEL: 'Helsinki',
  BCN: 'Barcelona',       MAD: 'Madrid',    DXB: 'Dubai',             JFK: 'New York JFK',
  BGO: 'Bergen',          TRD: 'Trondheim', SVG: 'Stavanger',         TOS: 'Tromsø',
  BOO: 'Bodø',            AES: 'Ålesund',   KRS: 'Kristiansand',      HAU: 'Haugesund',
}

function parseStatus(code: string): AvinorFlight['status'] {
  const map: Record<string, AvinorFlight['status']> = {
    A: 'on-time', D: 'departed', L: 'landed', C: 'cancelled', E: 'delayed', N: 'on-time',
  }
  return map[code] ?? 'on-time'
}

function parseAvinorXml(xml: string, direction: 'A' | 'D'): AvinorFlight[] {
  const parser   = new DOMParser()
  const doc      = parser.parseFromString(xml, 'text/xml')
  const flights  = doc.querySelectorAll('flight')
  const result: AvinorFlight[] = []

  flights.forEach((f) => {
    const flightId     = f.getAttribute('uniqueID') ?? ''
    const airline      = f.querySelector('airline')?.textContent ?? ''
    const airport      = f.querySelector('airport')?.textContent ?? ''
    const schedText    = f.querySelector('schedule_time')?.textContent ?? ''
    const statusEl     = f.querySelector('status')
    const statusCode   = statusEl?.getAttribute('time') ? 'L' : (statusEl?.getAttribute('code') ?? 'N')
    const gate         = f.querySelector('gate')?.textContent ?? undefined

    if (!schedText) return
    result.push({
      flightId,
      airline,
      airport,
      airportName: AIRPORT_NAMES[airport] ?? airport,
      direction,
      scheduledTime: new Date(schedText),
      status:        parseStatus(statusCode),
      gate:          gate || undefined,
    })
  })
  return result
}

// Fallback: realistiske OSL-avganger/ankomster
function generateFallbackFlights(): AvinorFlight[] {
  const now    = new Date()
  const routes = [
    { id: 'SK451', al: 'SK', ap: 'CPH', dir: 'D' as const },
    { id: 'SK282', al: 'SK', ap: 'LHR', dir: 'D' as const },
    { id: 'DY630', al: 'DY', ap: 'AMS', dir: 'D' as const },
    { id: 'SK1473',al: 'SK', ap: 'BGO', dir: 'D' as const },
    { id: 'SK463', al: 'SK', ap: 'TRD', dir: 'D' as const },
    { id: 'LH867', al: 'LH', ap: 'FRA', dir: 'A' as const },
    { id: 'SK281', al: 'SK', ap: 'LHR', dir: 'A' as const },
    { id: 'AY671', al: 'AY', ap: 'HEL', dir: 'A' as const },
    { id: 'SK454', al: 'SK', ap: 'CPH', dir: 'A' as const },
    { id: 'EZY123',al: 'EZY',ap: 'BCN', dir: 'A' as const },
  ]
  const statuses: AvinorFlight['status'][] = ['on-time','on-time','on-time','delayed','landed','departed']
  return routes.map((r, i) => ({
    flightId:     r.id,
    airline:      r.al,
    airport:      r.ap,
    airportName:  AIRPORT_NAMES[r.ap] ?? r.ap,
    direction:    r.dir,
    scheduledTime: new Date(now.getTime() + (i - 4) * 25 * 60_000),
    status:       statuses[i % statuses.length],
    gate:         r.dir === 'D' ? `B${10 + i}` : undefined,
  }))
}

export async function fetchAvinorFlights(): Promise<AvinorFlight[]> {
  try {
    const [arrRes, depRes] = await Promise.all([
      fetch('/api/avinor/?TimeFrom=1&TimeTo=4&airport=OSL&direction=A', { signal: AbortSignal.timeout(6_000) }),
      fetch('/api/avinor/?TimeFrom=1&TimeTo=4&airport=OSL&direction=D', { signal: AbortSignal.timeout(6_000) }),
    ])

    if (!arrRes.ok || !depRes.ok) throw new Error('HTTP error')

    const [arrXml, depXml] = await Promise.all([arrRes.text(), depRes.text()])
    const flights = [
      ...parseAvinorXml(arrXml, 'A'),
      ...parseAvinorXml(depXml, 'D'),
    ].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())

    logger.info(MODULE, `Hentet ${flights.length} flybevegelser`)
    return flights
  } catch (err) {
    logger.warn(MODULE, 'Fallback avinor-data', err)
    return generateFallbackFlights()
  }
}
