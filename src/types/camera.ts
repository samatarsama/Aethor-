export interface VegvesenCamera {
  id:    string
  name:  string
  lat:   number
  lng:   number
  road?: string
}

export type CameraSignal = 'loading' | 'live' | 'no-signal'
