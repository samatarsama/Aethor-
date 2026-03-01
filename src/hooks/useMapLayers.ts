import { useEffect, useMemo } from 'react'
import type maplibregl from 'maplibre-gl'
import type { MapLayer } from '@/types/map'
import { useEventsStore } from '@/store/eventsStore'
import { usePredictionStore } from '@/store/predictionStore'
import { useOsintStore } from '@/store/osintStore'
import { eventsToGeoJSON } from '@/lib/eventsToGeoJSON'
import type { PredictionZone, RiskLevel } from '@/prediction/engine'

const SOURCE_EVENTS     = 'aethor-events'
const SOURCE_PREDICTION = 'aethor-prediction'
const SOURCE_BYSYKKEL   = 'aethor-bysykkel'
const SOURCE_SHIPS      = 'aethor-ships'

const LAYER_HEATMAP     = 'aethor-heatmap'
const LAYER_MARKERS     = 'aethor-markers'
const LAYER_PRED_FILL   = 'aethor-pred-fill'
const LAYER_PRED_BORDER = 'aethor-pred-border'
const LAYER_PRED_LABEL  = 'aethor-pred-label'
const LAYER_BYSYKKEL    = 'aethor-bysykkel-circles'
const LAYER_BYSYKKEL_LBL= 'aethor-bysykkel-labels'
const LAYER_SHIPS       = 'aethor-ships-circles'
const LAYER_SHIPS_LBL   = 'aethor-ships-labels'

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

function zonesToGeoJSON(zones: PredictionZone[]): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = zones.map((z) => {
    const [lng, lat] = z.center
    const points = 48
    const earthR = 6_371_000
    const dLat   = (z.radiusM / earthR) * (180 / Math.PI)
    const dLng   = dLat / Math.cos((lat * Math.PI) / 180)
    const coords: [number, number][] = Array.from({ length: points + 1 }, (_, i) => {
      const angle = (i / points) * 2 * Math.PI
      return [lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]
    })
    return {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {
        id: z.id, name: z.name, riskLevel: z.riskLevel, riskScore: z.riskScore,
        fillColor: RISK_FILL_COLOR[z.riskLevel], strokeColor: RISK_STROKE_COLOR[z.riskLevel],
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
  const events   = useEventsStore((s) => s.events)
  const zones    = usePredictionStore((s) => s.zones)
  const stations = useOsintStore((s) => s.stations)
  const ships    = useOsintStore((s) => s.ships)

  const eventsGeoJSON     = useMemo(() => eventsToGeoJSON(events), [events])
  const predictionGeoJSON = useMemo(() => zonesToGeoJSON(zones),   [zones])

  const bysykkelGeoJSON = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: stations.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { name: s.name, bikes: s.bikesAvailable, docks: s.docksAvailable, renting: s.isRenting ? 1 : 0 },
    })),
  }), [stations])

  const shipsGeoJSON = useMemo((): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: ships.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { name: s.name, speed: s.speedKnots, heading: s.heading, type: s.shipType },
    })),
  }), [ships])

  // ─── Init alle sources + layers ───────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    // Events source
    if (!map.getSource(SOURCE_EVENTS)) {
      map.addSource(SOURCE_EVENTS, { type: 'geojson', data: eventsGeoJSON })
    }
    // Heatmap
    if (!map.getLayer(LAYER_HEATMAP)) {
      map.addLayer({
        id: LAYER_HEATMAP, type: 'heatmap', source: SOURCE_EVENTS,
        paint: {
          'heatmap-weight':    ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 5, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.6, 14, 2, 18, 4],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(10,10,10,0)', 0.15, 'rgba(30,58,95,0.5)',
            0.4, 'rgba(249,115,22,0.65)', 0.65, 'rgba(234,88,12,0.82)',
            0.85, 'rgba(239,68,68,0.92)', 1, 'rgba(239,68,68,1)',
          ],
          'heatmap-radius':  ['interpolate', ['linear'], ['zoom'], 9, 20, 13, 40, 18, 70],
          'heatmap-opacity': 0.78,
        },
      })
    }
    // Event markers (sirkler ved høy zoom)
    if (!map.getLayer(LAYER_MARKERS)) {
      map.addLayer({
        id: LAYER_MARKERS, type: 'circle', source: SOURCE_EVENTS,
        minzoom: 13,
        paint: {
          'circle-radius':       ['interpolate', ['linear'], ['zoom'], 13, 4, 18, 10],
          'circle-color': [
            'match', ['get', 'category'],
            'Voldshendelse', '#EF4444',
            'Brann',         '#EF4444',
            'Redning',       '#F59E0B',
            'Savnet',        '#F59E0B',
            'Innbrudd',      '#F97316',
            'Tyveri',        '#F97316',
            'Trafikk',       '#3B82F6',
            'Sjø',           '#3B82F6',
            'Arrangement',   '#3B82F6',
            /* default */    '#A3A3A3',
          ],
          'circle-stroke-width': ['case', ['==', ['get', 'active'], 1], 1.5, 1],
          'circle-stroke-color': ['case', ['==', ['get', 'active'], 1], '#F97316', 'rgba(0,0,0,0.5)'],
          'circle-opacity':      ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.9],
        },
      })
    }

    // Prediction source + layers
    if (!map.getSource(SOURCE_PREDICTION)) {
      map.addSource(SOURCE_PREDICTION, { type: 'geojson', data: predictionGeoJSON })
    }
    if (!map.getLayer(LAYER_PRED_FILL)) {
      map.addLayer({ id: LAYER_PRED_FILL, type: 'fill', source: SOURCE_PREDICTION,
        paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': 1 } })
    }
    if (!map.getLayer(LAYER_PRED_BORDER)) {
      map.addLayer({ id: LAYER_PRED_BORDER, type: 'line', source: SOURCE_PREDICTION,
        paint: { 'line-color': ['get', 'strokeColor'], 'line-width': 1, 'line-dasharray': [3, 2] } })
    }
    if (!map.getLayer(LAYER_PRED_LABEL)) {
      map.addLayer({ id: LAYER_PRED_LABEL, type: 'symbol', source: SOURCE_PREDICTION,
        layout: {
          'text-field': ['get', 'name'], 'text-size': 10,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-anchor': 'center', 'text-allow-overlap': false,
        },
        paint: { 'text-color': '#A3A3A3', 'text-halo-color': '#0A0A0A', 'text-halo-width': 1 },
        minzoom: 11,
      })
    }

    // Bysykkel source + layer
    if (!map.getSource(SOURCE_BYSYKKEL)) {
      map.addSource(SOURCE_BYSYKKEL, { type: 'geojson', data: bysykkelGeoJSON })
    }
    if (!map.getLayer(LAYER_BYSYKKEL)) {
      map.addLayer({ id: LAYER_BYSYKKEL, type: 'circle', source: SOURCE_BYSYKKEL,
        paint: {
          'circle-radius':       5,
          'circle-color':        ['case', ['==', ['get', 'renting'], 1], '#22C55E', '#525252'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#0A0A0A',
          'circle-opacity':      0.9,
        },
      })
    }
    if (!map.getLayer(LAYER_BYSYKKEL_LBL)) {
      map.addLayer({ id: LAYER_BYSYKKEL_LBL, type: 'symbol', source: SOURCE_BYSYKKEL,
        layout: {
          'text-field': ['concat', ['to-string', ['get', 'bikes']], '🚲'],
          'text-size':  10, 'text-offset': [0, -1.2],
          'text-font':  ['Open Sans Regular', 'Arial Unicode MS Regular'],
        },
        paint: { 'text-color': '#E5E5E5', 'text-halo-color': '#0A0A0A', 'text-halo-width': 1 },
        minzoom: 13,
      })
    }

    // AIS Ships source + layer
    if (!map.getSource(SOURCE_SHIPS)) {
      map.addSource(SOURCE_SHIPS, { type: 'geojson', data: shipsGeoJSON })
    }
    if (!map.getLayer(LAYER_SHIPS)) {
      map.addLayer({ id: LAYER_SHIPS, type: 'circle', source: SOURCE_SHIPS,
        paint: {
          'circle-radius':       6,
          'circle-color':        '#6B7280',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#F97316',
          'circle-opacity':      0.85,
        },
      })
    }
    if (!map.getLayer(LAYER_SHIPS_LBL)) {
      map.addLayer({ id: LAYER_SHIPS_LBL, type: 'symbol', source: SOURCE_SHIPS,
        layout: {
          'text-field': ['get', 'name'], 'text-size': 9, 'text-offset': [0, -1.4],
          'text-font':  ['Open Sans Regular', 'Arial Unicode MS Regular'],
        },
        paint: { 'text-color': '#A3A3A3', 'text-halo-color': '#0A0A0A', 'text-halo-width': 1 },
        minzoom: 11,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady])

  // ─── Data-sync effects ─────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const src = mapRef.current.getSource(SOURCE_EVENTS) as maplibregl.GeoJSONSource | undefined
    src?.setData(eventsGeoJSON)
  }, [eventsGeoJSON, mapReady, mapRef])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const src = mapRef.current.getSource(SOURCE_PREDICTION) as maplibregl.GeoJSONSource | undefined
    src?.setData(predictionGeoJSON)
  }, [predictionGeoJSON, mapReady, mapRef])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const src = mapRef.current.getSource(SOURCE_BYSYKKEL) as maplibregl.GeoJSONSource | undefined
    src?.setData(bysykkelGeoJSON)
  }, [bysykkelGeoJSON, mapReady, mapRef])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const src = mapRef.current.getSource(SOURCE_SHIPS) as maplibregl.GeoJSONSource | undefined
    src?.setData(shipsGeoJSON)
  }, [shipsGeoJSON, mapReady, mapRef])

  // ─── Layer visibility ──────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current
    const pairs: [string, MapLayer][] = [
      [LAYER_HEATMAP,      'heatmap'],
      [LAYER_MARKERS,      'markers'],
      [LAYER_PRED_FILL,    'prediction'],
      [LAYER_PRED_BORDER,  'prediction'],
      [LAYER_PRED_LABEL,   'prediction'],
      [LAYER_BYSYKKEL,     'bysykkel'],
      [LAYER_BYSYKKEL_LBL, 'bysykkel'],
      [LAYER_SHIPS,        'ships'],
      [LAYER_SHIPS_LBL,    'ships'],
    ]
    for (const [layerId, toggle] of pairs) {
      const vis = activeLayers.has(toggle) ? 'visible' : 'none'
      if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', vis)
    }
  }, [activeLayers, mapReady, mapRef])

  // ─── Fly-to selected event ─────────────────────────────────
  const selectedEventId = useEventsStore((s) => s.selectedEventId)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedEventId) return
    const event = useEventsStore.getState().events.find((e) => e.id === selectedEventId)
    if (!event?.coordinates) return
    mapRef.current.flyTo({
      center: [event.coordinates.lng, event.coordinates.lat],
      zoom: Math.max(mapRef.current.getZoom(), 14), duration: 900, essential: true,
    })
  }, [selectedEventId, mapReady, mapRef])

  // ─── Fly-to selected zone ──────────────────────────────────
  const selectedZoneId = usePredictionStore((s) => s.selectedZoneId)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedZoneId) return
    const zone = usePredictionStore.getState().zones.find((z) => z.id === selectedZoneId)
    if (!zone) return
    mapRef.current.flyTo({ center: zone.center, zoom: Math.max(mapRef.current.getZoom(), 13), duration: 800, essential: true })
  }, [selectedZoneId, mapReady, mapRef])

  // ─── Map click → select event marker ──────────────────────
  const selectEvent = useEventsStore((s) => s.selectEvent)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const map = mapRef.current

    const onClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_MARKERS] })
      if (features.length > 0) {
        const id = features[0].properties?.id as string | undefined
        if (id) selectEvent(id)
      }
    }
    const onEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onLeave = () => { map.getCanvas().style.cursor = '' }

    map.on('click', LAYER_MARKERS, onClick)
    map.on('mouseenter', LAYER_MARKERS, onEnter)
    map.on('mouseleave', LAYER_MARKERS, onLeave)
    return () => {
      map.off('click', LAYER_MARKERS, onClick)
      map.off('mouseenter', LAYER_MARKERS, onEnter)
      map.off('mouseleave', LAYER_MARKERS, onLeave)
    }
  }, [mapReady, mapRef, selectEvent])
}
