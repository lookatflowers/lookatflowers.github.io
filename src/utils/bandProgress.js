// Progreso de scroll de las frases grandes (0 = entra por abajo, 1 = sale por arriba).
// Un solo listener para todas, y solo se calculan las que están a la vista. Escribe --k
// en cada elemento sin pasar por React, así no hay re-renderizados al hacer scroll.
const visible = new Set()
let observer = null
let listening = false
let raf = 0
let count = 0

function update() {
  raf = 0
  const vh = window.innerHeight
  for (const el of visible) {
    const r = el.getBoundingClientRect()
    const k = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
    el.style.setProperty('--k', k.toFixed(4))
  }
}

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(update)
}

function onIntersect(entries) {
  for (const e of entries) {
    if (e.isIntersecting) visible.add(e.target)
    else visible.delete(e.target)
  }
  schedule()
}

/** Empieza a seguir el scroll de `el`. Devuelve la función que lo detiene. */
export function observeBand(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.style.setProperty('--k', '1') // sin movimiento: letras encendidas y quietas
    return undefined
  }
  if (typeof IntersectionObserver === 'undefined') {
    visible.add(el)
  } else {
    observer ??= new IntersectionObserver(onIntersect, { rootMargin: '10% 0px' })
    observer.observe(el)
  }
  count += 1
  if (!listening) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    listening = true
  }
  schedule()

  return () => {
    visible.delete(el)
    observer?.unobserve(el)
    count -= 1
    if (count === 0 && listening) {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      listening = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
  }
}
