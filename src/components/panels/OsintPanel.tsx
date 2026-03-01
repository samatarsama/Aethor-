import { useState } from 'react'
import { Bike, Ship, Plane } from 'lucide-react'
import { useOsintStore } from '@/store/osintStore'
import type { AvinorFlight } from '@/types/osint'

type OsintTab = 'sykkel' | 'skip' | 'fly'

const SHIP_TYPE_LABEL: Record<string, string> = {
  cargo: 'LAST', tanker: 'TANK', passenger: 'PASS', tug: 'TREKK', other: 'ANNET',
}

const STATUS_COLOR: Record<AvinorFlight['status'], string> = {
  'on-time':  'var(--color-safe)',
  'delayed':  'var(--color-warning)',
  'cancelled':'var(--color-critical)',
  'landed':   'var(--color-text-dim)',
  'departed': 'var(--color-text-dim)',
}

export default function OsintPanel() {
  const [tab, setTab] = useState<OsintTab>('sykkel')
  const { stations, ships, flights } = useOsintStore()

  const arrivals   = flights.filter((f) => f.direction === 'A')
  const departures = flights.filter((f) => f.direction === 'D')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-tabs */}
      <div
        className="flex shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {([
          { id: 'sykkel' as OsintTab, icon: Bike,  label: 'SYKKEL', count: stations.length },
          { id: 'skip'   as OsintTab, icon: Ship,  label: 'SKIP',   count: ships.length },
          { id: 'fly'    as OsintTab, icon: Plane, label: 'FLY',    count: flights.length },
        ]).map(({ id, icon: Icon, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
            style={{
              borderBottom: tab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color:        tab === id ? 'var(--color-primary)' : 'var(--color-text-dim)',
            }}
          >
            <Icon size={12} />
            <span className="hud-label" style={{ color: 'inherit' }}>{label}</span>
            <span className="font-mono tabular-nums" style={{ fontSize: '11px', color: 'inherit' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* ─── Bysykkel ─── */}
      {tab === 'sykkel' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-1.5 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span className="hud-label">OSLO BYSYKKEL</span>
            <span className="hud-label" style={{ color: 'var(--color-safe)' }}>
              {stations.filter((s) => s.isRenting).length} AKTIVE
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {stations.slice(0, 40).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: s.isRenting ? 'var(--color-safe)' : 'var(--color-text-dim)',
                      boxShadow:       s.isRenting ? '0 0 4px var(--color-safe)' : 'none',
                    }}
                  />
                  <span
                    className="text-xs truncate"
                    style={{ color: 'var(--color-text-prim)', fontFamily: 'var(--font-ui)', maxWidth: '120px' }}
                  >
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="hud-value tabular-nums"
                    style={{ color: s.bikesAvailable > 0 ? 'var(--color-safe)' : 'var(--color-critical)' }}
                  >
                    {s.bikesAvailable}
                  </span>
                  <span className="hud-label">/</span>
                  <span className="hud-value tabular-nums">{s.capacity}</span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-3 py-1 shrink-0"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span className="hud-label">OSLO BYSYKKEL — GBFS / ÅPEN</span>
          </div>
        </div>
      )}

      {/* ─── Skip ─── */}
      {tab === 'skip' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-1.5 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <span className="hud-label">AIS OSLOFJORDEN</span>
            <span className="hud-label" style={{ color: 'var(--color-info)' }}>SIMULERT</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {ships.map((s) => (
              <div
                key={s.mmsi}
                className="px-3 py-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="font-mono font-medium text-xs"
                    style={{ color: 'var(--color-text-prim)' }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="hud-label px-1 py-0.5"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}
                  >
                    {SHIP_TYPE_LABEL[s.shipType]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hud-label">HDG {s.heading}°</span>
                  <span className="hud-label">{s.speedKnots.toFixed(1)} kn</span>
                  <span className="hud-label tabular-nums" style={{ marginLeft: 'auto' }}>
                    {s.lat.toFixed(3)}N {s.lng.toFixed(3)}E
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-3 py-1 shrink-0"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span className="hud-label">AIS — AISSTREAM.IO (DEMO)</span>
          </div>
        </div>
      )}

      {/* ─── Fly ─── */}
      {tab === 'fly' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {(['A', 'D'] as const).map((dir) => {
            const list = dir === 'A' ? arrivals : departures
            return (
              <div key={dir} className="flex flex-col" style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  className="flex items-center justify-between px-3 py-1 shrink-0"
                  style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                >
                  <span className="hud-label">{dir === 'A' ? 'ANKOMST' : 'AVGANG'}</span>
                  <span className="hud-label">{list.length}</span>
                </div>
                <div className="overflow-y-auto" style={{ flex: 1 }}>
                  {list.map((f) => (
                    <div
                      key={f.flightId}
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <span
                        className="font-mono font-medium"
                        style={{ fontSize: '11px', color: 'var(--color-primary)', minWidth: '52px' }}
                      >
                        {f.flightId}
                      </span>
                      <span
                        className="text-xs truncate flex-1"
                        style={{ color: 'var(--color-text-prim)', fontFamily: 'var(--font-ui)', maxWidth: '80px' }}
                      >
                        {f.airportName}
                      </span>
                      <span
                        className="hud-value tabular-nums shrink-0"
                        style={{ fontSize: '10px' }}
                      >
                        {f.scheduledTime.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className="hud-label shrink-0"
                        style={{ color: STATUS_COLOR[f.status] }}
                      >
                        {f.status.toUpperCase().replace('-', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <div
            className="px-3 py-1 shrink-0"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <span className="hud-label">AVINOR © ÅPEN DATA</span>
          </div>
        </div>
      )}
    </div>
  )
}
