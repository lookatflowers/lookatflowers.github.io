// Pulso del audio compartido (0–1). Lo escribe la fuente de audio (o la demo) y lo leen
// el parlante (por CSS) y el fondo (por WebGL). No usa estado de React: se actualiza a
// 60 fps sin volver a renderizar nada.
export const pulse = { value: 0 }

let target = null

/** El parlante registra el elemento donde se escribe --pulse (solo ese subárbol se recalcula). */
export function registerPulseTarget(el) {
  target = el
  return () => {
    if (target === el) target = null
  }
}

export function setPulse(v) {
  const value = Math.min(1, Math.max(0, v))
  pulse.value = value
  if (target) target.style.setProperty('--pulse', value.toFixed(3))
}
