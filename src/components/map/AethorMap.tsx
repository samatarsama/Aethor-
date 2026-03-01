import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import MapHud from './MapHud'
import type { MapCoords, MapLayer } from '@/types/map'
import { OSLO_VIEW, MAP_BOUNDS, CARTO_DARK_STYLE } from '@/types/map'

export default function AethorMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<maplibregl.Map | null>(null)

  const [coords, setCoords]             = useState<MapCoords | null>(null)
  const [zoom, setZoom]                 = useState(OSLO_VIEW.zoom)
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    new Set(['heatmap', 'markers'])
  )
  const [mapReady, setMapReady]         = useState(false)

  // Initialiser kartet
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container:   containerRef.current,
      style:       CARTO_DARK_STYLE,
      center:      OSLO_VIEW.center,
      zoom:        OSLO_VIEW.zoom,
      minZoom:     MAP_BOUNDS.minZoom,
      maxZoom:     MAP_BOUNDS.maxZoom,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', () => {
      setMapReady(true)
    })

    map.on('mousemove', (e) => {
      setCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    })

    map.on('mouseleave', () => {
      setCoords(null)
    })

    map.on('zoom', () => {
      setZoom(map.getZoom())
    })

    // Fjern MapLibre-logoen (vi bruker vår egen attribusjon i HUD)
    const logoEl = containerRef.current.querySelector('.maplibregl-ctrl-logo')
    logoEl?.remove()

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  const handleToggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layer)) {
        next.delete(layer)
      } else {
        next.add(layer)
      }
      return next
    })
  }, [])

  return (
    <div className="relative flex-1 w-full h-full">
      {/* MapLibre container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Initialiserings-overlay */}
      {!mapReady && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <polygon
              points="16,3 29,27 3,27"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="16" cy="16" r="3" fill="var(--color-primary)" />
          </svg>
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-mono font-bold tracking-widest text-glow"
              style={{ fontSize: '13px', letterSpacing: '0.25em', color: 'var(--color-primary)' }}
            >
              AETHOR
            </span>
            <span className="hud-label">LASTER KARTDATA...</span>
          </div>

          {/* Animert progress-bar */}
          <div
            className="w-48 h-px overflow-hidden"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full"
              style={{
                backgroundColor: 'var(--color-primary)',
                animation: 'mapload 1.8s ease-in-out infinite',
                width: '40%',
              }}
            />
          </div>
        </div>
      )}

      {/* HUD-overlay */}
      {mapReady && (
        <MapHud
          coords={coords}
          zoom={zoom}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />
      )}

      {/* Animasjon for loading-bar */}
      <style>{`
        @keyframes mapload {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}
