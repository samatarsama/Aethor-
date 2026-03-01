import { useState } from 'react'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import Timeline from './Timeline'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [leftTab, setLeftTab]   = useState<'feed' | 'map'>('feed')
  const [rightTab, setRightTab] = useState<'pred' | 'cam' | 'osint'>('pred')

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', backgroundColor: 'var(--color-bg)' }}
    >
      <Header alertCount={0} />

      {/* Midtdel: paneler + kart */}
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          activeTab={leftTab}
          onTabChange={setLeftTab}
        />

        {/* Kartområde */}
        <main className="flex flex-1 relative overflow-hidden">
          {children}
        </main>

        <RightPanel
          activeTab={rightTab}
          onTabChange={setRightTab}
        />
      </div>

      <Timeline />
    </div>
  )
}
