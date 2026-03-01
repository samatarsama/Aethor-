interface StatusDotProps {
  status: 'online' | 'degraded' | 'offline'
  label: string
}

const STATUS_COLOR = {
  online:   'var(--color-safe)',
  degraded: 'var(--color-warning)',
  offline:  'var(--color-critical)',
}

export default function StatusDot({ status, label }: StatusDotProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: STATUS_COLOR[status],
          boxShadow: `0 0 5px ${STATUS_COLOR[status]}`,
        }}
      />
      <span className="hud-label">{label}</span>
    </div>
  )
}
