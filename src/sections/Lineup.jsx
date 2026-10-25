import { useEffect, useRef, useState } from 'react'
import Section from '../components/Section'
import ArtistCard from '../components/ArtistCard'
import ArtistDialog from '../components/ArtistDialog'
import { confirmedAt, lineup, lists } from '../data/artists'
import { useLang } from '../i18n/useLang'

// Cuánto tiempo queda dada vuelta una carta antes de volver sola a "?"
const AUTO_RETURN_MS = 5000
// Cada cuánto una carta al azar se balancea para invitar a tocarla
const NUDGE_EVERY_MS = 3500

const TYPES = ['band', 'dj']
const randomTone = () => (Math.random() < 0.5 ? 'pink' : 'green')
const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]
const slotsOf = (type) => Array.from({ length: lineup[type].total }, (_, i) => i + 1)

/** Modo de la carta `slot` (ver ArtistCard y la cabecera de artists.js). */
function modeFor(type, slot) {
  if (confirmedAt(type, slot)) return 'confirmed'
  const hasPool = lists[type].some((a) => !a.confirmed)
  return !hasPool || lineup[type].forzarIncognita.includes(slot) ? 'mystery' : 'draw'
}

/** Nombre al azar para una carta, evitando repetir el último que mostró este grupo. */
function drawName(type, last) {
  const pool = lists[type].filter((a) => !a.confirmed)
  if (pool.length === 0) return null
  const fresh = pool.filter((a) => a.name !== last)
  return pickRandom(fresh.length > 0 ? fresh : pool)
}

function Group({ type, title, flipped, nudge, onCard }) {
  return (
    <div className="group">
      <h3 className="subtitle">{title}</h3>
      <ul className="cards">
        {slotsOf(type).map((slot) => {
          const mode = modeFor(type, slot)
          const isFlipped = flipped?.slot === slot
          return (
            <li key={slot}>
              <ArtistCard
                mode={mode}
                kind={type}
                number={slot}
                flipped={isFlipped}
                nudge={nudge === `${type}-${slot}`}
                tone={isFlipped ? flipped.tone : 'pink'}
                shown={mode === 'confirmed' ? confirmedAt(type, slot) : isFlipped ? flipped.artist : null}
                onClick={() => onCard(type, slot, mode)}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Lineup() {
  const { t } = useLang()
  // Una sola carta dada vuelta por grupo: { band: { slot, tone, artist } | null, dj: ... }
  const [flipped, setFlipped] = useState({ band: null, dj: null })
  const [selected, setSelected] = useState(null) // { artist, type? }
  const [nudge, setNudge] = useState(null) // 'band-3' mientras se balancea
  const lastName = useRef({ band: null, dj: null })
  const sectionRef = useRef(null)

  // La carta vuelve sola a "?" a los pocos segundos (no mientras su ventana está abierta)
  useEffect(() => {
    const timers = TYPES.filter((type) => flipped[type] && selected?.type !== type).map((type) =>
      setTimeout(() => setFlipped((prev) => ({ ...prev, [type]: null })), AUTO_RETURN_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [flipped, selected])

  // Balanceo de invitación: solo con la sección a la vista, sin cartas giradas ni ventana abierta
  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let visible = false
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.25 })
    observer.observe(el)
    let clear
    const interval = setInterval(() => {
      if (!visible || selected || flipped.band || flipped.dj) return
      const candidates = TYPES.flatMap((type) =>
        slotsOf(type).filter((slot) => modeFor(type, slot) !== 'confirmed').map((slot) => `${type}-${slot}`),
      )
      if (candidates.length === 0) return
      setNudge(pickRandom(candidates))
      clear = setTimeout(() => setNudge(null), 900)
    }, NUDGE_EVERY_MS)
    return () => {
      observer.disconnect()
      clearInterval(interval)
      clearTimeout(clear)
    }
  }, [flipped, selected])

  const onCard = (type, slot, mode) => {
    if (mode === 'confirmed') {
      setSelected({ artist: { ...confirmedAt(type, slot), kind: type } })
      return
    }
    const current = flipped[type]
    if (current?.slot === slot) {
      // 2.º toque: con nombre abre la ventana; sin nombre vuelve a "?"
      if (current.artist) setSelected({ artist: { ...current.artist, kind: type, tbc: true }, type })
      else setFlipped((prev) => ({ ...prev, [type]: null }))
      return
    }
    // Gira esta carta; la que estaba dada vuelta en el grupo vuelve a "?"
    const artist = mode === 'draw' ? drawName(type, lastName.current[type]) : null
    if (artist) lastName.current[type] = artist.name
    setNudge(null)
    setFlipped((prev) => ({ ...prev, [type]: { slot, tone: randomTone(), artist } }))
  }

  const onClose = () => {
    const type = selected?.type
    setSelected(null)
    // Al cerrar la ventana de un nombre sorteado, la carta vuelve a "?"
    if (type) setFlipped((prev) => ({ ...prev, [type]: null }))
  }

  return (
    <Section id="lineup" title={t('lineup.title')}>
      <div ref={sectionRef}>
        <p className="note">{t('lineup.note')}</p>
        <Group type="band" title={t('lineup.bands')} flipped={flipped.band} nudge={nudge} onCard={onCard} />
        <Group type="dj" title={t('lineup.djs')} flipped={flipped.dj} nudge={nudge} onCard={onCard} />
      </div>
      <ArtistDialog artist={selected?.artist ?? null} onClose={onClose} />
    </Section>
  )
}
