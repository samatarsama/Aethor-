import { useEffect, useRef } from 'react'
import { X, AlertTriangle, AlertCircle, Info, MapPin } from 'lucide-react'
import { useAlertStore } from '@/store/alertStore'
import type { AethorAlert, AlertSeverity } from '@/store/alertStore'

const SEVERITY_CONFIG: Record<AlertSeverity, {
  color:   string
  bg:      string
  border:  string
  icon:    typeof AlertCircle
  autoDismissMs: number
}> = {
  CRITICAL: {
    color:         'var(--color-critical)',
    bg:            'rgba(239,68,68,0.10)',
    border:        'rgba(239,68,68,0.50)',
    icon:          AlertCircle,
    autoDismissMs: 12_000,
  },
  WARNING: {
    color:         'var(--color-warning)',
    bg:            'rgba(245,158,11,0.08)',
    border:        'rgba(245,158,11,0.40)',
    icon:          AlertTriangle,
    autoDismissMs: 8_000,
  },
  INFO: {
    color:         'var(--color-info)',
    bg:            'rgba(107,114,128,0.08)',
    border:        'rgba(107,114,128,0.30)',
    icon:          Info,
    autoDismissMs: 5_000,
  },
}

function Toast({ alert, onDismiss }: { alert: AethorAlert; onDismiss: () => void }) {
  const cfg    = SEVERITY_CONFIG[alert.severity]
  const Icon   = cfg.icon
  const timeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timeRef.current = setTimeout(onDismiss, cfg.autoDismissMs)
    return () => { if (timeRef.current) clearTimeout(timeRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.id])

  const timeStr = alert.timestamp.toLocaleTimeString('no-NO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 w-72"
      style={{
        backgroundColor: cfg.bg,
        border:          `1px solid ${cfg.border}`,
        borderLeft:      `3px solid ${cfg.color}`,
        animation:       'toast-in 0.18s ease-out',
      }}
      role="alert"
    >
      {/* Ikon */}
      <Icon size={13} style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }} />

      {/* Innhold */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="hud-label" style={{ color: cfg.color }}>
            {alert.severity} · {alert.category}
          </span>
          <span className="hud-label ml-2">{timeStr}</span>
        </div>
        <p
          className="text-xs leading-snug"
          style={{ color: 'var(--color-text-prim)', fontFamily: 'var(--font-ui)' }}
        >
          {alert.message}
        </p>
        {alert.location && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={9} style={{ color: 'var(--color-text-dim)' }} />
            <span className="hud-label">{alert.location.area}</span>
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        style={{ color: 'var(--color-text-dim)', flexShrink: 0 }}
      >
        <X size={11} />
      </button>
    </div>
  )
}

/** Container øverst-høyre som viser inntil 5 aktive toasts */
export default function AlertToastContainer() {
  const { alerts, acknowledge } = useAlertStore()

  const visible = alerts
    .filter((a) => !a.acknowledged)
    .slice(0, 5)

  if (visible.length === 0) return null

  return (
    <div
      className="fixed z-50 flex flex-col gap-1.5"
      style={{ top: '56px', right: '8px' }}
    >
      {visible.map((alert) => (
        <Toast
          key={alert.id}
          alert={alert}
          onDismiss={() => acknowledge(alert.id)}
        />
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
