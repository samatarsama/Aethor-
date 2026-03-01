# Aethor

Aethor er et real-time overvåknings og analyse dashboard for Oslo. Tanken bak prosjektet var å samle alle de åpne dataene som finnes i Norge på ett sted — politilogg, trafikkameraer, vær, bysykkel, flytrafikk og mer — og presentere det på en måte som faktisk ser bra ut.

Designet er inspirert av Anduril Industries sin militær HUD-estetikk. Mørk bakgrunn, amber/oransje aksenter, skarp monospace-typografi. Ingen pastell-farger eller avrundede hjørner her.

---

## Hva den gjør

- Live politilogg fra Politiloggen API direkte plottet på kart
- Heatmap som oppdaterer seg automatisk basert på hendelsestetthet
- Prediksjonsmotor som estimerer risikonivå per bydel (basert på historikk + tid på døgnet)
- Kamera-feeds fra Statens Vegvesen sine veikamaraer
- OSINT-panel med data fra AIS (skip i Oslofjorden), Avinor (flytrafikk), bysykkel-stasjoner og sanntids T-bane/buss via Entur
- Alert-system som trigges på voldshendelser, branner og hendelsesklustere

Alle datakilder er åpne og gratis. Ingen av dem krever API-nøkkel (utenom noen valgfrie integrasjoner).

---

## Tech stack

- React + TypeScript + Vite
- MapLibre GL JS for kart og heatmap
- Zustand for state management
- TanStack React Query for data-fetching og caching
- Tailwind CSS

---

## Kom i gang

```bash
git clone https://github.com/samatarsama/Aethor-.git
cd Aethor-
npm install
```

Kopier `.env.example` til `.env.local` og fyll inn det du trenger:

```bash
cp .env.example .env.local
```

Start dev-serveren:

```bash
npm run dev
```

---

## Miljøvariabler

Alle API-nøkler må legges i `.env.local` — denne filen er i `.gitignore` og skal aldri committes siden repoet er offentlig.

Se `.env.example` for hvilke variabler som finnes. De fleste integrasjoner funger uten nøkkel, men noen (som OpenCage geocoding) krever registrering.

---

## Datakilder

Alle åpne og gratis:

| Kilde | Hva | Lisens |
|-------|-----|--------|
| Politiloggen | Politilogg live | NLOD 2.0 |
| Met.no | Vær og vinddata | NLOD 2.0 |
| Statens Vegvesen | Trafikkameraer | NLOD 2.0 |
| Oslo Bysykkel GBFS | Sykkelstasjoner sanntid | Åpen |
| Entur | T-bane og buss | NLOD 2.0 |
| AIS Stream | Skip i Oslofjorden | Åpen |
| Avinor | Flytrafikk Gardermoen | Åpen |

---

## Fargepalett

Streng — ikke avvik fra disse:

```
Bakgrunn:   #0A0A0A
Primær:     #F97316  (amber)
Sekundær:   #EA580C  (mørk amber)
Kritisk:    #EF4444  (rød)
Advarsel:   #F59E0B  (gul)
```

Ingen blå neon. Ingen lilla. Amber er signaturfargen.

---

## Status

Prosjektet er under aktiv utvikling. Se issues for hva som jobbes med.

---

*Data under NLOD 2.0 eller tilsvarende åpen lisens.*
