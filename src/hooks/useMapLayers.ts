import { useEffect, useMemo } from 'react'
import type maplibregl from 'maplibre-gl'
import type { MapLayer } from '@/types/map'
import { useEventsStore } from '@/store/eventsStore'
import { usePredictionStore } from '@/store/predictionStore'
import { eventsToGeoJSON } from '@/lib/eventsToGeoJSON'
import type { PredictionZone, RiskLevel } from '@/prediction/engine'

const SOURCE_EVENTS     = 'aethor-events'
const SOURCE_PREDICTION = 'aethor-prediction'
const LAYER_HEATMAP     = 'aethor-heatmap'
const LAYER_PRED_FILL   = 'aethor-pred-fill'
const LAYER_PRED_BORDER = 'aethor-pred-border'
const LAYER_PRED_LABEL  = 'aethor-pred-label'

const RISK_FILL_COLOR: Record<RiskLevel, string> = {
  KRITISK: 'rgba(239,68,68,0.13)',
  HØY:     'rgba(245,158,11,0.10)',
  MIDDELS: 'rgba(249,115,22,0.07)',
  LAV:     'rgba(107,114,128,0.05)',
}
const RISK_STROKE_COLOR: Record<RiskLevel, string> = {
  KRITISK: 'rgba(239,68,68,0.75)',
  HØY:     'rgba(245,158,11,0.65)',
  MIDDELS: 'rgba(249,115,22,0.50)',
  LAV:     'rgba(107,114,128,0.30)',
}

/** Konverter prediksjonssoner til GeoJSON sirkler (approx polygon) */
function zonesToGeoJSON(zones: PredictionZone[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = zones.map((z) => {
    const [lng, lat] = z.center
    const points     = 48
    const earthR     = 6_371_000
    const dLat       = (z.radiusM / earthR) * (180 / Math.PI)
    const dLng       = dLat / Math.cos((lat * Math.PI) / 180)

    const coords: [number, number][] = Array.from({ length: points + 1 }, (_, i) => {
      const angle = (i / points) * 2 * Math.PI
      return [
        lng + dLng * Math.cos(angle),
        lat + dLat * Math.sin(angle),
      ]
    })

    return {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {
        id:        z.id,
        name:      z.name,
        riskLevel: z.riskLevel,
        riskScore: z.riskScore,
        fillColor:   RISK_FILL_COLOR[z.riskLevel],
        strokeColor: RISK_STROKE_COLOR[z.riskLevel],
      },
    }
  })
  return { type: 'FeatureCollection', features }
}

export function useMapLayers(
  mapRef: React.RefObject<maplibregl.Map | null>,
  mapReady: boolean,
  activeLayers: Set<MapLayer>,
) {
  const events = useEventsStore((s) => s.events)
  const zones  = usePredictionStore((s) => s.zones)

  const eventsGeoJSON     = useMemo(() => eventsToGeoJSON(events), [events])
  const predictionGeoJSON = useMemo(() => zonesToGeoJSON(zones),   [zones])

  // ─── Init sources + layers ────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    // Events source + heatmap
    if (!map.getSource(SOURCE_EVENTS)) {
      map.addSource(SOURCE_EVENTS, { type: 'geojson', data: eventsGeoJSON })
    }
    if (!map.getLayer(LAYER_HEATMAP)) {
      map.addLayer({
        id: LAYER_HEATMAP, type: 'heatmap', source: SOURCE_EVENTS,
        paint: {
          'heatmap-weight':     ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 5, 1],
          'heatmap-intensity':  ['interpolate', ['linear'], ['zoom'], 9, 0.6, 14, 2, 18, 4],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(10,10,10,0)',
            0.15, 'rgba(30,58,95,0.5)',
            0.4,  'rgba(249,115,22,0.65)',
            0.65, 'rgba(234,88,12,0.82)',
            0.85, 'rgba(239,68,68,0.92)',
            1,    'rgba(239,68,68,1)',
          ],
          'heatmap-radius':   ['interpolate', ['linear'], ['zoom'], 9, 20, 13, 40, 18, 70],
          'heatmap-opacity':  0.78,
        },
      })
    }

    // Prediction source + layers
    if (!map.getSource(SOURCE_PREDICTION)) {
      map.addSource(SOURCE_PREDICTION, { type: 'geojson', data: predictionGeoJSON })
    }
    if (!map.getLayer(LAYER_PRED_FILL)) {
      map.addLayer({
        id: LAYER_PRED_FILL, type: 'fill', source: SOURCE_PREDICTION,
        paint: {
          'fill-color':   ['get', 'fillColor'],
          'fill-opacity': 1,
        },
      })
    }
    if (!map.getLayer(LAYER_PRED_BORDER)) {
      map.addLayer({
        id: LAYER_PRED_BORDER, type: 'line', source: SOURCE_PREDICTION,
        paint: {
          'line-color':     ['get', 'strokeColor'],
          'line-width':     1,
          'line-dasharray': [3, 2],
        },
      })
    }
    if (!map.getLayer(LAYER_PRED_LABEL)) {
      map.addLayer({
        id: LAYER_PRED_LABEL, type: 'symbol', source: SOURCE_PREDICTION,
        layout: {
          'text-field':           ['get', 'name'],
          'text-size':            10,
          'text-font':            ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-anchor':          'center',
          'text-allow-overlap':   false,
        },
        paint: {
          'text-color':      '#A3A3A3',
          'text-halo-color': '#0A0A0A',
          'text-halo-width': 1,
        },
        minzoom: 11,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady])

  // ─── Oppdater events source ───────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const src = mapRef.current.getSource(SOURCE_EVENTS) as maplibregl.GeoJSONSource | undefined
    src?.setData(eventsGeoJSON)
  }, [eventsGeoJSON, mapReady, mapRef])

  // ─── Oppdater prediction source ───────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const src = mapRef.current.getSource(SOURCE_PREDICTION) as maplibregl.GeoJSONSource | undefined
    src?.setData(predictionGeoJSON)
  }, [predictionGeoJSON, mapReady, mapRef])

  // ─── Toggle lag-synlighet ─────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    const pairs: [string, MapLayer][] = [
      [LAYER_HEATMAP,     'heatmap'],
      [LAYER_PRED_FILL,   'prediction'],
      [LAYER_PRED_BORDER, 'prediction'],
      [LAYER_PRED_LABEL,  'prediction'],
    ]
    for (const [layerId, toggle] of pairs) {
      const vis = activeLayers.has(toggle) ? 'visible' : 'none'
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', vis)
      }
    }
  }, [activeLayers, mapReady, mapRef])

  // ─── Fly-to ved valgt event ───────────────────────────────
  const selectedEventId = useEventsStore((s) => s.selectedEventId)

  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedEventId) return
    const event = useEventsStore.getState().events.find((e) => e.id === selectedEventId)
    if (!event?.coordinates) return

    mapRef.current.flyTo({
      center:    [event.coordinates.lng, event.coordinates.lat],
      zoom:      Math.max(mapRef.current.getZoom(), 14),
      duration:  900,
      essential: true,
    })
  }, [selectedEventId, mapReady, mapRef])
}
