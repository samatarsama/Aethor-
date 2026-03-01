/** Aethor fargepalett — bruk disse overalt, ikke hardkod hex-koder */
export const COLORS = {
  // Bakgrunner
  bg:           '#0A0A0A',
  bgPanel:      '#0F0F0F',
  bgCard:       '#141414',
  bgHover:      '#1A1A1A',

  // Amber — signatur
  primary:      '#F97316',
  primaryDim:   '#EA580C',
  primaryGlow:  'rgba(249,115,22,0.15)',

  // Borders
  border:       '#1F1F1F',
  borderAct:    '#F97316',

  // Tekst
  textPrim:     '#E5E5E5',
  textDim:      '#525252',
  textMono:     '#A3A3A3',

  // Status
  critical:     '#EF4444',
  warning:      '#F59E0B',
  safe:         '#22C55E',
  info:         '#6B7280',

  // Heatmap
  heatLow:      '#1E3A5F',
  heatMid:      '#F97316',
  heatHigh:     '#EF4444',
} as const

export type ColorKey = keyof typeof COLORS

/** Risk-nivå → farge */
export const RISK_COLOR: Record<'KRITISK' | 'HØY' | 'MIDDELS' | 'LAV', string> = {
  KRITISK:  COLORS.critical,
  HØY:      COLORS.warning,
  MIDDELS:  COLORS.primary,
  LAV:      COLORS.info,
}
