import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import { useEventsStore } from '@/store/eventsStore'
import { CATEGORY_COLOR } from '@/types/politiloggen'
import type { PolitiEvent } from '@/types/politiloggen'

function EventRow({ event }: { event: PolitiEvent }) {
  const color  = CATEGORY_COLOR[event.category]
  const active = event.status === 'Pågår'
  const ago    = formatDistanceToNow(new Date(event.timestamp), {
    locale: nb,
    addSuffix: true,
  })

  return (
    <div
      className="px-3 py-2.5 cursor-default transition-colors"
      style={{
        borderBottom: '1px solid var(--color-border)',
        borderLeft:   active ? `2px solid ${color}` : '2px solid transparent',
        backgroundColor: active ? 'rgba(249,115,22,0.03)' : 'transparent',
      }}
    >
      {/* Kategori + tid */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="hud-label"
          style={{ color }}
        >
          {event.category.toUpperCase()}
        </span>
        <span className="hud-label">{ago}</span>
      </div>

      {/* Tittel */}
      <p
        className="text-xs leading-tight"
        style={{
          color:       'var(--color-text-prim)',
          fontFamily:  'var(--font-ui)',
          fontWeight:  active ? 500 : 400,
        }}
      >
        {event.title}
      </p>

      {/* Status-badge */}
      {active && (
        <div className="mt-1.5 flex items-center gap-1">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
          <span className="hud-label" style={{ color }}>PÅGÅR</span>
        </div>
      )}
    </div>
  )
}

export default function EventFeed() {
  const { events, loading, lastUpdated, isFallback } = useEventsStore()

  const active    = events.filter((e) => e.status === 'Pågår')
  const rest      = events.filter((e) => e.status !== 'Pågår')
  const sorted    = [...active, ...rest]

  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Feed-header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: loading ? 'var(--color-info)' : 'var(--color-safe)',
              boxShadow:       loading ? 'none' : '0 0 5px var(--color-safe)',
            }}
          />
          <span className="hud-label">{loading ? 'HENTER...' : `${events.length} HENDELSER`}</span>
        </div>
        {active.length > 0 && (
          <span
            className="hud-label px-1.5 py-0.5"
            style={{
              color:           'var(--color-critical)',
              border:          '1px solid var(--color-critical)',
              backgroundColor: 'rgba(239,68,68,0.08)',
            }}
          >
            {active.length} AKTIVE
          </span>
        )}
      </div>

      {/* Fallback-banner */}
      {isFallback && !loading && (
        <div
          className="px-3 py-1.5 shrink-0 flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            borderBottom:    '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--color-warning)' }}
          />
          <span className="hud-label" style={{ color: 'var(--color-warning)' }}>
            DEMO-DATA — API UTILGJENGELIG
          </span>
        </div>
      )}

      {/* Hendelsesliste */}
      <div className="flex-1 overflow-y-auto">
        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <span className="hud-label">LASTER HENDELSER...</span>
          </div>
        ) : (
          sorted.map((event) => <EventRow key={event.id} event={event} />)
        )}
      </div>

      {/* Bunntekst — attribusjon (NLOD 2.0 påkrevd) */}
      {updatedStr && (
        <div
          className="px-3 py-1.5 shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span className="hud-label">POLITIET © NLOD 2.0</span>
          <span className="hud-label">{updatedStr}</span>
        </div>
      )}
    </div>
  )
}
