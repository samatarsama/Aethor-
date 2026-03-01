import type { VegvesenCamera } from '@/types/camera'

/**
 * Vegvesen webkamera i Oslo-regionen.
 * IDs fra Statens vegvesen DATEX II feed.
 * Kilde: https://dataut.vegvesen.no/dataset/webkamera — NLOD 2.0
 */
export const VEGVESEN_CAMERAS: VegvesenCamera[] = [
  { id: 'NO_TV_697',   name: 'E18 Lysaker',       lat: 59.908,  lng: 10.634,  road: 'E18' },
  { id: 'NO_TV_499',   name: 'E6 Oslo S',          lat: 59.911,  lng: 10.753,  road: 'E6' },
  { id: 'NO_TV_502',   name: 'Ring 3 Sinsen',      lat: 59.943,  lng: 10.787,  road: 'Ring 3' },
  { id: 'NO_TV_509',   name: 'E18 Sandvika',       lat: 59.886,  lng: 10.521,  road: 'E18' },
  { id: 'NO_TV_1553',  name: 'Rv150 Ulvern',       lat: 59.900,  lng: 10.823,  road: 'Rv150' },
  { id: 'NO_TV_1079',  name: 'Operatunnelen',      lat: 59.909,  lng: 10.740,  road: 'E18' },
  { id: 'NO_TV_697',   name: 'Festningstunnelen',  lat: 59.909,  lng: 10.728,  road: 'Rv163' },
  { id: 'NO_TV_1246',  name: 'E6 Furuset',         lat: 59.942,  lng: 10.878,  road: 'E6' },
]

/** Bygg snapshot-URL for et kamera. Timestamp tvinger refresh av img-cache. */
export function getCameraUrl(cameraId: string, ts?: number): string {
  const base = import.meta.env.VITE_VEGVESEN_BASE ?? 'https://webkamera.vegvesen.no/public'
  const t    = ts ?? Date.now()
  return `${base}/kamera?id=${cameraId}&t=${t}`
}
