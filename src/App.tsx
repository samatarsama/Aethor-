import AppLayout from '@/components/layout/AppLayout'

export default function App() {
  return (
    <AppLayout>
      {/* Kartområde — MapLibre monteres her i steg 4 */}
      <div
        className="flex flex-1 items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="text-center">
          <div
            className="font-mono text-xs mb-1"
            style={{ color: 'var(--color-text-dim)', letterSpacing: '0.2em' }}
          >
            59.9139° N  10.7522° E
          </div>
          <div
            className="font-mono font-medium"
            style={{ fontSize: '11px', color: 'var(--color-info)', letterSpacing: '0.15em' }}
          >
            KART INITIALISERES...
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
