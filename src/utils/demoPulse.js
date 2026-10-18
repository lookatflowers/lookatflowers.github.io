import { setPulse } from './pulse'

/** Vista previa SIN audio: simula un bombo a los BPM indicados en la URL, p. ej. ?pulso=120.
 *  Sirve para evaluar cómo reaccionan el parlante y el fondo antes de tener la música.
 *  Devuelve la función que lo detiene (o undefined si la URL no lo pide). */
export function startDemoPulse() {
  const bpm = Number(new URLSearchParams(window.location.search).get('pulso'))
  if (!Number.isFinite(bpm) || bpm < 30 || bpm > 220) return undefined

  let raf = 0
  const t0 = performance.now()
  const tick = (now) => {
    const beat = (((now - t0) / 1000) * bpm) / 60
    setPulse(Math.exp(-(beat % 1) * 5)) // golpe seco que decae
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(raf)
    setPulse(0)
  }
}
