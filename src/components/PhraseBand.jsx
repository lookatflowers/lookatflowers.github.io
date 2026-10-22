import { useEffect, useRef } from 'react'
import { phrases } from '../data/phrases'
import { useLang } from '../i18n/useLang'
import { observeBand } from '../utils/bandProgress'
import './phrase.css'
import { displayText } from '../utils/displayText'

/** Frase gigante decorativa: se desplaza en horizontal al hacer scroll vertical y sus
 *  letras se "encienden" de izquierda a derecha. Repite texto que ya existe en la página,
 *  por eso es aria-hidden. */
export default function PhraseBand({ id }) {
  const { tr } = useLang()
  const ref = useRef(null)
  useEffect(() => observeBand(ref.current), [])

  const phrase = phrases[id]
  if (!phrase) return null
  const chars = Array.from(displayText(tr(phrase.text)))

  return (
    <div ref={ref} className="phrase" aria-hidden="true">
      <span className="phrase__text" style={{ '--n': chars.length }}>
        {chars.map((ch, i) => (
          <span key={i} className="phrase__char" style={{ '--i': i }}>{ch === ' ' ? '\u00A0' : ch}</span>
        ))}
      </span>
    </div>
  )
}
