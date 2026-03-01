import { useState } from 'react'
import { BrainCircuit, Camera, Globe } from 'lucide-react'
import PredictionPanel from '@/components/panels/PredictionPanel'
import CameraPanel from '@/components/panels/CameraPanel'

const TABS = [
  { id: 'pred',  icon: BrainCircuit, label: 'PREDIKSJON' },
  { id: 'cam',   icon: Camera,       label: 'KAMERA' },
  { id: 'osint', icon: Globe,        label: 'OSINT' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('pred')

  return (
    <div
      className="flex shrink-0"
      style={{ width: '240px', borderLeft: '1px solid var(--color-border)' }}
    >
      {/* Panel-innhold */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-panel)' }}
      >
        {/* Panel header */}
        <div
          className="flex items-center px-3 shrink-0"
          style={{
            height:       '32px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span className="hud-label">
            {TABS.find((t) => t.id === activeTab)?.label}
          </span>
        </div>

        {activeTab === 'pred'  && <PredictionPanel />}

        {activeTab === 'cam'   && <CameraPanel />}

        {activeTab === 'osint' && (
          <div className="flex flex-col flex-1 items-center justify-center gap-2">
            <span className="hud-label">OSINT — STEG 13</span>
          </div>
        )}
      </div>

      {/* Tab-ikon-stripe */}
      <div
        className="flex flex-col items-center pt-2 gap-1 shrink-0"
        style={{
          width:       '40px',
          borderLeft:  '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={label}
              className="flex items-center justify-center w-8 h-8 transition-colors"
              style={{
                color:      active ? 'var(--color-primary)' : 'var(--color-text-dim)',
                borderRight: active
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
              }}
            >
              <Icon size={14} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
