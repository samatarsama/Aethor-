import { create } from 'zustand'

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO'
export type AlertSource   = 'politiloggen' | 'prediction' | 'system'

export interface AethorAlert {
  id:           string
  severity:     AlertSeverity
  category:     string
  message:      string
  location?:    { lat: number; lng: number; area: string }
  timestamp:    Date
  acknowledged: boolean
  source:       AlertSource
}

interface AlertState {
  alerts:       AethorAlert[]
  addAlert:     (alert: Omit<AethorAlert, 'id' | 'timestamp' | 'acknowledged'>) => void
  acknowledge:  (id: string) => void
  dismissAll:   () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],

  addAlert: (alert) =>
    set((s) => ({
      alerts: [
        {
          ...alert,
          id:           crypto.randomUUID(),
          timestamp:    new Date(),
          acknowledged: false,
        },
        ...s.alerts,
      ].slice(0, 50), // maks 50 i historikken
    })),

  acknowledge: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      ),
    })),

  dismissAll: () =>
    set((s) => ({
      alerts: s.alerts.map((a) => ({ ...a, acknowledged: true })),
    })),
}))
