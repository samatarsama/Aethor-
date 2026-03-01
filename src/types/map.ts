export type MapLayer = 'heatmap' | 'markers' | 'prediction'

export interface MapCoords {
  lat: number
  lng: number
}

export interface MapViewState {
  center: [number, number]
  zoom: number
}

export const OSLO_VIEW: MapViewState = {
  center: [10.7522, 59.9139],
  zoom: 12,
}

export const MAP_BOUNDS = {
  minZoom: 9,
  maxZoom: 18,
}

export const CARTO_DARK_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
