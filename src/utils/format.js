/** '2026-11-06' -> 'Viernes, 6 de noviembre de 2026' (según idioma). */
export function formatLongDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d) // fecha local: evita desfases por zona horaria
  const locale = lang === 'en' ? 'en-GB' : 'es-CL'
  const text = new Intl.DateTimeFormat(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}
