import { useMemo } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { usePredictionStore } from '@/store/predictionStore'
import type { PredictionZone, RiskLevel } from '@/prediction/engine'

// ─── Farger per risikonivå ────────────────────────────────────
const RISK_COLOR: Record<RiskLevel, string> = {
  KRITISK: 'var(--color-critical)',
  HØY:     'var(--color-warning)',
  MIDDELS: 'var(--color-primary)',
  LAV:     'var(--color-info)',
}

// ─── Liten risiko-badge ───────────────────────────────────────
function RiskBadge({ level }: { level: RiskLevel }) {
  const color = RISK_COLOR[level]
  return (
    <span
      className="hud-label px-1 py-0.5"
      style={{
        color,
        border:          `1px solid ${color}`,
        backgroundColor: `${color}18`,
      }}
    >
      {level}
    </span>
  )
}

// ─── Risiko-bar ───────────────────────────────────────────────
function RiskBar({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div
      className="w-full h-px mt-1"
      style={{ backgroundColor: 'var(--color-border)' }}
    >
      <div
        className="h-full transition-all duration-700"
        style={{
          width:           `${score}%`,
          backgroundColor: RISK_COLOR[level],
          opacity:         0.8,
        }}
      />
    </div>
  )
}

// ─── Faktor-rad ───────────────────────────────────────────────
function FactorRow({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="hud-label">{label}</span>
      <span className="hud-value tabular-nums">
        {value}
        {unit && <span style={{ color: 'var(--color-text-dim)' }}>{unit}</span>}
      </span>
    </div>
  )
}

// ─── Enkelt sone-rad ─────────────────────────────────────────
function ZoneRow({
  zone,
  selected,
  onSelect,
}: {
  zone: PredictionZone
  selected: boolean
  onSelect: (id: string) => void
}) {
  const color = RISK_COLOR[zone.riskLevel]

  return (
    <div
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Klikbar header-rad */}
      <button
        className="w-full text-left px-3 py-2 transition-colors"
        onClick={() => onSelect(zone.id)}
        style={{
          borderLeft:      selected ? `2px solid ${color}` : '2px solid transparent',
          backgroundColor: selected ? 'var(--color-bg-hover)' : 'transparent',
        }}
      >
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            {selected
              ? <ChevronDown size={10} style={{ color }} />
              : <ChevronRight size={10} style={{ color: 'var(--color-text-dim)' }} />
            }
            <span
              className="font-mono font-medium"
              style={{ fontSize: '11px', color: 'var(--color-text-prim)' }}
            >
              {zone.name.toUpperCase()}
            </span>
          </div>
          <RiskBadge level={zone.riskLevel} />
        </div>

        <div className="flex items-center justify-between pl-4">
          <span
            className="font-mono tabular-nums font-bold"
            style={{ fontSize: '18px', color, lineHeight: 1 }}
          >
            {zone.riskScore}
          </span>
          <span className="hud-label">
            {Math.round(zone.confidence * 100)}% konfidens
          </span>
        </div>

        <div className="pl-4">
          <RiskBar score={zone.riskScore} level={zone.riskLevel} />
        </div>
      </button>

      {/* Utvidet detalj-seksjon */}
      {selected && (
        <div
          className="px-3 pb-3 pt-1 space-y-3"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          {/* Faktorer */}
          <div>
            <div className="hud-label mb-1.5">FAKTORER</div>
            <div className="space-y-1">
              <FactorRow label="HISTORISK BASELINE"  value={zone.factors.historical} />
              <FactorRow label="TEMPORAL FAKTOR"     value={zone.factors.temporal}   unit="×" />
              <FactorRow label="SESONGFAKTOR"        value={zone.factors.seasonal}   unit="×" />
              <FactorRow label="LIVE BOOST"          value={zone.factors.liveBoost}  unit=" pts" />
            </div>
          </div>

          {/* Predikerte hendelsestyper */}
          <div>
            <div className="hud-label mb-1.5">FORVENTET</div>
            <div className="flex flex-wrap gap-1">
              {zone.predictedTypes.map((t) => (
                <span
                  key={t}
                  className="hud-label px-1.5 py-0.5"
                  style={{
                    border:          '1px solid var(--color-border)',
                    color:           'var(--color-text-mono)',
                    backgroundColor: 'var(--color-bg)',
                  }}
                >
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Neste oppdatering */}
          <div className="flex justify-between">
            <span className="hud-label">NESTE OPPDATERING</span>
            <span className="hud-value">
              {zone.nextUpdateAt.toLocaleTimeString('no-NO', {
                hour:   '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Hoved-komponent ─────────────────────────────────────────
export default function PredictionPanel() {
  const { zones, lastUpdated, selectedZoneId, selectZone } = usePredictionStore()

  const summary = useMemo(() => ({
    kritisk: zones.filter((z) => z.riskLevel === 'KRITISK').length,
    hoy:     zones.filter((z) => z.riskLevel === 'HØY').length,
    middels: zones.filter((z) => z.riskLevel === 'MIDDELS').length,
    lav:     zones.filter((z) => z.riskLevel === 'LAV').length,
  }), [zones])

  const updatedStr = lastUpdated?.toLocaleTimeString('no-NO', {
    hour: '2-digit', minute: '2-digit',
  })

  if (zones.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="hud-label">BEREGNER...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sammendrag øverst */}
      <div
        className="grid grid-cols-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {[
          { label: 'KRIT',  value: summary.kritisk, level: 'KRITISK' as RiskLevel },
          { label: 'HØY',   value: summary.hoy,     level: 'HØY'     as RiskLevel },
          { label: 'MID',   value: summary.middels,  level: 'MIDDELS' as RiskLevel },
          { label: 'LAV',   value: summary.lav,      level: 'LAV'     as RiskLevel },
        ].map(({ label, value, level }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2"
            style={{ borderRight: '1px solid var(--color-border)' }}
          >
            <span
              className="font-mono font-bold tabular-nums"
              style={{ fontSize: '16px', color: RISK_COLOR[level] }}
            >
              {value}
            </span>
            <span className="hud-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Soneliste */}
      <div className="flex-1 overflow-y-auto">
        {zones.map((zone) => (
          <ZoneRow
            key={zone.id}
            zone={zone}
            selected={zone.id === selectedZoneId}
            onSelect={(id) => selectZone(id === selectedZoneId ? null : id)}
          />
        ))}
      </div>

      {/* Bunn-tidsstempel */}
      {updatedStr && (
        <div
          className="px-3 py-1 shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span className="hud-label">OPPDATERT</span>
          <span className="hud-value">{updatedStr}</span>
        </div>
      )}
    </div>
  )
}
