import { useMemo } from 'react'
import { useEventsStore } from '@/store/eventsStore'

export default function Timeline() {
  const events = useEventsStore((s) => s.events)

  // Build 48 hourly buckets — index 0 = 48h ago, index 47 = most recent hour
  const buckets = useMemo(() => {
    const now   = Date.now()
    const counts = new Array(48).fill(0)
    for (const e of events) {
      const ageMs   = now - new Date(e.timestamp).getTime()
      const hourAgo = Math.floor(ageMs / 3_600_000)
      if (hourAgo >= 0 && hourAgo < 48) {
        counts[47 - hourAgo]++
      }
    }
    return counts
  }, [events])

  const maxCount = Math.max(1, ...buckets)

  return (
    <div
      className="flex items-center px-4 shrink-0 gap-3"
      style={{
        height:          '48px',
        borderTop:       '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-panel)',
      }}
    >
      <span className="hud-label" style={{ minWidth: '28px' }}>48T</span>

      <div className="flex items-end gap-px flex-1 h-6">
        {buckets.map((count, i) => {
          const heightPx = Math.max(2, Math.round((count / maxCount) * 22))
          const isRecent = i >= 42
          const hasEvent = count > 0
          return (
            <div
              key={i}
              className="flex-1 transition-all"
              style={{
                height:          `${heightPx}px`,
                backgroundColor: isRecent
                  ? 'var(--color-primary)'
                  : hasEvent
                  ? 'var(--color-text-mono)'
                  : 'var(--color-border)',
                opacity:         isRecent ? 1 : hasEvent ? 0.7 : 0.35,
                boxShadow:       isRecent && hasEvent
                  ? '0 0 3px var(--color-primary)'
                  : 'none',
              }}
              title={`${count} hendelse${count !== 1 ? 'r' : ''}`}
            />
          )
        })}
      </div>

      <span className="hud-label" style={{ minWidth: '20px', textAlign: 'right' }}>
        NÅ
      </span>
    </div>
  )
}
