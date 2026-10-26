// Genera la imagen de historia de Instagram (1080 × 1920) de un artista o un puesto, en el navegador.
// Estilo de la web: fondo líquido (capturas del shader en public/stories), la carta del artista o el
// cuadro del puesto al centro, el logo arriba y una frase abajo. Instagram tapa unos 200 px arriba y
// abajo con su interfaz, así que todo lo importante queda entre y = 190 y y = 1700.
import logoUrl from '../assets/brand/logo.svg'
import { festival } from '../data/festival'
import { displayText } from './displayText'
import { FLOWER_PATH } from '../components/FlowerIcon'

const W = 1080
const H = 1920
const C = { pink: '#D44488', green: '#61D6AD', violet: '#7772C9', yellow: '#F4D35E', ink: '#252525', paper: '#F2F2EF' }
const DISPLAY = '"Anderson Grotesk", "JetBrains Mono", sans-serif'
const MONO = '"JetBrains Mono", monospace'
const BACKGROUNDS = ['stories/fondo-1.webp', 'stories/fondo-2.webp', 'stories/fondo-3.webp']
const MONTHS = {
  es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
}

const TEXT = {
  es: { band: 'BANDA', dj: 'DJ', tbc: 'POR CONFIRMAR', vote: 'MI FLOR FAVORITA', confirmed: 'NOS VEMOS EN EL FESTIVAL', vendor: 'ENCUÉNTRANOS EN EL LOOKAT' },
  en: { band: 'BAND', dj: 'DJ', tbc: 'TO BE CONFIRMED', vote: 'MY FAVORITE FLOWER', confirmed: 'MY FAVORITE FLOWER', vendor: 'MY FAVORITE FLOWER' },
}

const base = import.meta.env.BASE_URL
const imageCache = new Map()
function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = () => { imageCache.delete(src); reject(new Error(`No se pudo cargar ${src}`)) }
      img.src = src
    }))
  }
  return imageCache.get(src)
}

const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)

/** @usuario a partir del link de Instagram o TikTok (si no, nada). */
export function handleFrom(url) {
  const m = typeof url === 'string' && url.match(/(?:instagram\.com|tiktok\.com)\/@?([\w.]+)/i)
  return m ? `@${m[1]}` : null
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return }
  // Safari < 16
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Corta un texto en líneas que caben en `maxWidth` (con la fuente actual). */
function wrap(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth || !line) line = test
    else { lines.push(line); line = word }
  }
  if (line) lines.push(line)
  return lines
}

/** Texto con espaciado entre letras (canvas no siempre soporta letterSpacing). */
function spacedText(ctx, text, x, y, spacing, align = 'left') {
  const chars = [...text]
  const width = chars.reduce((s, ch) => s + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1)
  let cx = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing }
  ctx.textAlign = prev
  return width
}

/** El tamaño de letra más grande (≤ max) con el que el texto cabe en `lines` líneas de `width`. */
function fitFont(ctx, text, family, weight, max, min, width, maxLines) {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`
    const lines = wrap(ctx, text, width)
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= width)) return { size, lines }
  }
  ctx.font = `${weight} ${min}px ${family}`
  return { size: min, lines: wrap(ctx, text, width) }
}

function drawFlower(ctx, x, y, size, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = color
  ctx.fill(new Path2D(FLOWER_PATH), 'evenodd')
  ctx.restore()
}

/** Imagen tipo "cover" con foco algo más arriba del centro (como object-position: center 30%). */
function drawCover(ctx, img, x, y, w, h, focusY = 0.3) {
  const scale = Math.max(w / img.width, h / img.height)
  const sw = w / scale
  const sh = h / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) * focusY
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function stripes(ctx, x, y, w, h) {
  ctx.fillStyle = C.violet
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(242,242,239,0.1)'
  ctx.lineWidth = 22
  for (let i = -h; i < w; i += 64) {
    ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); ctx.stroke()
  }
}

async function whiteLogo(size) {
  const img = await loadImage(logoUrl)
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const x = c.getContext('2d')
  x.drawImage(img, 0, 0, size, size)
  x.globalCompositeOperation = 'source-in'
  x.fillStyle = '#fff'
  x.fillRect(0, 0, size, size)
  return c
}

/** Encabezado: logo blanco y una cinta con edición, fecha y ciudad. */
async function drawHeader(ctx, lang) {
  const logo = await whiteLogo(250)
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 24
  ctx.drawImage(logo, (W - 250) / 2, 175)
  ctx.restore()
  const d = new Date(`${festival.date}T12:00:00`)
  const label = `${festival.edition[lang]} · ${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${festival.year} · ${festival.city}`.toUpperCase()
  ctx.font = `700 30px ${MONO}`
  const tw = [...label].reduce((s, ch) => s + ctx.measureText(ch).width, 0) + 3 * (label.length - 1)
  const pw = tw + 56
  ctx.fillStyle = C.ink
  roundRect(ctx, (W - pw) / 2, 445, pw, 58, 29)
  ctx.fill()
  ctx.fillStyle = C.paper
  ctx.textBaseline = 'middle'
  spacedText(ctx, label, W / 2, 475, 3, 'center')
}

/** Cinta inferior: frase (tinta, inclinada) y pastillas con el @ y la web. */
function drawFooter(ctx, phrase, handle) {
  if (String(phrase ?? '').trim()) drawPhrase(ctx, phrase)
  drawPills(ctx, handle)
}

/** Cinta negra inclinada con la frase y la flor. */
function drawPhrase(ctx, phrase) {
  ctx.save()
  ctx.translate(W / 2, 1585)
  ctx.rotate((2 * Math.PI) / 180)
  const text = displayText(String(phrase).trim().toUpperCase())
  let size = 54
  ctx.font = `900 ${size}px ${DISPLAY}`
  while (ctx.measureText(text).width + 150 > 940 && size > 36) { // frases largas: la cinta no toca los bordes
    size -= 2
    ctx.font = `900 ${size}px ${DISPLAY}`
  }
  const tw = ctx.measureText(text).width
  const pw = tw + 150
  ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10
  ctx.fillStyle = C.ink
  roundRect(ctx, -pw / 2, -50, pw, 100, 22)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = C.paper
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText(text, -pw / 2 + 50, 4)
  drawFlower(ctx, pw / 2 - 90, -22, 46, C.pink)
  ctx.restore()
}

/** Pastillas con el @ del artista o puesto y la web. */
function drawPills(ctx, handle) {
  const pills = [handle && { text: handle, bg: C.pink, fg: '#fff' }, { text: 'lookatflowers.github.io', bg: C.paper, fg: C.ink }].filter(Boolean)
  ctx.font = `700 32px ${MONO}`
  const widths = pills.map((p) => ctx.measureText(p.text).width + 52)
  const gap = 18
  let x = (W - widths.reduce((a, b) => a + b, 0) - gap * (pills.length - 1)) / 2
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  pills.forEach((p, i) => {
    ctx.fillStyle = p.bg
    roundRect(ctx, x, 1668, widths[i], 64, 32)
    ctx.fill()
    ctx.fillStyle = p.fg
    ctx.fillText(p.text, x + widths[i] / 2, 1701)
    x += widths[i] + gap
  })
}

/** Carta del artista (como en la web): foto, borde verde, nombre abajo y cinta "Por confirmar". */
async function drawArtistCard(ctx, artist, kind, lang) {
  const T = TEXT[lang]
  const cw = 680
  const ch = Math.round((cw * 88) / 63)
  const cx = W / 2
  const cy = 540 + ch / 2
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((-3 * Math.PI) / 180)
  const x = -cw / 2
  const y = -ch / 2
  // sombra y borde
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20
  ctx.fillStyle = C.green
  roundRect(ctx, x - 14, y - 14, cw + 28, ch + 28, 48)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  // foto
  ctx.save()
  roundRect(ctx, x, y, cw, ch, 36)
  ctx.clip()
  ctx.fillStyle = C.ink
  ctx.fillRect(x, y, cw, ch)
  let img = null
  if (artist.photo) img = await loadImage(`${base}${artist.photo}`).catch(() => null)
  if (img) drawCover(ctx, img, x, y, cw, ch)
  else stripes(ctx, x, y, cw, ch)
  // degradado inferior para el nombre
  const g = ctx.createLinearGradient(0, y + ch * 0.5, 0, y + ch)
  g.addColorStop(0, 'rgba(37,37,37,0)')
  g.addColorStop(0.55, 'rgba(37,37,37,0.6)')
  g.addColorStop(1, 'rgba(37,37,37,0.85)')
  ctx.fillStyle = g
  ctx.fillRect(x, y + ch * 0.5, cw, ch * 0.5)
  ctx.restore()
  // nombre
  const pad = 46
  const fit = fitFont(ctx, displayText(artist.name).toUpperCase(), DISPLAY, 900, 96, 50, cw - pad * 2, 3)
  const lh = fit.size * 1.0
  let ty = y + ch - pad - (fit.lines.length - 1) * lh
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16
  fit.lines.forEach((line, i) => ctx.fillText(line, x + pad, ty + i * lh))
  ctx.shadowColor = 'transparent'
  ctx.font = `500 28px ${MONO}`
  ctx.globalAlpha = 0.85
  spacedText(ctx, kind === 'dj' ? T.dj : T.band, x + pad, ty - fit.size - 6, 6)
  ctx.globalAlpha = 1
  // cinta "Por confirmar"
  if (!artist.confirmed) {
    ctx.fillStyle = C.yellow
    ctx.fillRect(x + 26, y + 26, cw - 52, 64)
    ctx.fillStyle = C.ink
    ctx.font = `700 30px ${MONO}`
    ctx.textBaseline = 'middle'
    spacedText(ctx, T.tbc, 0, y + 60, 5, 'center')
  }
  ctx.restore()
}

/** Cuadro del puesto (como en la web): tipo, nombre, etiquetas de producto y descripción. */
function drawVendorCard(ctx, vendor, primaryLabel, description) {
  const cw = 860
  const pad = 58
  const inner = cw - pad * 2
  // medir contenido
  const name = fitFont(ctx, displayText(vendor.name).toUpperCase(), DISPLAY, 900, 112, 64, inner - 70, 3)
  const nameH = name.lines.length * name.size * 1.0
  ctx.font = `700 30px ${MONO}`
  const tags = (vendor.secondary ?? []).map((t) => t.toUpperCase())
  const tagLines = tags.length ? wrap(ctx, tags.join(' · '), inner) : []
  ctx.font = `400 36px ${MONO}`
  let desc = description ? wrap(ctx, description, inner) : []
  if (desc.length > 7) { desc = desc.slice(0, 7); desc[6] = `${desc[6].replace(/[\s,.;:]+\S*$/, '')}…` }
  const h = pad + 58 + 34 + nameH + (tagLines.length ? 26 + tagLines.length * 46 : 0) + (desc.length ? 30 + desc.length * 52 : 0) + pad
  const areaTop = 540
  const areaBottom = 1500
  const cy = Math.max(areaTop + h / 2, (areaTop + areaBottom) / 2) // centrado en el espacio libre

  ctx.save()
  ctx.translate(W / 2, cy)
  ctx.rotate((-2.5 * Math.PI) / 180)
  const x = -cw / 2
  const y = -h / 2
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20
  ctx.fillStyle = C.paper
  roundRect(ctx, x, y, cw, h, 30)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 6
  ctx.strokeStyle = C.ink
  ctx.stroke()
  // tipo (rectángulo violeta)
  let cyy = y + pad
  ctx.font = `700 28px ${MONO}`
  const label = primaryLabel.toUpperCase()
  const lw = [...label].reduce((s, ch) => s + ctx.measureText(ch).width, 0) + 4 * (label.length - 1) + 40
  ctx.fillStyle = C.violet
  ctx.fillRect(x + pad, cyy, lw, 58)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  spacedText(ctx, label, x + pad + 20, cyy + 30, 4)
  drawFlower(ctx, x + cw - pad - 62, cyy - 4, 66, C.pink)
  cyy += 58 + 34
  // nombre
  ctx.font = `900 ${name.size}px ${DISPLAY}`
  ctx.fillStyle = C.ink
  ctx.textBaseline = 'top'
  name.lines.forEach((line, i) => ctx.fillText(line, x + pad, cyy + i * name.size))
  cyy += nameH
  // etiquetas
  if (tagLines.length) {
    cyy += 26
    ctx.font = `700 30px ${MONO}`
    ctx.fillStyle = C.violet
    tagLines.forEach((line, i) => ctx.fillText(line, x + pad, cyy + i * 46))
    cyy += tagLines.length * 46
  }
  // descripción
  if (desc.length) {
    cyy += 30
    ctx.font = `400 36px ${MONO}`
    ctx.fillStyle = C.ink
    desc.forEach((line, i) => ctx.fillText(line, x + pad, cyy + i * 52))
  }
  ctx.restore()
}

async function ensureFonts() {
  if (!document.fonts) return
  await Promise.all([
    document.fonts.load(`900 64px "Anderson Grotesk"`),
    document.fonts.load(`700 32px "JetBrains Mono"`),
    document.fonts.load(`400 32px "JetBrains Mono"`),
    document.fonts.load(`500 32px "JetBrains Mono"`),
  ]).catch(() => {})
}

/**
 * Crea la historia y la entrega como archivo JPG.
 *  item: { kind: 'band' | 'dj', artist } o { kind: 'vendor', vendor, primaryLabel, description }
 */
/** Frase por defecto de la cinta (siempre en español). */
export function defaultPhrase(item) {
  if (item.kind === 'vendor') return TEXT.es.vendor
  return item.artist.confirmed ? TEXT.es.confirmed : TEXT.es.vote
}

/** phrase: texto propio para la cinta (vacío = sin cinta); si no viene, la frase por defecto. */
export async function makeStory(item, { phrase } = {}) {
  const lang = 'es' // las historias van siempre en español, sin importar el idioma de la página
  const text = phrase ?? defaultPhrase(item)
  await ensureFonts()
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const name = item.kind === 'vendor' ? item.vendor.name : item.artist.name
  const bg = await loadImage(`${base}${BACKGROUNDS[hash(name) % BACKGROUNDS.length]}`).catch(() => null)
  if (bg) ctx.drawImage(bg, 0, 0, W, H)
  else { ctx.fillStyle = C.pink; ctx.fillRect(0, 0, W, H) }

  await drawHeader(ctx, lang)
  if (item.kind === 'vendor') {
    // En español siempre: tipo y descripción salen de los datos en español, no del idioma de la página
    drawVendorCard(ctx, item.vendor, item.vendor.primary?.[0] ?? 'Emprendimiento', item.vendor.description?.es ?? item.description)
    drawFooter(ctx, text, handleFrom(item.vendor.link))
  } else {
    await drawArtistCard(ctx, item.artist, item.kind, lang)
    drawFooter(ctx, text, handleFrom(item.artist.links?.instagram))
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  const slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return new File([blob], `lookatflowers-${slug}.jpg`, { type: 'image/jpeg' })
}
