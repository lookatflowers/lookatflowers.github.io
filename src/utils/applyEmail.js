import { festival } from '../data/festival'

// El correo siempre se arma en español (lo lee la organización), sin importar el idioma de la página.
const es = (v) => (typeof v === 'string' ? v : (v?.es ?? ''))
const plain = (v) => es(v).replace(/\*\*/g, '')
const RULE = '========================================'

/** Texto de una respuesta: opciones por índice, vacíos como "—". */
function answer(field, value) {
  if (field.options) return value === undefined || value === '' ? '—' : es(field.options[Number(value)])
  const text = String(value ?? '').trim()
  return text || '—'
}

/** Arma asunto y cuerpo del correo de postulación a partir de las respuestas. */
export function buildEmail(app, values) {
  const subject = app.subject.replace(/\{(\w+)\}/g, (_, id) => String(values[id] ?? '').trim() || '[NOMBRE]')

  const lines = [RULE, `POSTULACIÓN ${es(app.label)} · ${festival.name} ${festival.year}`, RULE, '']
  app.sections.forEach((section, i) => {
    lines.push(`${i + 1}. ${es(section.title).toUpperCase()}`)
    for (const field of section.fields) {
      if (field.type === 'members') {
        const rows = (values[field.id] ?? []).filter((row) => Object.values(row).some((v) => String(v).trim()))
        lines.push(`${es(field.label)}:${rows.length ? '' : ' —'}`)
        rows.forEach((row, n) => {
          lines.push(`  ${n + 1}) ${field.columns.map((c) => String(row[c.id] ?? '').trim() || '—').join(' · ')}`)
        })
      } else {
        lines.push(`${es(field.label)}: ${answer(field, values[field.id])}`)
      }
    }
    lines.push('')
  })

  lines.push(RULE, '✔ Acepto los compromisos y las bases de la convocatoria.')
  if (app.attachments.length) {
    lines.push('', 'Adjuntos:')
    app.attachments.forEach((a) => lines.push(`- ${plain(a)}`))
  }
  lines.push(RULE)

  const body = lines.join('\r\n')
  const mailto = `mailto:${festival.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return { subject, body, mailto }
}
