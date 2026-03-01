export interface BysykkelStation {
  id:              string
  name:            string
  lat:             number
  lng:             number
  capacity:        number
  bikesAvailable:  number
  docksAvailable:  number
  isRenting:       boolean
}

export interface AisShip {
  mmsi:      string
  name:      string
  lat:       number
  lng:       number
  heading:   number   // 0–359 grader
  speedKnots: number
  shipType:  'cargo' | 'tanker' | 'passenger' | 'tug' | 'other'
}

export interface AvinorFlight {
  flightId:     string
  airline:      string
  airport:      string
  airportName:  string
  direction:    'A' | 'D'   // Arrival / Departure
  scheduledTime: Date
  status:       'on-time' | 'delayed' | 'cancelled' | 'landed' | 'departed'
  gate?:        string
}
