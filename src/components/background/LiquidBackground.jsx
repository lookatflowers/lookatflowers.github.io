import { useEffect, useRef } from 'react'
import { pulse } from '../../utils/pulse'
import { DEFAULT_LOOK, LOOKS, MOTION, PALETTES } from './palettes'
import { COLOR_FRAG, FIELD_FRAG, VERT } from './shader'
import './background.css'

/** Para probar sin tocar código (se combinan con &):
 *   ?bg=primavera|noche      paleta
 *   ?estilo=suave|marmol     preajuste completo (dureza, resolución y orden de colores)
 *   ?dureza=0..1             bordes entre colores: 0 degradado suave · 1 bordes definidos
 *   ?rampa=suave|marmol      orden de los colores del relieve (por defecto, el del estilo)
 *  Ejemplo: ?dureza=0.5&rampa=marmol */
function readLook() {
  const q = new URLSearchParams(window.location.search)
  const bg = Object.hasOwn(PALETTES, q.get('bg')) ? q.get('bg') : DEFAULT_LOOK.bg
  const estilo = Object.hasOwn(LOOKS, q.get('estilo')) ? q.get('estilo') : DEFAULT_LOOK.estilo
  const rampa = Object.hasOwn(LOOKS, q.get('rampa')) ? LOOKS[q.get('rampa')].ramp : LOOKS[estilo].ramp
  const raw = q.get('dureza')
  const num = raw === null || raw.trim() === '' ? NaN : Number(raw)
  const dureza = Number.isFinite(num) ? Math.min(1, Math.max(0, num)) : null
  return { bg, estilo, rampa, dureza }
}

function buildProgram(gl, frag) {
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
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, frag)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Error al enlazar el shader')
  }
  return program
}

// Resolución de salida: nativa de la pantalla (píxeles de dispositivo), con tope para 4K.
const MAX_OUT_PIXELS = 3_700_000 // ~2560 × 1440
// Escalones de calidad: si el equipo no da la talla se baja UN escalón, y nunca se vuelve a subir
// (así no hay vaivén ni tirones repetidos). field: multiplica la resolución del fluido · dpr: tope
// de densidad de la salida.
const QUALITY = [
  { field: 1, dpr: 2 },
  { field: 0.8, dpr: 1.5 },
  { field: 0.66, dpr: 1.25 },
  { field: 0.5, dpr: 1 },
]
const GRAIN = 0.5 // cantidad de grano 0–1 (antes --grain en background.css)
const GRAIN_STEP = 0.18 // segundos entre "saltos" del grano
const SLOW_FRAME = 0.025 // s: por encima de esto (≈ 40 fps) se considera que el equipo no da la talla

/**
 * Fondo líquido con grano (WebGL2, sin librerías). Dos pasadas: el fluido a resolución reducida
 * (lo costoso) y los colores, bordes de mármol, luz y grano a resolución nativa (barato y nítido).
 *  - Se acelera y se ilumina con `pulse` (el audio, o ?pulso=120 para la demo).
 *  - Solo corre mientras se ve la portada o alguna frase grande (el resto del sitio lo tapa
 *    con fondo blanco); también se detiene con la pestaña oculta.
 *  - El lienzo aparece recién con su primer cuadro válido: nunca se ve negro. Mientras tanto,
 *    o si WebGL2 falla, queda el degradado CSS de respaldo con grano CSS.
 *  - Si el navegador pierde el contexto WebGL, vuelve el respaldo y se recupera solo.
 *  - Con "reducir movimiento" dibuja un solo cuadro fijo.
 */
export default function LiquidBackground() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const root = document.documentElement
    const { bg, estilo, rampa, dureza } = readLook()
    root.dataset.bg = bg // el texto de la portada se adapta al fondo

    const look = LOOKS[estilo]
    const palette = PALETTES[bg]
    const ramp = palette[rampa]
    const sharp = dureza ?? look.sharp
    // Resolución base del fluido respecto a la salida: el degradado suave aguanta menos
    const fieldBase = dureza === null ? look.scale : 0.35 + 0.15 * dureza
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let gl = null
    let field = null // { prog, u, tex, fbo, w, h }
    let color = null // { prog, u }
    let level = 0
    let outW = 0
    let outH = 0
    let cssW = 0
    let cssH = 0
    let phase = 40
    let energy = 0
    let clock = 0
    let last = 0
    let raf = 0
    let frames = -30 // se ignoran los primeros cuadros (compilación, carga)
    let acc = 0
    let lost = false

    const setReady = (ready) => {
      if (ready) wrap.dataset.gl = 'ready'
      else delete wrap.dataset.gl
    }

    const init = () => {
      gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false })
      if (!gl) return false
      try {
        const fp = buildProgram(gl, FIELD_FRAG)
        const cp = buildProgram(gl, COLOR_FRAG)
        const uniforms = (prog, names) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)]))
        field = { prog: fp, u: uniforms(fp, ['u_res', 'u_aspect', 'u_t']), tex: gl.createTexture(), fbo: gl.createFramebuffer(), w: 0, h: 0 }
        color = {
          prog: cp,
          u: uniforms(cp, ['u_field', 'u_fieldRes', 'u_res', 'u_dpr', 'u_energy', 'u_sharp', 'u_center', 'u_glow', 'u_col', 'u_edge', 'u_grain', 'u_seed']),
        }
      } catch (err) {
        console.error('[LiquidBackground]', err)
        return false
      }
      gl.useProgram(color.prog)
      gl.uniform3fv(color.u.u_col, new Float32Array(ramp.cols.flat()))
      gl.uniform1fv(color.u.u_edge, new Float32Array(ramp.edges))
      gl.uniform3fv(color.u.u_glow, new Float32Array(palette.glow))
      gl.uniform1f(color.u.u_sharp, sharp)
      gl.uniform1f(color.u.u_grain, GRAIN)
      gl.uniform1i(color.u.u_field, 0)
      outW = 0 // fuerza a recalcular tamaños
      outH = 0
      return true
    }

    /** Ajusta lienzo y textura del fluido al tamaño real del elemento. false si aún no tiene tamaño. */
    const resize = () => {
      cssW = canvas.clientWidth
      cssH = canvas.clientHeight
      if (!gl || lost || cssW < 1 || cssH < 1) return false
      const q = QUALITY[level]
      const dpr = Math.min(window.devicePixelRatio || 1, q.dpr)
      const k = Math.min(1, Math.sqrt(MAX_OUT_PIXELS / (cssW * dpr * cssH * dpr)))
      const w = Math.max(1, Math.round(cssW * dpr * k))
      const h = Math.max(1, Math.round(cssH * dpr * k))
      if (w !== outW || h !== outH) {
        canvas.width = outW = w
        canvas.height = outH = h
      }
      const fw = Math.max(2, Math.round(w * fieldBase * q.field))
      const fh = Math.max(2, Math.round(h * fieldBase * q.field))
      if (fw !== field.w || fh !== field.h) {
        field.w = fw
        field.h = fh
        gl.bindTexture(gl.TEXTURE_2D, field.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindFramebuffer(gl.FRAMEBUFFER, field.fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, field.tex, 0)
      }
      return true
    }

    /** Altura del centro del parlante (mismas medidas que speaker.css), 0..1 desde abajo. */
    const lightCenter = () => {
      const header = document.querySelector('.header')?.offsetHeight ?? 56
      const size = Math.min(cssW * 0.88, cssH * 0.78)
      const startY = cssH * 0.5 + header / 2
      const endY = header + size * 0.105 + 12
      const p = parseFloat(root.style.getPropertyValue('--p')) || 0
      return 1 - (startY + (endY - startY) * p) / cssH
    }

    const draw = () => {
      if (!gl || lost || outW < 1 || cssH < 1) return
      // 1. Fluido, a resolución reducida
      gl.bindFramebuffer(gl.FRAMEBUFFER, field.fbo)
      gl.viewport(0, 0, field.w, field.h)
      gl.useProgram(field.prog)
      gl.uniform2f(field.u.u_res, field.w, field.h)
      gl.uniform1f(field.u.u_aspect, cssW / cssH)
      gl.uniform1f(field.u.u_t, phase)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      // 2. Color, luz y grano, a resolución nativa
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, outW, outH)
      gl.useProgram(color.prog)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, field.tex)
      gl.uniform2f(color.u.u_fieldRes, field.w, field.h)
      gl.uniform2f(color.u.u_res, outW, outH)
      gl.uniform1f(color.u.u_dpr, outW / cssW)
      gl.uniform1f(color.u.u_energy, energy)
      gl.uniform2f(color.u.u_center, 0.5, lightCenter())
      gl.uniform1f(color.u.u_seed, Math.floor(clock / GRAIN_STEP) % 997)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      setReady(true)
    }

    // Ventanas por las que se ve el fondo: la portada y las frases grandes
    const windows = new Set()
    const shouldRun = () => !reduced && !lost && Boolean(gl) && !document.hidden && windows.size > 0

    const frame = (now) => {
      raf = 0
      const real = Math.max(0, (now - last) / 1000)
      const dt = Math.min(0.05, real) // tras un tirón, el fluido no da un salto
      last = now
      clock += dt
      energy += (pulse.value - energy) * (1 - Math.exp(-dt * 9)) // suaviza el pulso
      phase += dt * MOTION.speed * (1 + energy * MOTION.boost) // el pulso acelera el fluido
      draw()

      // Calidad adaptativa: mide ~2 s seguidos con el tiempo real; si va lento, baja un escalón
      frames += 1
      if (frames > 0) acc += real
      if (frames === 120) {
        if (acc / 120 > SLOW_FRAME && level < QUALITY.length - 1) {
          level += 1
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
      frames = Math.min(frames, -10) // tras una pausa no se miden los primeros cuadros
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const onResize = () => {
      if (resize() && !raf) draw()
      start()
    }
    const onLost = (e) => {
      e.preventDefault() // permite que el navegador lo restaure
      lost = true
      stop()
      setReady(false) // vuelve el degradado de respaldo
    }
    const onRestored = () => {
      lost = false
      if (init() && resize()) draw()
      start()
    }

    if (!init()) return undefined

    let io = null
    const targets = document.querySelectorAll('.stage, .phrase')
    if (typeof IntersectionObserver === 'undefined' || targets.length === 0) {
      windows.add(root) // sin IntersectionObserver: siempre activo
    } else {
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) windows.add(e.target)
          else windows.delete(e.target)
        }
        if (windows.size === 0) stop()
        else start()
      })
      targets.forEach((el) => io.observe(el))
    }
    // Tamaño real del lienzo: cubre la carga con la ventana aún en 0, el zoom y la rotación
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize)
    ro?.observe(canvas)

    if (resize()) draw()
    start()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', start)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      stop()
      io?.disconnect()
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', start)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      if (!lost) {
        gl.deleteProgram(field.prog)
        gl.deleteProgram(color.prog)
        gl.deleteTexture(field.tex)
        gl.deleteFramebuffer(field.fbo)
      }
    }
  }, [])

  return (
    <div className="liquid" aria-hidden="true" ref={wrapRef}>
      <canvas ref={canvasRef} className="liquid__canvas" />
      <div className="liquid__grain" />
    </div>
  )
}
