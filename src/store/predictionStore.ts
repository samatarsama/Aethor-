import { create } from 'zustand'
import type { PredictionZone } from '@/prediction/engine'

interface PredictionState {
  zones:           PredictionZone[]
  lastUpdated:     Date | null
  selectedZoneId:  string | null

  setZones:    (zones: PredictionZone[]) => void
  selectZone:  (id: string | null) => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  zones:          [],
  lastUpdated:    null,
  selectedZoneId: null,

  setZones:   (zones) => set({ zones, lastUpdated: new Date() }),
  selectZone: (id)    => set({ selectedZoneId: id }),
}))
