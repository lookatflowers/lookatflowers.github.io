// Al abrir la página con un ancla (p. ej. /#sponsors) el navegador intenta saltar antes de que
// React dibuje las secciones, y se queda arriba. Esto hace el salto apenas existe la sección y lo
// repite cuando terminan de cargar las fuentes y la página (que cambian un poco las alturas).
// Si la persona ya empezó a moverse por la página, no se la mueve más.
const USER_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown']

/** Devuelve la función que deja de escuchar (para usar en un useEffect). */
export function scrollToHashOnLoad() {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id) return undefined

  let active = true
  const stop = () => {
    active = false
    USER_EVENTS.forEach((type) => window.removeEventListener(type, stop))
    window.removeEventListener('load', go)
  }
  function go() {
    if (!active) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }

  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  USER_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }))
  requestAnimationFrame(go)
  document.fonts?.ready.then(go)
  if (document.readyState === 'complete') setTimeout(go, 0)
  else window.addEventListener('load', go, { once: true })
  const timer = setTimeout(stop, 4000) // pasado esto, la página ya está estable

  return () => {
    clearTimeout(timer)
    stop()
  }
}
