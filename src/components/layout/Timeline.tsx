export default function Timeline() {
  return (
    <div
      className="flex items-center px-4 shrink-0 gap-4"
      style={{
        height: '48px',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-panel)',
      }}
    >
      <span className="hud-label">TIMELINE</span>

      {/* Placeholder aktivitetsgraf */}
      <div className="flex items-end gap-0.5 flex-1 h-6">
        {Array.from({ length: 48 }, (_, i) => {
          const height = Math.max(2, Math.round(Math.random() * 22))
          return (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${height}px`,
                backgroundColor:
                  i > 42
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                opacity: i > 42 ? 1 : 0.6,
              }}
            />
          )
        })}
      </div>

      <span className="hud-label">48T</span>
    </div>
  )
}
