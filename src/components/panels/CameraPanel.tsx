import { useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import CameraFeed from '@/components/ui/CameraFeed'
import { VEGVESEN_CAMERAS } from '@/services/vegvesen'
import type { VegvesenCamera } from '@/types/camera'

/** Antall kameraer å vise i griden */
const GRID_CAMERAS = VEGVESEN_CAMERAS.slice(0, 8)

export default function CameraPanel() {
  const [expanded, setExpanded]   = useState<VegvesenCamera | null>(null)
  const [page, setPage]           = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const perPage    = 4
  const totalPages = Math.ceil(GRID_CAMERAS.length / perPage)
  const visible    = GRID_CAMERAS.slice(page * perPage, page * perPage + perPage)

  function forceRefresh() {
    setRefreshKey((k) => k + 1)
  }

  // ─── Utvidet enkelt-kamera ────────────────────────────────
  if (expanded) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 shrink-0"
          style={{ height: '32px', borderBottom: '1px solid var(--color-border)' }}
        >
          <button
            onClick={() => setExpanded(null)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--color-text-dim)' }}
          >
            <ArrowLeft size={11} />
            <span className="hud-label">TILBAKE</span>
          </button>

          <div
            className="h-3 w-px mx-1"
            style={{ backgroundColor: 'var(--color-border)' }}
          />

          <span className="hud-label" style={{ color: 'var(--color-text-mono)' }}>
            {expanded.name.toUpperCase()}
          </span>

          {expanded.road && (
            <span
              className="hud-label px-1 py-0.5 ml-auto"
              style={{
                color:  'var(--color-primary)',
                border: '1px solid var(--color-primary)',
              }}
            >
              {expanded.road}
            </span>
          )}
        </div>

        {/* Stort kamerabilde */}
        <div className="flex-1 p-2 flex flex-col gap-2">
          <div className="flex-1">
            <CameraFeed
              key={`${expanded.id}-${refreshKey}`}
              camera={expanded}
              refreshInterval={15_000}
            />
          </div>

          {/* Kamera-metadata */}
          <div
            className="p-2 space-y-1"
            style={{
              border:          '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
            }}
          >
            <div className="flex justify-between">
              <span className="hud-label">KAMERA-ID</span>
              <span className="hud-value font-mono">{expanded.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="hud-label">POSISJON</span>
              <span className="hud-value tabular-nums" style={{ fontSize: '10px' }}>
                {expanded.lat.toFixed(4)}N {expanded.lng.toFixed(4)}E
              </span>
            </div>
            <div className="flex justify-between">
              <span className="hud-label">REFRESH</span>
              <span className="hud-value">15s</span>
            </div>
            <div className="flex justify-between">
              <span className="hud-label">KILDE</span>
              <span className="hud-value">VEGVESEN NLOD 2.0</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── 2×2 grid ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ height: '32px', borderBottom: '1px solid var(--color-border)' }}
      >
        <span className="hud-label">
          {GRID_CAMERAS.length} KAMERAER
        </span>
        <button
          onClick={forceRefresh}
          className="flex items-center gap-1 transition-colors"
          style={{ color: 'var(--color-text-dim)' }}
          title="Tving refresh"
        >
          <RefreshCw size={10} />
          <span className="hud-label">REFRESH</span>
        </button>
      </div>

      {/* 2×2 grid */}
      <div className="flex-1 p-1.5 grid grid-cols-2 gap-1.5 content-start">
        {visible.map((cam) => (
          <CameraFeed
            key={`${cam.id}-${refreshKey}`}
            camera={cam}
            refreshInterval={30_000}
            onExpand={setExpanded}
            compact
          />
        ))}
      </div>

      {/* Paginering + attribusjon */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <span className="hud-label">VEGVESEN © NLOD 2.0</span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="hud-label px-1.5 py-0.5 transition-colors disabled:opacity-30"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}
            >
              ‹
            </button>
            <span className="hud-label">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="hud-label px-1.5 py-0.5 transition-colors disabled:opacity-30"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-dim)' }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
