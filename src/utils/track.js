import { GOATCOUNTER_CODE, LIKES_URL } from '../data/analytics'

// Registro anónimo de uso (ver src/data/analytics.js). Nunca se envían nombres, correos ni nada
// que identifique a quien visita: solo qué artista o puesto, y un código al azar por navegador
// para que cada persona cuente un solo me gusta por artista.

/** Carga el contador de visitas (una vez). En localhost GoatCounter no cuenta. */
export function initAnalytics() {
  if (!GOATCOUNTER_CODE || typeof document === 'undefined' || document.querySelector('script[data-goatcounter]')) return
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://gc.zgo.at/count.js'
  s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  document.head.appendChild(s)
}

const slug = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Evento con nombre legible en el panel, p. ej. track('Reseña', 'banda', 'Desvelo'). */
export function track(action, kind, name) {
  try {
    window.goatcounter?.count?.({
      path: `${slug(action)}/${slug(kind)}/${slug(name)}`,
      title: `${action} · ${name}`,
      event: true,
    })
  } catch {
    /* el registro nunca debe romper la página */
  }
}

/* ------------------------------ me gusta ------------------------------ */

const LIKES_KEY = 'laf-likes'
const VISITOR_KEY = 'laf-visitor'

function readLikes() {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY)) || {}
  } catch {
    return {}
  }
}

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return null // sin almacenamiento (modo privado estricto): el ♥ funciona en pantalla, pero no se envía
  }
}

const likeKey = (type, name) => `${type}|${name}`

export const isLiked = (type, name) => Boolean(readLikes()[likeKey(type, name)])

/** Marca o desmarca un me gusta. `type`: 'Banda' | 'DJ' | 'Puesto' (como en la planilla). */
export function setLiked(type, name, liked) {
  const likes = readLikes()
  if (liked) likes[likeKey(type, name)] = true
  else delete likes[likeKey(type, name)]
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
  track(liked ? 'Me gusta' : 'Quita me gusta', type, name)
  const visitor = visitorId()
  if (!LIKES_URL || !visitor) return
  // text/plain evita la verificación previa (CORS) que Apps Script no responde
  fetch(LIKES_URL, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ type, name, liked, visitor }),
  }).catch(() => {})
}
