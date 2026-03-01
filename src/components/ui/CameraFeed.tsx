import { useState, useEffect, useCallback, useRef } from 'react'
import { Maximize2 } from 'lucide-react'
import { getCameraUrl } from '@/services/vegvesen'
import type { VegvesenCamera, CameraSignal } from '@/types/camera'

interface CameraFeedProps {
  camera:          VegvesenCamera
  refreshInterval?: number   // ms, default 30 000
  onExpand?:       (camera: VegvesenCamera) => void
  compact?:        boolean
}

export default function CameraFeed({
  camera,
  refreshInterval = 30_000,
  onExpand,
  compact = false,
}: CameraFeedProps) {
  const [signal,    setSignal]    = useState<CameraSignal>('loading')
  const [src,       setSrc]       = useState(() => getCameraUrl(camera.id))
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(() => {
    setSignal('loading')
    setSrc(getCameraUrl(camera.id, Date.now()))
    setLastRefresh(new Date())
  }, [camera.id])

  // Auto-refresh
  useEffect(() => {
    timerRef.current = setInterval(refresh, refreshInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [refresh, refreshInterval])

  const handleLoad  = () => setSignal('live')
  const handleError = () => setSignal('no-signal')

  const elapsed = lastRefresh
    ? Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
    : null

  return (
    <div
      className="relative flex flex-col overflow-hidden group"
      style={{
        border:          '1px solid var(--color-border)',
        backgroundColor: '#080808',
        aspectRatio:     '16/9',
      }}
    >
      {/* Bilde */}
      {signal !== 'no-signal' && (
        <img
          src={src}
          alt={camera.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: signal === 'live' ? 'block' : 'none' }}
          onLoad={handleLoad}
          onError={handleError}
          crossOrigin="anonymous"
        />
      )}

      {/* Loading shimmer */}
      {signal === 'loading' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #0A0A0A 25%, #141414 50%, #0A0A0A 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s ease-in-out infinite',
          }}
        />
      )}

      {/* No-signal overlay */}
      {signal === 'no-signal' && (
        <div className="no-signal absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="hud-label z-10"
            style={{ color: 'var(--color-text-dim)', letterSpacing: '0.2em' }}
          >
            SIGNAL TAPT
          </span>
        </div>
      )}

      {/* HUD-overlay — navn + status */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-1.5 py-1"
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1 h-1 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                signal === 'live'      ? 'var(--color-safe)'
                : signal === 'loading' ? 'var(--color-info)'
                : 'var(--color-critical)',
              boxShadow:
                signal === 'live' ? '0 0 4px var(--color-safe)' : 'none',
            }}
          />
          <span
            className="font-mono truncate"
            style={{
              fontSize: compact ? '8px' : '9px',
              color:    'var(--color-text-mono)',
              maxWidth: '110px',
            }}
          >
            {camera.name.toUpperCase()}
          </span>
        </div>

        {elapsed !== null && signal === 'live' && (
          <span className="hud-label" style={{ fontSize: '8px' }}>
            {elapsed}s
          </span>
        )}
      </div>

      {/* Expand-knapp */}
      {onExpand && (
        <button
          onClick={() => onExpand(camera)}
          className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            border:          '1px solid var(--color-border)',
            color:           'var(--color-text-dim)',
          }}
          title="Utvid"
        >
          <Maximize2 size={9} />
        </button>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
