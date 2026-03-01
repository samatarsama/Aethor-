import { Radio, Map } from 'lucide-react'

const TABS = [
  { id: 'feed', icon: Radio, label: 'FEED' },
  { id: 'map',  icon: Map,   label: 'LAG' },
] as const

type TabId = (typeof TABS)[number]['id']

interface LeftPanelProps {
  activeTab?: TabId
  onTabChange?: (tab: TabId) => void
}

export default function LeftPanel({ activeTab = 'feed', onTabChange }: LeftPanelProps) {
  return (
    <div
      className="flex shrink-0"
      style={{ width: '260px', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Tab-ikon-stripe */}
      <div
        className="flex flex-col items-center pt-2 gap-1 shrink-0"
        style={{
          width: '40px',
          borderRight: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange?.(id)}
              title={label}
              className="flex items-center justify-center w-8 h-8 transition-colors"
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-dim)',
                borderLeft: active ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}
            >
              <Icon size={14} />
            </button>
          )
        })}
      </div>

      {/* Panel-innhold */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-panel)' }}
      >
        {/* Panel header */}
        <div
          className="flex items-center px-3 shrink-0"
          style={{
            height: '32px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span className="hud-label">
            {TABS.find((t) => t.id === activeTab)?.label}
          </span>
        </div>

        {/* Placeholder */}
        <div className="flex flex-col flex-1 items-center justify-center gap-2">
          <div
            className="w-8 h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <span className="hud-label">LASTER...</span>
        </div>
      </div>
    </div>
  )
}
