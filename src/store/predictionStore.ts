import { create } from 'zustand'
import type { PredictionZone } from '@/prediction/engine'

interface PredictionState {
  zones:       PredictionZone[]
  lastUpdated: Date | null
  setZones:    (zones: PredictionZone[]) => void
}

export const usePredictionStore = create<PredictionState>((set) => ({
  zones:       [],
  lastUpdated: null,
  setZones:    (zones) => set({ zones, lastUpdated: new Date() }),
}))
