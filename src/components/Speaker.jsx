import { useEffect, useRef } from 'react'
import logo from '../assets/brand/logo.svg'
import { blobPath } from '../utils/blob'
import { registerPulseTarget } from '../utils/pulse'
import './speaker.css'

// Recorrido de scroll (fracción del alto de pantalla) en el que el cono sube.
// Mantener igual que --travel (75svh) en speaker.css.
const TRAVEL_FRACTION = 0.75

const C = 500 // centro del lienzo SVG (1000 × 1000)

// Manchas del cono PROVISIONAL: [color, cx, cy, radio, semilla]
const BLOBS = [
  ['green', 385, 360, 125, 11],
  ['violet', 645, 415, 105, 23],
  ['yellow', 610, 655, 115, 7],
  ['ink', 395, 625, 72, 31],
  ['green', 690, 560, 55, 5],
  ['violet', 455, 245, 62, 17],
  ['yellow', 325, 520, 52, 29],
  ['ink', 565, 330, 36, 13],
].map(([color, cx, cy, r, seed]) => ({ color, d: blobPath(cx, cy, r, seed) }))

const RIDGES = [300, 238, 176] // surcos concéntricos del cono
const SCREWS = Array.from({ length: 8 }, (_, i) => {
  const a = ((i * 45 + 22.5) * Math.PI) / 180
  return [C + Math.cos(a) * 444, C + Math.sin(a) * 444]
})

/** Escribe el avance del scroll (0 → 1, suavizado) en --p de <html>, y marca
 *  data-hero="past" cuando la portada (#top) ya salió de pantalla para ocultar el parlante.
 *  No pasa por el estado de React: evita renderizar en cada fotograma. */
function useScrollProgress() {
  useEffect(() => {
    const root = document.documentElement
    const stage = document.getElementById('top')
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const past = stage ? y > stage.offsetTop + stage.offsetHeight : false
      const p = Math.min(1, Math.max(0, y / (window.innerHeight * TRAVEL_FRACTION)))
      root.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(4))
      if (past !== (root.dataset.hero === 'past')) {
        if (past) root.dataset.hero = 'past'
        else delete root.dataset.hero
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
}

/**
 * Parlante de la portada (decorativo). Tres capas independientes para que el giro
 * se componga en la GPU sin volver a dibujar el SVG:
 *   1. cono + goma (gira)      2. marco, tornillos y luz (fijo)      3. tapa con logo (fija)
 * --pulse (0–1) queda disponible para que el audio haga "latir" el parlante.
 */
export default function Speaker() {
  useScrollProgress()
  const pulseRef = useRef(null)
  useEffect(() => registerPulseTarget(pulseRef.current), [])

  return (
    <div className="speaker" aria-hidden="true">
      <div className="speaker__pulse" ref={pulseRef}>
        <svg className="speaker__layer speaker__spin" viewBox="0 0 1000 1000" focusable="false">
          <defs>
            <clipPath id="speaker-cone-clip"><circle cx={C} cy={C} r="352" /></clipPath>
          </defs>
          <circle cx={C} cy={C} r="398" className="fill-ink" />
          <circle cx={C} cy={C} r="373" fill="none" stroke="#303030" strokeWidth="16" />
          <circle cx={C} cy={C} r="352" className="fill-pink" />
          <g clipPath="url(#speaker-cone-clip)">
            {BLOBS.map((b, i) => <path key={i} d={b.d} className={`fill-${b.color}`} />)}
          </g>
          {RIDGES.map((r) => (
            <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="6" />
          ))}
        </svg>

        <svg className="speaker__layer" viewBox="0 0 1000 1000" focusable="false">
          <defs>
            <radialGradient id="speaker-shade" cx="50%" cy="50%" r="50%">
              <stop offset="62%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="speaker-glint" cx="32%" cy="26%" r="62%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            className="speaker__frame"
            fillRule="evenodd"
            d="M10 500a490 490 0 1 0 980 0a490 490 0 1 0 -980 0ZM102 500a398 398 0 1 0 796 0a398 398 0 1 0 -796 0Z"
          />
          {SCREWS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="17" fill="#2a2a2a" />
              <circle cx={x - 4} cy={y - 4} r="6" fill="#fff" fillOpacity="0.25" />
            </g>
          ))}
          <circle cx={C} cy={C} r="398" fill="url(#speaker-shade)" />
          <circle cx={C} cy={C} r="398" fill="url(#speaker-glint)" />
        </svg>

        <div className="speaker__cap">
          <img src={logo} alt="" width="1000" height="1000" decoding="async" />
        </div>
      </div>
    </div>
  )
}
