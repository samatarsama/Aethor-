/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POLITILOGGEN_BASE: string
  readonly VITE_MET_API_BASE: string
  readonly VITE_VEGVESEN_BASE: string
  readonly VITE_OPENCAGE_KEY?: string
  readonly VITE_AIS_API_KEY?: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
