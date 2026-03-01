import type { PolitiEvent } from '@/types/politiloggen'
import { CATEGORY_SEVERITY } from '@/types/politiloggen'

export interface EventFeatureProperties {
  id:        string
  category:  string
  title:     string
  status:    string
  intensity: number   // 0–5, brukes av heatmap-weight
  severity:  number   // 1–5, kategori-basert
  active:    0 | 1    // 1 = Pågår
}

export type EventFeature = GeoJSON.Feature<
  GeoJSON.Point,
  EventFeatureProperties
>

export type EventFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  EventFeatureProperties
>

/**
 * Konverter PolitiEvent[] til GeoJSON FeatureCollection.
 * Bare events med koordinater inkluderes.
 * Intensitet = severity × boost (aktive hendelser får 1.6×).
 */
export function eventsToGeoJSON(events: PolitiEvent[]): EventFeatureCollection {
  const features: EventFeature[] = events
    .filter((e) => e.coordinates)
    .map((e) => {
      const severity  = CATEGORY_SEVERITY[e.category] ?? 1
      const active    = e.status === 'Pågår'
      const intensity = Math.min(5, severity * (active ? 1.6 : 1))

      return {
        type: 'Feature',
        geometry: {
          type:        'Point',
          coordinates: [e.coordinates!.lng, e.coordinates!.lat],
        },
        properties: {
          id:        e.id,
          category:  e.category,
          title:     e.title,
          status:    e.status,
          intensity,
          severity,
          active:    active ? 1 : 0,
        },
      }
    })

  return { type: 'FeatureCollection', features }
}
