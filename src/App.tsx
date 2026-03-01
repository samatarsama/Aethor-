import AppLayout from '@/components/layout/AppLayout'
import AethorMap from '@/components/map/AethorMap'
import { usePolitiStream } from '@/hooks/usePolitiStream'
import { usePredictions } from '@/hooks/usePredictions'

export default function App() {
  usePolitiStream(120_000)
  usePredictions()

  return (
    <AppLayout>
      <AethorMap />
    </AppLayout>
  )
}
