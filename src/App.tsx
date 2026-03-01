import AppLayout from '@/components/layout/AppLayout'
import AethorMap from '@/components/map/AethorMap'
import { usePolitiStream } from '@/hooks/usePolitiStream'

export default function App() {
  // Start auto-refresh av politilogg (2 min intervall, backoff ved feil)
  usePolitiStream(120_000)

  return (
    <AppLayout>
      <AethorMap />
    </AppLayout>
  )
}
