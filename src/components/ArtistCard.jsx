import { useState } from 'react'
import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import './cards.css'

function CheckIcon() {
  return (
    <svg className="card__check" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5 9.5 17 19 7.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Cara con la incógnita (por confirmar / confirmado sin revelar). */
function MysteryFace({ confirmed, kindLabel, hidden }) {
  const { t } = useLang()
  return (
    <span className="card__face card__face--mystery" aria-hidden={hidden || undefined}>
      <span className="card__kind">{kindLabel}</span>
      <span className="card__mark">¿?</span>
      {confirmed && (
        <>
          <span className="card__badge"><CheckIcon /><span>{t('lineup.confirmed')}</span></span>
          <span className="card__hint">{t('cards.reveal')}</span>
        </>
      )}
    </span>
  )
}

/** Cara con foto y nombre (carta revelada). */
function RevealFace({ artist, kindLabel, hidden }) {
  const { t } = useLang()
  const photo = publicUrl(artist.photo)
  return (
    <span className="card__face card__face--reveal" aria-hidden={hidden || undefined}>
      {photo ? (
        <img className="card__photo" src={photo} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="card__photo card__photo--empty" />
      )}
      <span className="card__info">
        <span className="card__kind card__kind--inline">{kindLabel}</span>
        <span className="card__name">{artist.name}</span>
        <span className="card__hint">{t('cards.more')}</span>
      </span>
      {artist.provisional && <span className="card__provisional">{t('provisional')}</span>}
    </span>
  )
}

/**
 * Estados:
 *  - status 'tbc'       -> carta con incógnita, sin interacción.
 *  - status 'confirmed' -> incógnita + señal de confirmado; 1.er toque la gira y revela;
 *                          2.º toque llama a onOpen(artist) (ventana de información).
 */
export default function ArtistCard({ artist, onOpen }) {
  const { t } = useLang()
  const [revealed, setRevealed] = useState(false)
  const kindLabel = t(`cards.${artist.kind}`)

  if (artist.status !== 'confirmed') {
    return (
      <div className="card card--tbc" role="img" aria-label={`${kindLabel}: ${t('lineup.tbc')}`}>
        <span className="card__inner">
          <MysteryFace confirmed={false} kindLabel={kindLabel} />
        </span>
      </div>
    )
  }

  const label = t(revealed ? 'cards.ariaMore' : 'cards.ariaReveal').replace('{name}', artist.name)

  return (
    <button
      type="button"
      className={`card card--confirmed${revealed ? ' is-flipped' : ''}`}
      aria-label={label}
      onClick={() => (revealed ? onOpen(artist) : setRevealed(true))}
    >
      <span className="card__inner">
        <MysteryFace confirmed kindLabel={kindLabel} hidden={revealed} />
        <RevealFace artist={artist} kindLabel={kindLabel} hidden={!revealed} />
      </span>
    </button>
  )
}
