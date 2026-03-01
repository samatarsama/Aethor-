import { create } from 'zustand'
import type { BysykkelStation, AisShip, AvinorFlight } from '@/types/osint'

interface OsintState {
  stations:  BysykkelStation[]
  ships:     AisShip[]
  flights:   AvinorFlight[]

  setStations: (s: BysykkelStation[]) => void
  setShips:    (s: AisShip[])         => void
  setFlights:  (f: AvinorFlight[])    => void
}

export const useOsintStore = create<OsintState>((set) => ({
  stations: [],
  ships:    [],
  flights:  [],

  setStations: (stations) => set({ stations }),
  setShips:    (ships)    => set({ ships }),
  setFlights:  (flights)  => set({ flights }),
}))
