import { useEffect } from 'react'
import { fetchBysykkelStations } from '@/services/bysykkel'
import { fetchAisShips }         from '@/services/ais'
import { fetchAvinorFlights }    from '@/services/avinor'
import { useOsintStore }         from '@/store/osintStore'
import { logger }                from '@/lib/logger'

export function useOsintData() {
  const { setStations, setShips, setFlights } = useOsintStore()

  // Bysykkel — refresh hvert 30s
  useEffect(() => {
    async function load() {
      const s = await fetchBysykkelStations()
      setStations(s)
      logger.debug('useOsintData', `${s.length} bysykkel-stasjoner`)
    }
    void load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [setStations])

  // AIS — simulert, refresh hvert 10s
  useEffect(() => {
    function load() { setShips(fetchAisShips()) }
    load()
    const id = setInterval(load, 10_000)
    return () => clearInterval(id)
  }, [setShips])

  // Avinor — refresh hvert 5 min
  useEffect(() => {
    async function load() {
      const f = await fetchAvinorFlights()
      setFlights(f)
      logger.debug('useOsintData', `${f.length} flybevegelser`)
    }
    void load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
  }, [setFlights])
}
