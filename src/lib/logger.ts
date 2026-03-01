type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const isDev = import.meta.env.VITE_APP_ENV !== 'production'

function log(level: LogLevel, module: string, message: string, data?: unknown) {
  if (!isDev && level === 'debug') return
  const prefix = `[AETHOR:${module}]`
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(prefix, message, data ?? '')
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(prefix, message, data ?? '')
  } else if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`[${level.toUpperCase()}] ${prefix}`, message, data ?? '')
  }
}

export const logger = {
  info:  (module: string, msg: string, data?: unknown) => log('info',  module, msg, data),
  warn:  (module: string, msg: string, data?: unknown) => log('warn',  module, msg, data),
  error: (module: string, msg: string, data?: unknown) => log('error', module, msg, data),
  debug: (module: string, msg: string, data?: unknown) => log('debug', module, msg, data),
}
