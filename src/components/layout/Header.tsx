import { useEffect, useState } from 'react'
import { Bell, Settings } from 'lucide-react'
import StatusDot from '@/components/ui/StatusDot'

function useClock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

interface HeaderProps {
  alertCount?: number
}

export default function Header({ alertCount = 0 }: HeaderProps) {
  const time = useClock()

  const timeStr = time.toLocaleTimeString('no-NO', {
    timeZone: 'Europe/Oslo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateStr = time.toLocaleDateString('no-NO', {
    timeZone: 'Europe/Oslo',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()

  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: '48px',
        backgroundColor: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Amber trekant-ikon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polygon
              points="10,2 18,17 2,17"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="10" cy="10" r="2" fill="var(--color-primary)" />
          </svg>
          <span
            className="font-mono font-bold tracking-widest text-glow"
            style={{
              fontSize: '14px',
              letterSpacing: '0.25em',
              color: 'var(--color-primary)',
            }}
          >
            AETHOR
          </span>
        </div>

        <div
          className="h-4 w-px"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        <span className="hud-label" style={{ color: 'var(--color-text-dim)' }}>
          OSLO INTEL
        </span>
      </div>

      {/* Systemstatus */}
      <div className="flex items-center gap-5">
        <StatusDot status="online" label="POLITILOGGEN" />
        <StatusDot status="online" label="KART" />
        <StatusDot status="offline" label="KAMERA" />
      </div>

      {/* Klokke + handlinger */}
      <div className="flex items-center gap-4">
        {/* Klokke */}
        <div className="text-right">
          <div
            className="font-mono font-medium tabular-nums"
            style={{ fontSize: '13px', color: 'var(--color-text-prim)' }}
          >
            {timeStr}
          </div>
          <div className="hud-label">{dateStr}</div>
        </div>

        <div
          className="h-6 w-px"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Varsler */}
        <button
          className="relative flex items-center justify-center w-8 h-8 transition-colors"
          style={{ color: alertCount > 0 ? 'var(--color-warning)' : 'var(--color-text-dim)' }}
          title="Varsler"
        >
          <Bell size={16} />
          {alertCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full font-mono"
              style={{
                fontSize: '9px',
                backgroundColor: 'var(--color-warning)',
                color: '#000',
              }}
            >
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Innstillinger */}
        <button
          className="flex items-center justify-center w-8 h-8 transition-colors"
          style={{ color: 'var(--color-text-dim)' }}
          title="Innstillinger"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
