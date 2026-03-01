import { logger } from '@/lib/logger'
import type {
  PolitiEvent,
  PolitiCategory,
  PolitiApiResponse,
  RawPolitiEvent,
} from '@/types/politiloggen'

const MODULE = 'politiloggen'

// ─── Fallback-data ────────────────────────────────────────────
// Brukes når API er utilgjengelig. Realistiske Oslo-hendelser.
const FALLBACK_EVENTS: PolitiEvent[] = [
  {
    id: 'fallback-1',
    category: 'Ro og orden',
    title: 'Bråk på utestedet',
    body: 'Melding om slåsskamp utenfor utested i Grønland. Patruljer sendt.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 8 * 60_000).toISOString(),
    status: 'Pågår',
    coordinates: { lat: 59.9107, lng: 10.7631 },
  },
  {
    id: 'fallback-2',
    category: 'Tyveri',
    title: 'Lommetyveri Karl Johans gate',
    body: 'Anmeldt lommetyveri. Fornærmede mistet mobiltelefon.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 22 * 60_000).toISOString(),
    status: 'Avsluttet',
    coordinates: { lat: 59.9128, lng: 10.7378 },
  },
  {
    id: 'fallback-3',
    category: 'Trafikk',
    title: 'Trafikkuhell E18 Lysaker',
    body: 'Mindre kollisjon, ingen personskade. Kjørefeltet delvis sperret.',
    district: 'Oslo',
    municipality: 'Bærum',
    timestamp: new Date(Date.now() - 35 * 60_000).toISOString(),
    status: 'Avsluttet',
    coordinates: { lat: 59.908, lng: 10.634 },
  },
  {
    id: 'fallback-4',
    category: 'Voldshendelse',
    title: 'Ran med kniv Tøyen',
    body: 'Person ranet med kniv. Gjerningsperson løp mot Grønland.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 55 * 60_000).toISOString(),
    status: 'Pågår',
    coordinates: { lat: 59.9155, lng: 10.7723 },
  },
  {
    id: 'fallback-5',
    category: 'Innbrudd',
    title: 'Innbrudd i leilighet Sagene',
    body: 'Beboer oppdaget innbrudd etter hjemkomst. Anmeldelse opprettes.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 80 * 60_000).toISOString(),
    status: 'Avsluttet',
    coordinates: { lat: 59.9312, lng: 10.7551 },
  },
  {
    id: 'fallback-6',
    category: 'Ro og orden',
    title: 'Støyplage Grünerløkka',
    body: 'Naboklage på festbråk. Enhet sendt for å regulere støynivå.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 100 * 60_000).toISOString(),
    status: 'Avsluttet',
    coordinates: { lat: 59.9218, lng: 10.7582 },
  },
  {
    id: 'fallback-7',
    category: 'Skadeverk',
    title: 'Hærverk på buss Stovner',
    body: 'Ruter melder om knust rute på buss linje 100. Avventer tekniker.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 130 * 60_000).toISOString(),
    status: 'Avsluttet',
    coordinates: { lat: 59.9487, lng: 10.9256 },
  },
  {
    id: 'fallback-8',
    category: 'Savnet',
    title: 'Savnet eldre person Nordstrand',
    body: 'Familie melder savnet person. Søk igangsatt i nærområdet.',
    district: 'Oslo',
    municipality: 'Oslo',
    timestamp: new Date(Date.now() - 160 * 60_000).toISOString(),
    status: 'Pågår',
    coordinates: { lat: 59.8733, lng: 10.8021 },
  },
]

// ─── Parser ────────────────────────────────────────────────────
function parseEvent(raw: RawPolitiEvent): PolitiEvent {
  const coords = raw.coordinates
  return {
    id:           raw.id ?? crypto.randomUUID(),
    category:     (raw.category as PolitiCategory) ?? 'Andre hendelser',
    title:        raw.title ?? 'Ukjent hendelse',
    body:         raw.body,
    district:     raw.district ?? 'Oslo',
    municipality: raw.municipality,
    timestamp:    raw.publishedTime ?? new Date().toISOString(),
    updatedTime:  raw.updatedTime,
    status:       (raw.status as PolitiEvent['status']) ?? 'Ukjent',
    coordinates:
      coords
        ? {
            lat: coords.latitude ?? coords.lat ?? 0,
            lng: coords.longitude ?? coords.lng ?? 0,
          }
        : undefined,
  }
}

// ─── Fetch ─────────────────────────────────────────────────────
export class PolitiloggenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PolitiloggenError'
  }
}

export async function fetchOsloEvents(params?: {
  count?: number
  category?: string
}): Promise<PolitiEvent[]> {
  const url = new URL('/api/politiloggen/messages', window.location.origin)
  url.searchParams.set('district', 'oslo')
  url.searchParams.set('count', String(params?.count ?? 100))
  if (params?.category) url.searchParams.set('category', params.category)

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    })

    if (!res.ok) throw new PolitiloggenError(`HTTP ${res.status}`)

    const json = (await res.json()) as PolitiApiResponse | RawPolitiEvent[]
    const raw: RawPolitiEvent[] = Array.isArray(json)
      ? json
      : (json.data ?? json.messages ?? [])

    logger.info(MODULE, `Hentet ${raw.length} hendelser`)

    // Data-kilde attribusjon: Politiloggen © Politiet, NLOD 2.0
    return raw.map(parseEvent)
  } catch (err) {
    if (err instanceof PolitiloggenError) {
      logger.warn(MODULE, `API-feil, bruker fallback: ${err.message}`)
    } else {
      logger.warn(MODULE, 'Nettverksfeil, bruker fallback', err)
    }
    return FALLBACK_EVENTS
  }
}

// ─── Exponential backoff util ──────────────────────────────────
export function calcBackoff(attempt: number, baseMs = 120_000): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30 * 60_000) // max 30 min
}
