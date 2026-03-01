import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import Timeline from './Timeline'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', backgroundColor: 'var(--color-bg)' }}
    >
      <Header />

      {/* Midtdel: paneler + kart */}
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />

        {/* Kartområde */}
        <main className="flex flex-1 relative overflow-hidden">
          {children}
        </main>

        <RightPanel />
      </div>

      <Timeline />
    </div>
  )
}
