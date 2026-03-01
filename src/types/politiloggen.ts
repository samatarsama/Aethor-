export type PolitiCategory =
  | 'Voldshendelse'
  | 'Tyveri'
  | 'Innbrudd'
  | 'Ro og orden'
  | 'Trafikk'
  | 'Brann'
  | 'Redning'
  | 'Savnet'
  | 'Sjø'
  | 'Skadeverk'
  | 'Dyr'
  | 'Arrangement'
  | 'Vær'
  | 'Andre hendelser'

export type EventStatus = 'Pågår' | 'Avsluttet' | 'Ukjent'

export interface PolitiEvent {
  id: string
  category: PolitiCategory
  title: string
  body?: string
  district: string
  municipality?: string
  timestamp: string       // ISO 8601
  updatedTime?: string
  status: EventStatus
  coordinates?: {
    lat: number
    lng: number
  }
}

/** Rå API-respons fra Politiloggen */
export interface PolitiApiResponse {
  data?: RawPolitiEvent[]
  messages?: RawPolitiEvent[]
}

export interface RawPolitiEvent {
  id: string
  category?: string
  title?: string
  body?: string
  district?: string
  municipality?: string
  publishedTime?: string
  updatedTime?: string
  status?: string
  coordinates?: {
    latitude?: number
    longitude?: number
    lat?: number
    lng?: number
  }
}

/** Severity per kategori — brukes for sortering og farging */
export const CATEGORY_SEVERITY: Record<PolitiCategory, number> = {
  'Voldshendelse':    5,
  'Brann':            5,
  'Redning':          4,
  'Savnet':           4,
  'Innbrudd':         3,
  'Tyveri':           3,
  'Ro og orden':      2,
  'Skadeverk':        2,
  'Trafikk':          2,
  'Sjø':              2,
  'Arrangement':      1,
  'Dyr':              1,
  'Vær':              1,
  'Andre hendelser':  1,
}

export const CATEGORY_COLOR: Record<PolitiCategory, string> = {
  'Voldshendelse':    'var(--color-critical)',
  'Brann':            'var(--color-critical)',
  'Redning':          'var(--color-warning)',
  'Savnet':           'var(--color-warning)',
  'Innbrudd':         'var(--color-primary)',
  'Tyveri':           'var(--color-primary)',
  'Ro og orden':      'var(--color-text-mono)',
  'Skadeverk':        'var(--color-text-mono)',
  'Trafikk':          'var(--color-info)',
  'Sjø':              'var(--color-info)',
  'Arrangement':      'var(--color-info)',
  'Dyr':              'var(--color-info)',
  'Vær':              'var(--color-info)',
  'Andre hendelser':  'var(--color-text-dim)',
}
