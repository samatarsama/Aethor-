import { useEffect, useMemo } from 'react'
import type maplibregl from 'maplibre-gl'
import type { MapLayer } from '@/types/map'
import { useEventsStore } from '@/store/eventsStore'
import { eventsToGeoJSON } from '@/lib/eventsToGeoJSON'

const SOURCE_ID = 'aethor-events'
const HEATMAP_LAYER_ID = 'aethor-heatmap'

/**
 * Synkroniserer events og lag-synlighet til et MapLibre-kart.
 * Kalles etter kartet er klart (mapReady = true).
 */
export function useMapLayers(
  mapRef: React.RefObject<maplibregl.Map | null>,
  mapReady: boolean,
  activeLayers: Set<MapLayer>,
) {
  const events = useEventsStore((s) => s.events)

  // GeoJSON reberegnes kun når events endrer seg
  const geojson = useMemo(() => eventsToGeoJSON(events), [events])

  // ─── Init: legg til source + heatmap-layer ───────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    // Source
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: geojson,
      })
    }

    // Heatmap-layer
    if (!map.getLayer(HEATMAP_LAYER_ID)) {
      map.addLayer({
        id:     HEATMAP_LAYER_ID,
        type:   'heatmap',
        source: SOURCE_ID,
        paint: {
          // Vekt basert på intensitet-property (0–5)
          'heatmap-weight': [
            'interpolate', ['linear'],
            ['get', 'intensity'],
            0, 0,
            5, 1,
          ],
          // Øk intensiteten ved høy zoom
          'heatmap-intensity': [
            'interpolate', ['linear'],
            ['zoom'],
            9,  0.6,
            14, 2,
            18, 4,
          ],
          // Amber → rød fargeskala (Aethor-palett)
          'heatmap-color': [
            'interpolate', ['linear'],
            ['heatmap-density'],
            0,    'rgba(10,10,10,0)',
            0.15, 'rgba(30,58,95,0.5)',
            0.4,  'rgba(249,115,22,0.65)',
            0.65, 'rgba(234,88,12,0.82)',
            0.85, 'rgba(239,68,68,0.92)',
            1,    'rgba(239,68,68,1)',
          ],
          // Radius vokser med zoom
          'heatmap-radius': [
            'interpolate', ['linear'],
            ['zoom'],
            9,  20,
            13, 40,
            18, 70,
          ],
          'heatmap-opacity': 0.78,
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady])

  // ─── Oppdater source-data når events endrer seg ───────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current
    const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    src?.setData(geojson)
  }, [geojson, mapReady, mapRef])

  // ─── Toggle lag-synlighet ─────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    const visibility = activeLayers.has('heatmap') ? 'visible' : 'none'
    if (map.getLayer(HEATMAP_LAYER_ID)) {
      map.setLayoutProperty(HEATMAP_LAYER_ID, 'visibility', visibility)
    }
  }, [activeLayers, mapReady, mapRef])
}
