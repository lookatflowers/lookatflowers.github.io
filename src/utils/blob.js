// Manchas orgánicas deterministas (misma semilla = misma forma). Sirven para el cono
// provisional y, más adelante, para texturas de fondo o reversos de carta.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Path SVG cerrado y suave: n puntos alrededor de (cx, cy) con radio ~r y variación `jitter`. */
export function blobPath(cx, cy, r, seed, n = 9, jitter = 0.5) {
  const rand = rng(seed)
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const rr = r * (1 - jitter / 2 + rand() * jitter)
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]
  })
  const f = (v) => v.toFixed(1)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return `${d}Z`
}
