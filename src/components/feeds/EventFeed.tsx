import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import { MapPin, X } from 'lucide-react'
import { useEventsStore } from '@/store/eventsStore'
import { CATEGORY_COLOR, CATEGORY_SEVERITY } from '@/types/politiloggen'
import type { PolitiEvent, PolitiCategory } from '@/types/politiloggen'

// ─── Enkelt event-rad ─────────────────────────────────────────
function EventRow({
  event,
  selected,
  onSelect,
}: {
  event: PolitiEvent
  selected: boolean
  onSelect: (id: string) => void
}) {
  const color  = CATEGORY_COLOR[event.category]
  const active = event.status === 'Pågår'
  const ago    = formatDistanceToNow(new Date(event.timestamp), {
    locale: nb, addSuffix: true,
  })

  return (
    <button
      className="w-full text-left px-3 py-2.5 transition-colors"
      onClick={() => onSelect(event.id)}
      style={{
        borderBottom:    '1px solid var(--color-border)',
        borderLeft:      selected
          ? `2px solid ${color}`
          : active
          ? `2px solid ${color}`
          : '2px solid transparent',
        backgroundColor: selected
          ? 'var(--color-bg-hover)'
          : active
          ? 'rgba(249,115,22,0.03)'
          : 'transparent',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="hud-label" style={{ color }}>
          {event.category.toUpperCase()}
        </span>
        <span className="hud-label">{ago}</span>
      </div>

      <p
        className="text-xs leading-snug"
        style={{
          color:      'var(--color-text-prim)',
          fontFamily: 'var(--font-ui)',
          fontWeight: active ? 500 : 400,
        }}
      >
        {event.title}
      </p>

      <div className="flex items-center justify-between mt-1">
        {active && (
          <div className="flex items-center gap-1">
            <span
              className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color, color }}
            />
            <span className="hud-label" style={{ color }}>PÅGÅR</span>
          </div>
        )}
        {event.coordinates && (
          <MapPin
            size={9}
            className="ml-auto"
            style={{ color: 'var(--color-text-dim)' }}
          />
        )}
      </div>
    </button>
  )
}

// ─── Detalj-panel for valgt event ─────────────────────────────
function EventDetail({ event, onClose }: { event: PolitiEvent; onClose: () => void }) {
  const color = CATEGORY_COLOR[event.category]
  const ago   = formatDistanceToNow(new Date(event.timestamp), {
    locale: nb, addSuffix: true,
  })

  return (
    <div
      className="shrink-0"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--color-border)', borderLeft: `2px solid ${color}` }}
      >
        <span className="hud-label" style={{ color }}>
          {event.category.toUpperCase()}
        </span>
        <button
          onClick={onClose}
          style={{ color: 'var(--color-text-dim)' }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Innhold */}
      <div className="px-3 py-2.5 space-y-2">
        <p
          className="text-xs font-medium leading-snug"
          style={{ color: 'var(--color-text-prim)', fontFamily: 'var(--font-ui)' }}
        >
          {event.title}
        </p>

        {event.body && (
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-text-mono)', fontFamily: 'var(--font-ui)' }}
          >
            {event.body}
          </p>
        )}

        <div className="flex flex-col gap-1 pt-1">
          <div className="flex justify-between">
            <span className="hud-label">STATUS</span>
            <span className="hud-value" style={{ color: event.status === 'Pågår' ? color : 'var(--color-text-dim)' }}>
              {event.status.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="hud-label">TID</span>
            <span className="hud-value">{ago}</span>
          </div>
          {event.municipality && (
            <div className="flex justify-between">
              <span className="hud-label">OMRÅDE</span>
              <span className="hud-value">{event.municipality}</span>
            </div>
          )}
          {event.coordinates && (
            <div className="flex justify-between">
              <span className="hud-label">KOORD</span>
              <span className="hud-value tabular-nums" style={{ fontSize: '10px' }}>
                {event.coordinates.lat.toFixed(4)}N {event.coordinates.lng.toFixed(4)}E
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Stats-tab ────────────────────────────────────────────────
function StatsPanel({ events }: { events: PolitiEvent[] }) {
  const active = events.filter((e) => e.status === 'Pågår').length

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of events) {
      map.set(e.category, (map.get(e.category) ?? 0) + 1)
    }
    return [...map.entries()]
      .sort((a, b) => {
        const sa = CATEGORY_SEVERITY[a[0] as PolitiCategory] ?? 0
        const sb = CATEGORY_SEVERITY[b[0] as PolitiCategory] ?? 0
        return sb - sa
      })
  }, [events])

  const maxCount = Math.max(...byCategory.map(([, n]) => n), 1)

  return (
    <div className="flex flex-col flex-1 overflow-y-auto px-3 py-2 gap-3">
      {/* Sammendrag */}
      <div
        className="grid grid-cols-2 gap-2"
      >
        {[
          { label: 'TOTALT',  value: events.length },
          { label: 'AKTIVE',  value: active },
          { label: 'AVSLUTTET', value: events.length - active },
          { label: 'M/KOORD', value: events.filter((e) => e.coordinates).length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-2"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border:          '1px solid var(--color-border)',
            }}
          >
            <div className="hud-label mb-1">{label}</div>
            <div
              className="font-mono font-bold tabular-nums"
              style={{ fontSize: '18px', color: 'var(--color-text-prim)' }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown per kategori */}
      <div>
        <div className="hud-label mb-2">KATEGORI-FORDELING</div>
        <div className="flex flex-col gap-1.5">
          {byCategory.map(([cat, count]) => {
            const color = CATEGORY_COLOR[cat as PolitiCategory]
            const pct   = (count / maxCount) * 100
            return (
              <div key={cat}>
                <div className="flex justify-between mb-0.5">
                  <span className="hud-label" style={{ color }}>
                    {cat.toUpperCase()}
                  </span>
                  <span className="hud-value">{count}</span>
                </div>
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: 'var(--color-border)' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Hoved-komponent ──────────────────────────────────────────
export default function EventFeed() {
  const { events, loading, lastUpdated, isFallback, selectedEventId, selectEvent } =
    useEventsStore()

  const [activeFilter, setActiveFilter] = useState<'alle' | 'aktive' | PolitiCategory>('alle')
  const [view, setView] = useState<'feed' | 'stats'>('feed')

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  )

  const filtered = useMemo(() => {
    let list = [...events]
    if (activeFilter === 'aktive') {
      list = list.filter((e) => e.status === 'Pågår')
    } else if (activeFilter !== 'alle') {
      list = list.filter((e) => e.category === activeFilter)
    }
    // Sorter aktive øverst, deretter nyeste
    return list.sort((a, b) => {
      if (a.status === 'Pågår' && b.status !== 'Pågår') return -1
      if (b.status === 'Pågår' && a.status !== 'Pågår') return 1
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  }, [events, activeFilter])

  const activeCount = events.filter((e) => e.status === 'Pågår').length

  const updatedStr = lastUpdated?.toLocaleTimeString('no-NO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Status-rad */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
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
          <span className="hud-label">
            {loading ? 'HENTER...' : `${events.length} HENDELSER`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span
              className="hud-label px-1 py-0.5"
              style={{
                color:           'var(--color-critical)',
                border:          '1px solid var(--color-critical)',
                backgroundColor: 'rgba(239,68,68,0.08)',
              }}
            >
              {activeCount} AKTIVE
            </span>
          )}
          {/* Feed / Stats toggle */}
          <button
            className="hud-label px-1.5 py-0.5 transition-colors"
            onClick={() => setView((v) => v === 'feed' ? 'stats' : 'feed')}
            style={{
              color:  view === 'stats' ? 'var(--color-primary)' : 'var(--color-text-dim)',
              border: `1px solid ${view === 'stats' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            {view === 'feed' ? 'STAT' : 'FEED'}
          </button>
        </div>
      </div>

      {/* Fallback-banner */}
      {isFallback && !loading && (
        <div
          className="px-3 py-1 shrink-0 flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(245,158,11,0.06)',
            borderBottom:    '1px solid rgba(245,158,11,0.15)',
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

      {view === 'stats' ? (
        <StatsPanel events={events} />
      ) : (
        <>
          {/* Kategorifilter */}
          <div
            className="flex gap-1 px-2 py-1.5 shrink-0 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            {[
              { label: 'ALLE',    value: 'alle' as const },
              { label: 'AKTIVE',  value: 'aktive' as const },
              { label: 'VOLD',    value: 'Voldshendelse' as PolitiCategory },
              { label: 'TYVERI',  value: 'Tyveri' as PolitiCategory },
              { label: 'TRAFIKK', value: 'Trafikk' as PolitiCategory },
              { label: 'ORDER',   value: 'Ro og orden' as PolitiCategory },
            ].map(({ label, value }) => {
              const active = activeFilter === value
              return (
                <button
                  key={label}
                  onClick={() => setActiveFilter(value)}
                  className="shrink-0 px-1.5 py-0.5 hud-label transition-colors"
                  style={{
                    color:           active ? 'var(--color-primary)' : 'var(--color-text-dim)',
                    border:          `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Valgt event-detaljer */}
          {selectedEvent && (
            <EventDetail
              event={selectedEvent}
              onClose={() => selectEvent(null)}
            />
          )}

          {/* Hendelsesliste */}
          <div className="flex-1 overflow-y-auto">
            {loading && events.length === 0 ? (
              <div className="flex items-center justify-center h-24">
                <span className="hud-label">LASTER HENDELSER...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-24">
                <span className="hud-label">INGEN TREFF</span>
              </div>
            ) : (
              filtered.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  selected={event.id === selectedEventId}
                  onSelect={(id) =>
                    selectEvent(id === selectedEventId ? null : id)
                  }
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Bunn — attribusjon (NLOD 2.0 påkrevd) */}
      {updatedStr && (
        <div
          className="px-3 py-1 shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span className="hud-label">POLITIET © NLOD 2.0</span>
          <span className="hud-label">{updatedStr}</span>
        </div>
      )}
    </div>
  )
}
