// Paletas del fondo. Todos los colores salen de la paleta de marca.
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

const PINK = hex('#D44488')
const GREEN = hex('#61D6AD')
const VIOLET = hex('#7772C9')
const YELLOW = hex('#F4D35E')
const INK = hex('#252525')
const BLACK = [0, 0, 0]

// Cada fondo tiene dos versiones según el estilo:
//   soft: degradados que fluyen (liquid grain). Los colores contiguos se mezclan bien.
//   hard: bordes definidos, como el mármol de los afiches.
// cols: 6 colores del "relieve" del fluido, de bajo a alto · edges: 5 umbrales (0–1)
// glow: color de la luz que "late" con la música.
export const PALETTES = {
  // Edición Primavera: rosa y verde dominantes, acentos violeta y amarillo
  primavera: {
    soft: { cols: [PINK, PINK, VIOLET, GREEN, GREEN, YELLOW], edges: [0.26, 0.42, 0.58, 0.74, 0.92] },
    hard: { cols: [PINK, GREEN, PINK, GREEN, VIOLET, YELLOW], edges: [0.34, 0.46, 0.58, 0.7, 0.86] },
    glow: YELLOW,
  },
  // Noche: base oscura (cercana a la referencia Liquid Grain) con la paleta encendida
  noche: {
    soft: { cols: [mix(INK, BLACK, 0.4), mix(VIOLET, INK, 0.65), PINK, PINK, YELLOW, YELLOW], edges: [0.26, 0.46, 0.6, 0.76, 0.92] },
    hard: { cols: [mix(INK, BLACK, 0.4), mix(PINK, INK, 0.65), PINK, VIOLET, GREEN, YELLOW], edges: [0.34, 0.46, 0.58, 0.72, 0.88] },
    glow: PINK,
  },
}

// sharp: 0 = degradados suaves · 1 = bordes definidos
// scale: resolución del fluido respecto a la pantalla. Los colores, bordes y grano van siempre a
//        resolución nativa; menos = más liviano (el degradado suave aguanta menos).
export const LOOKS = {
  suave: { sharp: 0, scale: 0.35, ramp: 'soft' },
  marmol: { sharp: 1, scale: 0.5, ramp: 'hard' },
}

// Estilo por defecto: mármol (bordes definidos). Equivale a ?dureza=1&rampa=marmol.
// Para volver al degradado suave: estilo: 'suave'.
export const DEFAULT_LOOK = { bg: 'primavera', estilo: 'marmol' }

// Movimiento: velocidad base del fluido y cuánto se acelera con el pulso (0 = nada)
export const MOTION = { speed: 0.6, boost: 1.8 }
