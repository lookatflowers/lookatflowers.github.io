import { useEffect, useRef, useState } from 'react'
import Section from '../components/Section'
import ArtistCard from '../components/ArtistCard'
import ArtistDialog from '../components/ArtistDialog'
import { confirmedAt, lineup, lists } from '../data/artists'
import { useLang } from '../i18n/useLang'
import FlowerIcon from '../components/FlowerIcon'
import '../components/like.css'

// Ritmo de las cartas "por confirmar": boca arriba ~3 s (con variación para que no giren todas
// juntas), se dan vuelta, quedan ~1 s boca abajo y vuelven boca arriba con otro nombre.
const UP_MIN_MS = 2600
const UP_EXTRA_MS = 700 // + 0..0,7 s al azar → entre 2,6 y 3,3 s
const DOWN_MS = 1700 // 0,7 s de giro + ~1 s boca abajo
const TICK_MS = 200

const TYPES = ['band', 'dj']
const randomTone = () => (Math.random() < 0.5 ? 'pink' : 'green')
const slotsOf = (type) => Array.from({ length: lineup[type].total }, (_, i) => i + 1)
const poolOf = (type) => lists[type].filter((a) => !a.confirmed)
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Modo de la carta `slot` (ver ArtistCard y la cabecera de artists.js). */
function modeFor(type, slot) {
  if (confirmedAt(type, slot)) return 'confirmed'
  return poolOf(type).length === 0 || lineup[type].forzarIncognita.includes(slot) ? 'mystery' : 'draw'
}

/** Nombre al azar que no esté a la vista en otra carta del grupo ni sea el que ya tenía esta. */
function pickArtist(type, taken, current) {
  const pool = poolOf(type)
  const free = pool.filter((a) => !taken.includes(a.name) && a.name !== current)
  const others = pool.filter((a) => a.name !== current)
  const list = free.length > 0 ? free : others.length > 0 ? others : pool
  return list[Math.floor(Math.random() * list.length)]
}

/** Estado inicial: todas las cartas "por confirmar" boca arriba, con nombres distintos y
 *  tiempos desfasados (cada una gira por su cuenta). */
function initialCards() {
  const now = Date.now()
  const cards = {}
  const all = []
  for (const type of TYPES) {
    const taken = []
    cards[type] = {}
    for (const slot of slotsOf(type)) {
      if (modeFor(type, slot) !== 'draw') continue
      const artist = pickArtist(type, taken, null)
      taken.push(artist.name)
      cards[type][slot] = { artist, up: true, next: now }
      all.push(cards[type][slot])
    }
  }
  // Primer giro repartido parejo en un ciclo completo y en orden al azar: nunca giran todas juntas
  const cycle = UP_MIN_MS + UP_EXTRA_MS / 2 + DOWN_MS
  all.sort(() => Math.random() - 0.5).forEach((card, i) => {
    card.next = now + 1200 + (i / all.length) * cycle + Math.random() * 250
  })
  return cards
}

function Group({ type, title, cards, mystery, onCard, onHover }) {
  return (
    <div className="group">
      <h3 className="subtitle">{title}</h3>
      <ul className="cards" style={{ '--cols': lineup[type].total }}>
        {slotsOf(type).map((slot) => {
          const mode = modeFor(type, slot)
          const card = cards[slot]
          const flipped = mode === 'draw' ? card.up : mystery?.slot === slot
          return (
            <li key={slot}>
              <ArtistCard
                mode={mode}
                kind={type}
                flipped={flipped}
                tone={mystery?.slot === slot ? mystery.tone : 'pink'}
                shown={mode === 'confirmed' ? confirmedAt(type, slot) : mode === 'draw' ? card.artist : null}
                onClick={() => onCard(type, slot, mode)}
                onPointerEnter={() => onHover(type, slot, true)}
                onPointerLeave={() => onHover(type, slot, false)}
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
  const [cards, setCards] = useState(initialCards) // { band: { [slot]: { artist, up, next } }, dj: ... }
  const [mystery, setMystery] = useState({ band: null, dj: null }) // cartas sin nombres: giro manual
  const [selected, setSelected] = useState(null) // { artist, type? }
  const sectionRef = useRef(null)
  const hovered = useRef(new Set()) // 'band-3': el mouse encima la deja quieta para poder tocarla

  // Un solo reloj para todas las cartas. Se detiene si la sección no se ve, si la pestaña está
  // oculta, con una ventana abierta o con "reducir movimiento".
  useEffect(() => {
    const el = sectionRef.current
    if (!el || reducedMotion()) return
    let visible = false
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.1 })
    observer.observe(el)
    let lastActive = Date.now()
    const interval = setInterval(() => {
      if (!visible || selected || document.hidden) return
      const now = Date.now()
      // Tras una pausa, los relojes de todas las cartas se corren lo mismo: siguen desfasadas
      const paused = now - lastActive > TICK_MS * 3 ? now - lastActive - TICK_MS : 0
      lastActive = now
      setCards((prev) => {
        let changed = paused > 0
        const next = { ...prev }
        for (const type of TYPES) {
          const group = { ...prev[type] }
          for (const [slot, old] of Object.entries(group)) {
            const card = paused ? { ...old, next: old.next + paused } : old
            group[slot] = card
            if (now < card.next) continue
            if (hovered.current.has(`${type}-${slot}`) && card.up) {
              group[slot] = { ...card, next: now + 1000 }
            } else if (card.up) {
              group[slot] = { ...card, up: false, next: now + DOWN_MS }
            } else {
              const taken = Object.entries(group).filter(([s]) => s !== slot).map(([, c]) => c.artist.name)
              group[slot] = { artist: pickArtist(type, taken, card.artist.name), up: true, next: now + UP_MIN_MS + Math.random() * UP_EXTRA_MS }
            }
            changed = true
          }
          next[type] = group
        }
        return changed ? next : prev
      })
    }, TICK_MS)
    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [selected])

  const onHover = (type, slot, on) => {
    const key = `${type}-${slot}`
    if (on) hovered.current.add(key)
    else hovered.current.delete(key)
  }

  const onCard = (type, slot, mode) => {
    if (mode === 'confirmed') {
      setSelected({ artist: { ...confirmedAt(type, slot), kind: type } })
      return
    }
    if (mode === 'draw') {
      const card = cards[type][slot]
      if (card.up) {
        setSelected({ artist: { ...card.artist, kind: type, tbc: true }, type })
      } else {
        // Tocada boca abajo: se da vuelta al tiro con un nombre nuevo
        setCards((prev) => {
          const group = { ...prev[type] }
          const taken = Object.entries(group).filter(([s]) => s !== String(slot)).map(([, c]) => c.artist.name)
          group[slot] = { artist: pickArtist(type, taken, card.artist.name), up: true, next: Date.now() + UP_MIN_MS + UP_EXTRA_MS }
          return { ...prev, [type]: group }
        })
      }
      return
    }
    // Sin nombres disponibles: "?" ↔ BANDA / POR CONFIRMAR
    setMystery((prev) => ({ ...prev, [type]: prev[type]?.slot === slot ? null : { slot, tone: randomTone() } }))
  }

  return (
    <Section id="lineup" title={t('lineup.title')}>
      <div ref={sectionRef}>
        <p className="note">
          {t('lineup.note')}
          <FlowerIcon className="inline-flower" />
        </p>
        {TYPES.map((type) => (
          <Group
            key={type}
            type={type}
            title={t(type === 'band' ? 'lineup.bands' : 'lineup.djs')}
            cards={cards[type]}
            mystery={mystery[type]}
            onCard={onCard}
            onHover={onHover}
          />
        ))}
      </div>
      <ArtistDialog artist={selected?.artist ?? null} onClose={() => setSelected(null)} />
    </Section>
  )
}
