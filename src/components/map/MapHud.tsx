import { Layers, Flame, MapPin, BrainCircuit, Bike, Ship } from 'lucide-react'
import type { MapCoords, MapLayer } from '@/types/map'

interface MapHudProps {
  coords: MapCoords | null
  zoom: number
  activeLayers: Set<MapLayer>
  onToggleLayer: (layer: MapLayer) => void
}

const LAYER_BUTTONS: { id: MapLayer; icon: typeof Flame; label: string }[] = [
  { id: 'heatmap',    icon: Flame,        label: 'HEATMAP' },
  { id: 'markers',   icon: MapPin,        label: 'EVENTS' },
  { id: 'prediction',icon: BrainCircuit,  label: 'PRED' },
  { id: 'bysykkel',  icon: Bike,          label: 'SYKKEL' },
  { id: 'ships',     icon: Ship,          label: 'SKIP' },
]

function formatCoord(val: number, pos: 'lat' | 'lng') {
  const dir = pos === 'lat' ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W')
  return `${Math.abs(val).toFixed(4)}° ${dir}`
}

export default function MapHud({ coords, zoom, activeLayers, onToggleLayer }: MapHudProps) {
  return (
    <>
      {/* Lag-toggle — øverst venstre */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
        <div className="flex items-center gap-1 mb-1">
          <Layers size={10} style={{ color: 'var(--color-text-dim)' }} />
          <span className="hud-label">LAG</span>
        </div>
        {LAYER_BUTTONS.map(({ id, icon: Icon, label }) => {
          const active = activeLayers.has(id)
          return (
            <button
              key={id}
              onClick={() => onToggleLayer(id)}
              className="flex items-center gap-2 px-2 py-1 transition-all"
              style={{
                backgroundColor: active ? 'var(--color-primary-glow)' : 'rgba(10,10,10,0.8)',
                border:          `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color:           active ? 'var(--color-primary)' : 'var(--color-text-dim)',
                backdropFilter:  'blur(4px)',
              }}
              title={label}
            >
              <Icon size={11} />
              <span className="hud-label" style={{ color: 'inherit' }}>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Koordinater — nederst venstre */}
      <div
        className="absolute bottom-3 left-3 z-10 px-2 py-1.5 flex items-center gap-3"
        style={{
          backgroundColor: 'rgba(10,10,10,0.85)',
          border:          '1px solid var(--color-border)',
          backdropFilter:  'blur(4px)',
        }}
      >
        {coords ? (
          <>
            <span className="hud-value tabular-nums">{formatCoord(coords.lat, 'lat')}</span>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <span className="hud-value tabular-nums">{formatCoord(coords.lng, 'lng')}</span>
          </>
        ) : (
          <span className="hud-label">OSLO, NORGE</span>
        )}
      </div>

      {/* Zoom + attribusjon — nederst høyre */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
        <div
          className="px-2 py-1.5"
          style={{ backgroundColor: 'rgba(10,10,10,0.85)', border: '1px solid var(--color-border)', backdropFilter: 'blur(4px)' }}
        >
          <span className="hud-label">Z</span>
          <span className="hud-value tabular-nums ml-1.5" style={{ color: 'var(--color-text-prim)' }}>
            {zoom.toFixed(1)}
          </span>
        </div>
        <div
          className="px-2 py-1.5"
          style={{ backgroundColor: 'rgba(10,10,10,0.85)', border: '1px solid var(--color-border)', backdropFilter: 'blur(4px)' }}
        >
          <span className="hud-label">© CARTO / OSM</span>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <line x1="10" y1="0"  x2="10" y2="7"  stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />
          <line x1="10" y1="13" x2="10" y2="20" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />
          <line x1="0"  y1="10" x2="7"  y2="10" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />
          <line x1="13" y1="10" x2="20" y2="10" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />
          <circle cx="10" cy="10" r="1.5" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>
    </>
  )
}
