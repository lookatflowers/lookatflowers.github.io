#!/usr/bin/env node
// Sincroniza la web con la planilla "Postulaciones LOOKAT E2".
//
// Lee las pestañas "Web Line-up" y "Web Puestos" (publicadas como CSV), valida los datos,
// prepara las fotos y reescribe:
//   src/data/generated/lineup.json   (lo usa src/data/artists.js)
//   src/data/generated/vendors.json  (lo usa src/data/vendors.js)
//   public/artists/*.webp            (fotos de artistas)
//
// Si encuentra un error no cambia ningún archivo y explica qué corregir en la planilla.
//
// Uso:
//   npm run sync                    lee las URLs de scripts/sync-web.config.json
//   npm run sync -- --dry           muestra lo que haría, sin escribir
//   npm run sync -- --lineup archivo.csv --vendors archivo.csv   (pruebas con CSV locales)
//
// Las URLs también se pueden pasar con las variables LINEUP_CSV_URL y VENDORS_CSV_URL.

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { lineup, PRIMARY_TAGS } from '../src/data/lineupConfig.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_LINEUP = join(ROOT, 'src/data/generated/lineup.json')
const OUT_VENDORS = join(ROOT, 'src/data/generated/vendors.json')
const PHOTO_DIR = join(ROOT, 'public/artists')
const PHOTO = { width: 630, height: 880, maxBytes: 100 * 1024 }
const LINK_KEYS = { Instagram: 'instagram', Spotify: 'spotify', SoundCloud: 'soundcloud', YouTube: 'youtube', Web: 'web' }

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const option = (name) => {
  const i = args.indexOf(name)
  return i !== -1 ? args[i + 1] : undefined
}
const DRY = flag('--dry')

const errors = []
const warnings = []
const fail = (msg) => errors.push(msg)
const warn = (msg) => warnings.push(msg)

/* ----------------------------- lectura ----------------------------- */

/** CSV (RFC 4180): comillas dobles, comas y saltos de línea dentro de campos. */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

/** Filas como objetos { encabezado: valor }, con el número de fila de la planilla. */
function toRecords(rows) {
  const [header = [], ...body] = rows
  const keys = header.map((h) => h.trim())
  return body
    .map((cells, i) => ({ row: i + 2, ...Object.fromEntries(keys.map((k, j) => [k, (cells[j] ?? '').trim()])) }))
    .filter((r) => keys.some((k) => r[k]))
}

async function loadCsv(label, file, url) {
  if (file) return readFile(file, 'utf8')
  if (!url) throw new Error(`Falta la URL del CSV de "${label}". Complétala en scripts/sync-web.config.json.`)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`No se pudo leer "${label}" (HTTP ${res.status}). ¿Sigue publicada la pestaña?`)
  const text = await res.text()
  if (/^\s*<!doctype html|<html/i.test(text)) {
    throw new Error(`"${label}" devolvió una página web, no un CSV. Revisa que el enlace termine en output=csv.`)
  }
  return text
}

/* ----------------------------- ayudas ------------------------------ */

const isChecked = (v) => /^(true|verdadero|s[ií]|1|x)$/i.test(String(v).trim())
const isExample = (name) => /^ejemplo\b/i.test(name)
const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'artista'

/** Devuelve una URL https válida o null. Acepta "@usuario" en Instagram y dominios sin https://. */
function normalizeUrl(value, kind) {
  let v = String(value || '').trim()
  if (!v) return ''
  if (kind === 'instagram' && /^@?[A-Za-z0-9._]+$/.test(v) && !v.includes('.com')) {
    return `https://www.instagram.com/${v.replace(/^@/, '')}/`
  }
  if (!/^https?:\/\//i.test(v) && /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v)) v = `https://${v}`
  try {
    const u = new URL(v)
    return /^https?:$/.test(u.protocol) ? u.toString() : null
  } catch {
    return null
  }
}

function bilingual(es, en) {
  if (!es && !en) return undefined
  const out = { es: es || en }
  if (en) out.en = en
  return out
}

/* ------------------------------ fotos ------------------------------ */

function driveId(url) {
  const m = url.match(/\/d\/([\w-]{10,})/) || url.match(/[?&]id=([\w-]{10,})/)
  return m ? m[1] : null
}

async function downloadImage(url) {
  const id = driveId(url)
  const source = id ? `https://drive.google.com/uc?export=download&id=${id}` : url
  const res = await fetch(source, { redirect: 'follow' })
  const type = res.headers.get('content-type') || ''
  if (!res.ok || !type.startsWith('image/')) {
    throw new Error(id
      ? 'Drive no entregó la imagen: compártela como "Cualquier persona con el enlace".'
      : `el enlace no es una imagen (HTTP ${res.status}, ${type || 'sin tipo'}).`)
  }
  return Buffer.from(await res.arrayBuffer())
}

/** Recorta a 630×880, convierte a WebP y baja la calidad hasta quedar bajo 100 KB. */
export async function optimizePhoto(input) {
  let out
  for (let quality = 82; quality >= 20; quality -= 6) {
    out = await sharp(input)
      .rotate()
      .resize(PHOTO.width, PHOTO.height, { fit: 'cover', position: 'attention' })
      .webp({ quality, effort: 5 })
      .toBuffer()
    if (out.length <= PHOTO.maxBytes) break
  }
  return out
}

async function preparePhoto(link, name, where) {
  if (!link) return undefined
  const url = normalizeUrl(link)
  if (!url) { fail(`${where}: el link de la foto no es válido.`); return undefined }
  const hash = createHash('sha1').update(driveId(url) || url).digest('hex').slice(0, 8)
  const file = `${slugify(name)}-${hash}.webp`
  const path = join(PHOTO_DIR, file)
  if (!existsSync(path)) {
    try {
      const buffer = await optimizePhoto(await downloadImage(url))
      if (!DRY) {
        await mkdir(PHOTO_DIR, { recursive: true })
        pendingPhotos.push([path, buffer])
      }
    } catch (e) {
      fail(`${where}: no se pudo preparar la foto (${e.message})`)
      return undefined
    }
  }
  return `artists/${file}`
}
const pendingPhotos = []

/* ------------------------------ line-up ---------------------------- */

async function buildLineup(records) {
  const out = { band: [], dj: [] }
  const usedSlots = { band: new Map(), dj: new Map() }
  const usedNames = { band: new Set(), dj: new Set() }
  const missingEnglish = []

  for (const r of records) {
    const name = r['Nombre'] || ''
    if (!isChecked(r['Publicar']) || isExample(name)) continue
    const where = `Web Line-up, fila ${r.row}${name ? ` (${name})` : ''}`
    const type = { banda: 'band', dj: 'dj' }[(r['Tipo'] || '').toLowerCase()]
    if (!type) { fail(`${where}: "Tipo" debe ser Banda o DJ.`); continue }
    if (!name) { fail(`${where}: falta el nombre.`); continue }
    const key = name.toLowerCase()
    if (usedNames[type].has(key)) { fail(`${where}: "${name}" está publicado dos veces.`); continue }
    usedNames[type].add(key)

    const estado = (r['Estado en la web'] || '').toLowerCase()
    const confirmed = estado === 'confirmado'
    if (!confirmed && estado !== 'por confirmar') { fail(`${where}: elige "Confirmado" o "Por confirmar" en "Estado en la web".`); continue }

    const entry = { name, confirmed }
    if (confirmed) {
      const slot = Number(r['Carta N°'])
      const total = lineup[type].total
      if (!Number.isInteger(slot) || slot < 1 || slot > total) {
        fail(`${where}: "Carta N°" debe ser un número de 1 a ${total}.`); continue
      }
      if (usedSlots[type].has(slot)) {
        fail(`${where}: la carta ${slot} ya la tiene "${usedSlots[type].get(slot)}".`); continue
      }
      usedSlots[type].set(slot, name)
      entry.slot = slot
    } else if (r['Carta N°']) {
      warn(`${where}: está "Por confirmar", así que se ignora la carta ${r['Carta N°']}.`)
    }

    const photo = await preparePhoto(r['Foto (link de Drive)'], name, where)
    if (photo) entry.photo = photo
    const bio = bilingual(r['Reseña (ES)'], r['Reseña (EN)'])
    if (bio) entry.bio = bio
    if (bio && !r['Reseña (EN)']) missingEnglish.push(name)

    const links = {}
    for (const [col, k] of Object.entries(LINK_KEYS)) {
      if (!r[col]) continue
      const url = normalizeUrl(r[col], k)
      if (url) links[k] = url
      else fail(`${where}: el link de ${col} no es válido ("${r[col]}").`)
    }
    if (Object.keys(links).length) entry.links = links
    out[type].push(entry)
  }

  if (missingEnglish.length) {
    warn(`Sin reseña en inglés (se muestra la de español): ${missingEnglish.join(', ')}.`)
  }
  const order = (a, b) => (a.confirmed === b.confirmed ? (a.slot ?? 0) - (b.slot ?? 0) : a.confirmed ? -1 : 1)
  return { bands: out.band.sort(order), djs: out.dj.sort(order) }
}

/* ------------------------------ puestos ---------------------------- */

function buildVendors(records) {
  const vendors = []
  const names = new Set()
  for (const r of records) {
    const name = r['Nombre'] || ''
    if (!isChecked(r['Publicar']) || isExample(name)) continue
    const where = `Web Puestos, fila ${r.row}${name ? ` (${name})` : ''}`
    if (!name) { fail(`${where}: falta el nombre.`); continue }
    if (names.has(name.toLowerCase())) { fail(`${where}: "${name}" está publicado dos veces.`); continue }
    names.add(name.toLowerCase())

    const primary = []
    const rawTags = (r['Tipo'] || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (!rawTags.length) { fail(`${where}: falta el "Tipo".`); continue }
    for (const raw of rawTags) {
      const tag = PRIMARY_TAGS.find((t) => t.toLowerCase() === raw.toLowerCase())
      if (tag) primary.push(tag)
      else fail(`${where}: el tipo "${raw}" no existe (usa ${PRIMARY_TAGS.join(', ')}).`)
    }
    if (primary.length !== rawTags.length) continue

    const secondary = [...new Set((r['Etiquetas'] || '').split(',').map((s) => s.trim()).filter(Boolean))]
    const vendor = { name, primary, secondary }
    const description = bilingual(r['Descripción (ES)'], r['Descripción (EN)'])
    if (description) vendor.description = description
    if (r['Link']) {
      const url = normalizeUrl(r['Link'], 'instagram')
      if (url) vendor.link = url
      else fail(`${where}: el link no es válido ("${r['Link']}").`)
    }
    vendors.push(vendor)
  }
  return vendors
}

/* ------------------------------ principal -------------------------- */

async function main() {
  const configPath = join(ROOT, 'scripts/sync-web.config.json')
  const config = existsSync(configPath) ? JSON.parse(await readFile(configPath, 'utf8')) : {}
  const lineupUrl = process.env.LINEUP_CSV_URL || config.lineupCsv
  const vendorsUrl = process.env.VENDORS_CSV_URL || config.vendorsCsv

  const [lineupCsv, vendorsCsv] = await Promise.all([
    loadCsv('Web Line-up', option('--lineup'), lineupUrl),
    loadCsv('Web Puestos', option('--vendors'), vendorsUrl),
  ])
  const lineupData = await buildLineup(toRecords(parseCsv(lineupCsv)))
  const vendorsData = buildVendors(toRecords(parseCsv(vendorsCsv)))

  for (const w of warnings) console.log(`Aviso · ${w}`)
  if (errors.length) {
    console.error(`\nNo se actualizó la web: hay ${errors.length} error(es) en la planilla.\n`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exit(1)
  }

  const count = (list) => `${list.filter((a) => a.confirmed).length} confirmados, ${list.filter((a) => !a.confirmed).length} por confirmar`
  console.log(`Bandas: ${count(lineupData.bands)}`)
  console.log(`DJs: ${count(lineupData.djs)}`)
  console.log(`Puestos: ${vendorsData.length}`)
  if (DRY) { console.log('\n(--dry: no se escribió nada)'); return }

  for (const [path, buffer] of pendingPhotos) await writeFile(path, buffer)
  await writeFile(OUT_LINEUP, `${JSON.stringify(lineupData, null, 2)}\n`)
  await writeFile(OUT_VENDORS, `${JSON.stringify(vendorsData, null, 2)}\n`)

  // Borra fotos que ya nadie usa
  const used = new Set([...lineupData.bands, ...lineupData.djs].map((a) => a.photo).filter(Boolean))
  if (existsSync(PHOTO_DIR)) {
    for (const file of await readdir(PHOTO_DIR)) {
      if (file.endsWith('.webp') && !used.has(`artists/${file}`)) await rm(join(PHOTO_DIR, file))
    }
  }
  console.log('\nListo: datos de la web actualizados.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`\nNo se actualizó la web: ${e.message}`)
    process.exit(1)
  })
}
