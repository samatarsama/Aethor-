import type { PolitiCategory } from '@/types/politiloggen'

export interface District {
  id:       string
  name:     string
  center:   [number, number]  // [lng, lat]
  radiusM:  number
  baseline: number            // 0–100
  /** Kategorier som historisk er vanligst i dette området */
  typicalTypes: PolitiCategory[]
}

/**
 * Oslo-bydeler med kriminalitetsbaseline.
 * Basert på statistikk.oslo.kommune.no — kriminalitetsstatistikk 2023.
 */
export const DISTRICTS: District[] = [
  {
    id: 'gronland',
    name: 'Grønland',
    center: [10.7631, 59.9107],
    radiusM: 600,
    baseline: 88,
    typicalTypes: ['Ro og orden', 'Voldshendelse', 'Tyveri'],
  },
  {
    id: 'toyen',
    name: 'Tøyen',
    center: [10.7723, 59.9155],
    radiusM: 600,
    baseline: 82,
    typicalTypes: ['Ro og orden', 'Tyveri', 'Skadeverk'],
  },
  {
    id: 'sentrum',
    name: 'Sentrum',
    center: [10.7378, 59.9128],
    radiusM: 900,
    baseline: 75,
    typicalTypes: ['Tyveri', 'Ro og orden', 'Voldshendelse'],
  },
  {
    id: 'stovner',
    name: 'Stovner',
    center: [10.9256, 59.9487],
    radiusM: 900,
    baseline: 70,
    typicalTypes: ['Ro og orden', 'Skadeverk', 'Tyveri'],
  },
  {
    id: 'romsas',
    name: 'Romsås',
    center: [10.9001, 59.9584],
    radiusM: 700,
    baseline: 68,
    typicalTypes: ['Ro og orden', 'Skadeverk'],
  },
  {
    id: 'grunerlokka',
    name: 'Grünerløkka',
    center: [10.7582, 59.9218],
    radiusM: 800,
    baseline: 55,
    typicalTypes: ['Tyveri', 'Ro og orden', 'Skadeverk'],
  },
  {
    id: 'holmlia',
    name: 'Holmlia',
    center: [10.8134, 59.8521],
    radiusM: 800,
    baseline: 52,
    typicalTypes: ['Ro og orden', 'Voldshendelse'],
  },
  {
    id: 'alna',
    name: 'Alna',
    center: [10.8621, 59.9301],
    radiusM: 1100,
    baseline: 48,
    typicalTypes: ['Tyveri', 'Innbrudd', 'Trafikk'],
  },
  {
    id: 'gamleoslo',
    name: 'Gamle Oslo',
    center: [10.7750, 59.9060],
    radiusM: 900,
    baseline: 45,
    typicalTypes: ['Ro og orden', 'Tyveri'],
  },
  {
    id: 'sagene',
    name: 'Sagene',
    center: [10.7551, 59.9312],
    radiusM: 800,
    baseline: 38,
    typicalTypes: ['Skadeverk', 'Tyveri'],
  },
  {
    id: 'grorud',
    name: 'Grorud',
    center: [10.8712, 59.9456],
    radiusM: 900,
    baseline: 36,
    typicalTypes: ['Innbrudd', 'Tyveri'],
  },
  {
    id: 'bjerke',
    name: 'Bjerke',
    center: [10.8012, 59.9389],
    radiusM: 800,
    baseline: 32,
    typicalTypes: ['Trafikk', 'Tyveri'],
  },
  {
    id: 'frogner',
    name: 'Frogner',
    center: [10.7001, 59.9212],
    radiusM: 900,
    baseline: 25,
    typicalTypes: ['Tyveri', 'Innbrudd'],
  },
  {
    id: 'majorstuen',
    name: 'Majorstuen',
    center: [10.7145, 59.9301],
    radiusM: 700,
    baseline: 22,
    typicalTypes: ['Tyveri', 'Ro og orden'],
  },
  {
    id: 'nordstrand',
    name: 'Nordstrand',
    center: [10.8021, 59.8733],
    radiusM: 1000,
    baseline: 18,
    typicalTypes: ['Innbrudd', 'Trafikk'],
  },
  {
    id: 'ostensjø',
    name: 'Østensjø',
    center: [10.8312, 59.8901],
    radiusM: 900,
    baseline: 16,
    typicalTypes: ['Innbrudd', 'Tyveri'],
  },
  {
    id: 'ullern',
    name: 'Ullern',
    center: [10.6312, 59.9101],
    radiusM: 900,
    baseline: 12,
    typicalTypes: ['Innbrudd', 'Trafikk'],
  },
  {
    id: 'vestreaker',
    name: 'Vestre Aker',
    center: [10.6612, 59.9501],
    radiusM: 1400,
    baseline: 10,
    typicalTypes: ['Innbrudd', 'Dyr'],
  },
  {
    id: 'nordreaker',
    name: 'Nordre Aker',
    center: [10.7456, 59.9612],
    radiusM: 1400,
    baseline: 12,
    typicalTypes: ['Innbrudd', 'Trafikk'],
  },
  {
    id: 'sondrenordstrand',
    name: 'Søndre Nordstrand',
    center: [10.7901, 59.8312],
    radiusM: 1300,
    baseline: 28,
    typicalTypes: ['Ro og orden', 'Skadeverk'],
  },
]
