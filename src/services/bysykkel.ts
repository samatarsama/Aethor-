import { logger } from '@/lib/logger'
import type { BysykkelStation } from '@/types/osint'

const MODULE = 'bysykkel'
const BASE   = 'https://gbfs.urbansharing.com/oslobysykkel'

interface GbfsStationInfo {
  data: { stations: Array<{ station_id: string; name: string; lat: number; lon: number; capacity: number }> }
}
interface GbfsStationStatus {
  data: { stations: Array<{ station_id: string; num_bikes_available: number; num_docks_available: number; is_renting: number }> }
}

// Fallback-stasjoner for når API ikke er tilgjengelig
const FALLBACK_STATIONS: BysykkelStation[] = [
  { id: '627', name: 'Aker Brygge',          lat: 59.9097, lng: 10.7278, capacity: 26, bikesAvailable: 8,  docksAvailable: 18, isRenting: true },
  { id: '410', name: 'Jernbanetorget',        lat: 59.9114, lng: 10.7505, capacity: 20, bikesAvailable: 3,  docksAvailable: 17, isRenting: true },
  { id: '384', name: 'Youngstorget',          lat: 59.9157, lng: 10.7479, capacity: 15, bikesAvailable: 11, docksAvailable: 4,  isRenting: true },
  { id: '523', name: 'Grønland',              lat: 59.9101, lng: 10.7631, capacity: 18, bikesAvailable: 0,  docksAvailable: 18, isRenting: false },
  { id: '581', name: 'Tøyen Park',            lat: 59.9155, lng: 10.7723, capacity: 22, bikesAvailable: 14, docksAvailable: 8,  isRenting: true },
  { id: '449', name: 'Olaf Ryes plass',       lat: 59.9226, lng: 10.7577, capacity: 20, bikesAvailable: 6,  docksAvailable: 14, isRenting: true },
  { id: '484', name: 'Stortinget',            lat: 59.9134, lng: 10.7389, capacity: 24, bikesAvailable: 9,  docksAvailable: 15, isRenting: true },
  { id: '401', name: 'Nydalen T-bane',        lat: 59.9512, lng: 10.7645, capacity: 16, bikesAvailable: 4,  docksAvailable: 12, isRenting: true },
]

export async function fetchBysykkelStations(): Promise<BysykkelStation[]> {
  try {
    const [infoRes, statusRes] = await Promise.all([
      fetch(`${BASE}/station_information.json`, { signal: AbortSignal.timeout(6_000) }),
      fetch(`${BASE}/station_status.json`,      { signal: AbortSignal.timeout(6_000) }),
    ])

    if (!infoRes.ok || !statusRes.ok) throw new Error('HTTP error')

    const info   = (await infoRes.json())   as GbfsStationInfo
    const status = (await statusRes.json()) as GbfsStationStatus

    const statusMap = new Map(
      status.data.stations.map((s) => [s.station_id, s])
    )

    const stations: BysykkelStation[] = info.data.stations.map((s) => {
      const st = statusMap.get(s.station_id)
      return {
        id:             s.station_id,
        name:           s.name,
        lat:            s.lat,
        lng:            s.lon,
        capacity:       s.capacity,
        bikesAvailable: st?.num_bikes_available ?? 0,
        docksAvailable: st?.num_docks_available ?? 0,
        isRenting:      (st?.is_renting ?? 0) === 1,
      }
    })

    logger.info(MODULE, `Hentet ${stations.length} bysykkel-stasjoner`)
    return stations
  } catch (err) {
    logger.warn(MODULE, 'Fallback bysykkel-data', err)
    return FALLBACK_STATIONS
  }
}
