import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import './cards.css'

/** Frente con la incógnita. */
function MysteryFace({ label, hidden }) {
  return (
    <span className="card__face card__face--mystery" aria-hidden={hidden || undefined}>
      <span className="card__kind">{label}</span>
      <span className="card__mark">?</span>
    </span>
  )
}

/** Reverso "BANDA / POR CONFIRMAR" (rosa o verde según `tone`). */
function TbcFace({ kindLabel, tone, hidden }) {
  const { t } = useLang()
  return (
    <span className={`card__face card__face--back card__face--tbc tone-${tone}`} aria-hidden={hidden || undefined}>
      <span className="card__tbc-kind">{kindLabel}</span>
      <span className="card__tbc-text">{t('cards.tbc')}</span>
    </span>
  )
}

/** Cara con foto y nombre. `back`: va en el reverso · `tbc`: marca visible de por confirmar. */
function PhotoFace({ artist, label, back, tbc, hidden }) {
  const { t } = useLang()
  const photo = publicUrl(artist.photo)
  return (
    <span className={`card__face card__face--photo${back ? ' card__face--back' : ''}`} aria-hidden={hidden || undefined}>
      {photo ? (
        <img className="card__photo" src={photo} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="card__photo card__photo--empty" />
      )}
      <span className="card__info">
        <span className="card__kind card__kind--inline">{label}</span>
        <span className="card__name">{artist.name}</span>
        <span className="card__hint">{t('cards.more')}</span>
      </span>
      {tbc && <span className="card__tbc-badge">{t('cards.tbc')}</span>}
    </span>
  )
}

/**
 * Carta de artista. El modo lo decide Lineup a partir de src/data/artists.js:
 *  - 'mystery'   "?" -> gira y muestra BANDA / POR CONFIRMAR.
 *  - 'draw'      borde verde + "?" -> gira y muestra `shown` (nombre sorteado, por confirmar)
 *                o BANDA / POR CONFIRMAR si ya no quedan nombres libres.
 *  - 'confirmed' borde verde, foto + nombre de `shown` al frente; sin giro.
 */
export default function ArtistCard({ mode, kind, number, flipped, tone, shown, onClick }) {
  const { t } = useLang()
  const kindLabel = t(`cards.${kind}`)
  const label = `${kindLabel} ${number}`
  const fill = (key) => t(key).replace('{card}', label).replace('{name}', shown?.name ?? '')

  if (mode === 'confirmed') {
    return (
      <button type="button" className="card card--green" aria-label={fill('cards.ariaMore')} onClick={onClick}>
        <span className="card__inner">
          <PhotoFace artist={shown} label={label} />
        </span>
      </button>
    )
  }

  let aria = fill(mode === 'draw' ? 'cards.ariaDraw' : 'cards.ariaMystery')
  if (flipped) aria = fill(shown ? 'cards.ariaTbcMore' : 'cards.ariaBack')

  return (
    <button
      type="button"
      className={`card${mode === 'draw' ? ' card--green' : ''}${flipped ? ' is-flipped' : ''}`}
      aria-label={aria}
      onClick={onClick}
    >
      <span className="card__inner">
        <MysteryFace label={label} hidden={flipped} />
        {shown ? (
          <PhotoFace artist={shown} label={label} back tbc hidden={!flipped} />
        ) : (
          <TbcFace kindLabel={kindLabel} tone={tone} hidden={!flipped} />
        )}
      </span>
    </button>
  )
}
