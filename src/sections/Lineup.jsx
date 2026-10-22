import { useState } from 'react'
import Section from '../components/Section'
import ArtistCard from '../components/ArtistCard'
import ArtistDialog from '../components/ArtistDialog'
import { confirmedAt, lineup, lists } from '../data/artists'
import { useLang } from '../i18n/useLang'

const randomTone = () => (Math.random() < 0.5 ? 'pink' : 'green')
const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]

/** Modo de la carta `slot` (ver ArtistCard y la cabecera de artists.js). */
function modeFor(type, slot) {
  if (confirmedAt(type, slot)) return 'confirmed'
  const hasPool = lists[type].some((a) => !a.confirmed)
  return !hasPool || lineup[type].forzarIncognita.includes(slot) ? 'mystery' : 'draw'
}

function Group({ type, title, cards, onCard }) {
  const slots = Array.from({ length: lineup[type].total }, (_, i) => i + 1)
  return (
    <div className="group">
      <h3 className="subtitle">{title}</h3>
      <ul className="cards">
        {slots.map((slot) => {
          const mode = modeFor(type, slot)
          const state = cards[`${type}-${slot}`]
          return (
            <li key={slot}>
              <ArtistCard
                mode={mode}
                kind={type}
                number={slot}
                flipped={Boolean(state?.flipped)}
                tone={state?.tone ?? 'pink'}
                shown={mode === 'confirmed' ? confirmedAt(type, slot) : state?.artist}
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
  // Estado de cada carta girable: { flipped, tone, artist } por clave 'band-3', 'dj-1'...
  const [cards, setCards] = useState({})
  const [selected, setSelected] = useState(null) // { artist, key? }

  const onCard = (type, slot, mode) => {
    const key = `${type}-${slot}`
    const state = cards[key]

    if (mode === 'confirmed') {
      setSelected({ artist: { ...confirmedAt(type, slot), kind: type } })
      return
    }
    if (mode === 'draw' && state?.flipped && state.artist) {
      setSelected({ artist: { ...state.artist, kind: type, tbc: true }, key })
      return
    }
    if (state?.flipped) {
      setCards((prev) => ({ ...prev, [key]: { ...prev[key], flipped: false } }))
      return
    }

    let artist = null
    if (mode === 'draw') {
      // Sin repetir un nombre que ya muestra otra carta girada del mismo grupo
      const taken = new Set(
        Object.entries(cards)
          .filter(([k, s]) => k.startsWith(`${type}-`) && s.flipped && s.artist)
          .map(([, s]) => s.artist.name),
      )
      const free = lists[type].filter((a) => !a.confirmed && !taken.has(a.name))
      artist = free.length > 0 ? pickRandom(free) : null
    }
    setCards((prev) => ({ ...prev, [key]: { flipped: true, tone: randomTone(), artist } }))
  }

  const onClose = () => {
    const key = selected?.key
    setSelected(null)
    // Al cerrar la ventana de un nombre sorteado, la carta vuelve a "?" y lo libera
    if (key) setCards((prev) => ({ ...prev, [key]: { ...prev[key], flipped: false } }))
  }

  return (
    <Section id="lineup" title={t('lineup.title')}>
      <p className="note">{t('lineup.note')}</p>
      <Group type="band" title={t('lineup.bands')} cards={cards} onCard={onCard} />
      <Group type="dj" title={t('lineup.djs')} cards={cards} onCard={onCard} />
      <ArtistDialog artist={selected?.artist ?? null} onClose={onClose} />
    </Section>
  )
}
