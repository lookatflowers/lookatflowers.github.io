import { useEffect, useRef } from 'react'
import { pulse } from '../../utils/pulse'
import { DEFAULT_LOOK, LOOKS, MOTION, PALETTES } from './palettes'
import { FRAG, VERT } from './shader'
import './background.css'

/** Para probar sin tocar código: ?bg=primavera|noche  &estilo=suave|marmol */
function readLook() {
  const q = new URLSearchParams(window.location.search)
  const bg = Object.hasOwn(PALETTES, q.get('bg')) ? q.get('bg') : DEFAULT_LOOK.bg
  const estilo = Object.hasOwn(LOOKS, q.get('estilo')) ? q.get('estilo') : DEFAULT_LOOK.estilo
  return { bg, estilo }
}

function buildProgram(gl) {
  const compile = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Error al compilar el shader')
    }
    return shader
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Error al enlazar el shader')
  }
  return program
}

const MAX_PIXELS = 700_000 // tope de píxeles internos (pantallas 4K)

/**
 * Fondo líquido con grano (WebGL2, sin librerías). Dibuja a menor resolución que la
 * pantalla —es un fluido suave— y el grano va en una capa CSS a resolución nativa.
 *  - Se acelera y se ilumina con `pulse` (el audio, o ?pulso=120 para la demo).
 *  - Se detiene cuando la pestaña no se ve o el contenido ya lo tapó.
 *  - Con "reducir movimiento" dibuja un solo cuadro fijo.
 *  - Si WebGL2 falla, queda el degradado CSS de respaldo.
 */
export default function LiquidBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const root = document.documentElement
    const { bg, estilo } = readLook()
    root.dataset.bg = bg // el texto de la portada se adapta al fondo

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) return undefined

    let program
    try {
      program = buildProgram(gl)
    } catch (err) {
      console.error('[LiquidBackground]', err)
      return undefined
    }
    gl.useProgram(program)

    const loc = (name) => gl.getUniformLocation(program, name)
    const uRes = loc('u_res')
    const uT = loc('u_t')
    const uEnergy = loc('u_energy')
    const uCenter = loc('u_center')

    const look = LOOKS[estilo]
    const palette = PALETTES[bg]
    const ramp = palette[look.ramp]
    gl.uniform3fv(loc('u_col'), new Float32Array(ramp.cols.flat()))
    gl.uniform1fv(loc('u_edge'), new Float32Array(ramp.edges))
    gl.uniform3fv(loc('u_glow'), new Float32Array(palette.glow))
    gl.uniform1f(loc('u_sharp'), look.sharp)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let scale = look.scale
    let phase = 40
    let energy = 0
    let last = 0
    let raf = 0
    let frames = -20 // se ignoran los primeros cuadros (compilación)
    let acc = 0
    let startY = 0
    let endY = 0
    let height = 1

    const resize = () => {
      const w0 = window.innerWidth * scale
      const h0 = window.innerHeight * scale
      const k = Math.min(1, Math.sqrt(MAX_PIXELS / (w0 * h0)))
      const w = Math.max(2, Math.round(w0 * k))
      const h = Math.max(2, Math.round(h0 * k))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        gl.uniform2f(uRes, w, h)
      }
      // Dónde está el centro del parlante (mismas medidas que speaker.css)
      const W = window.innerWidth
      const H = window.innerHeight
      const header = 3.5 * parseFloat(getComputedStyle(root).fontSize)
      const size = Math.min(W * 0.88, H * 0.78)
      height = H
      startY = H * 0.5 + header / 2
      endY = header + size * 0.105 + 12
    }

    const draw = () => {
      const p = parseFloat(root.style.getPropertyValue('--p')) || 0
      const y = startY + (endY - startY) * p
      gl.uniform1f(uT, phase)
      gl.uniform1f(uEnergy, energy)
      gl.uniform2f(uCenter, 0.5, 1 - y / height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const shouldRun = () => !reduced && !document.hidden && window.scrollY < window.innerHeight * 2

    const frame = (now) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      energy += (pulse.value - energy) * (1 - Math.exp(-dt * 9)) // suaviza el pulso
      phase += dt * MOTION.speed * (1 + energy * MOTION.boost) // el pulso acelera el fluido
      draw()

      // Calidad adaptativa: si el equipo no da la talla, baja la resolución interna
      frames += 1
      if (frames > 0) acc += dt
      if (frames === 45) {
        if (acc / 45 > 0.032 && scale > 0.3) {
          scale *= 0.8
          resize()
        }
        frames = 0
        acc = 0
      }
      if (shouldRun()) raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (raf || !shouldRun()) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const onResize = () => {
      resize()
      if (!raf) draw()
    }
    const onLost = (e) => {
      e.preventDefault()
      canvas.style.visibility = 'hidden' // deja ver el degradado de respaldo
    }

    resize()
    draw()
    start()
    window.addEventListener('scroll', start, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', start)
    canvas.addEventListener('webglcontextlost', onLost)
    return () => {
      window.removeEventListener('scroll', start)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', start)
      canvas.removeEventListener('webglcontextlost', onLost)
      if (raf) cancelAnimationFrame(raf)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <div className="liquid" aria-hidden="true">
      <canvas ref={canvasRef} className="liquid__canvas" />
      <div className="liquid__grain" />
    </div>
  )
}
