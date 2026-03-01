import AppLayout from '@/components/layout/AppLayout'
import AethorMap from '@/components/map/AethorMap'
import AlertToastContainer from '@/components/ui/AlertToast'
import { usePolitiStream } from '@/hooks/usePolitiStream'
import { usePredictions } from '@/hooks/usePredictions'
import { useAlertEngine } from '@/hooks/useAlertEngine'
import { useOsintData } from '@/hooks/useOsintData'

export default function App() {
  usePolitiStream(120_000)
  usePredictions()
  useAlertEngine()
  useOsintData()

  return (
    <>
      <AppLayout>
        <AethorMap />
      </AppLayout>
      <AlertToastContainer />
    </>
  )
}
