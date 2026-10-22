// Plazos de postulación, siempre en hora de Chile continental (sin importar dónde esté quien visita).
const TZ = 'America/Santiago'
const DAY = 86_400_000

// Momento de carga de la página: los plazos se calculan una vez (no cambian mientras se lee)
export const NOW = Date.now()

/** 'AAAA-MM-DD' del instante `ms` en Chile. */
const dayKey = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms)

/** '2026-10-29T23:59:59-03:00' -> 'jueves, 29 de octubre, 23:59' (según idioma). */
export function formatDeadline(iso, lang, { short = false } = {}) {
  const locale = lang === 'en' ? 'en-GB' : 'es-CL'
  const options = short
    ? { timeZone: TZ, day: 'numeric', month: 'short' }
    : { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }
  return new Intl.DateTimeFormat(locale, options).format(new Date(iso))
}

/** Días de calendario que faltan (0 = hoy es el último día) o -1 si ya cerró. */
export function daysLeft(iso, now = NOW) {
  const end = new Date(iso).getTime()
  if (now > end) return -1
  return Math.round((Date.parse(dayKey(end)) - Date.parse(dayKey(now))) / DAY)
}
