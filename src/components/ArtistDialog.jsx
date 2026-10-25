import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import './cards.css'
import { displayText } from '../utils/displayText'

const LINK_LABELS = {
  instagram: 'Instagram',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  web: 'Web',
}

/** Ventana emergente con reseña y enlaces. Usa <dialog> nativo:
 *  foco atrapado, cierre con Escape y devolución del foco sin librerías. */
export default function ArtistDialog({ artist, onClose }) {
  const { t, tr } = useLang()
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (artist && !dialog.open) dialog.showModal()
    if (!artist && dialog.open) dialog.close()
  }, [artist])

  const links = Object.entries(artist?.links ?? {}).filter(([, url]) => url)
  const photo = publicUrl(artist?.photo)

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="artist-dialog-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}
    >
      {artist && (
        <div className="dialog__body">
          <button type="button" className="dialog__close" aria-label={t('cards.close')} onClick={() => ref.current.close()}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
          {photo ? (
            <img className="dialog__photo" src={photo} alt={artist.name} />
          ) : (
            <div className="dialog__photo dialog__photo--empty" aria-hidden="true" />
          )}
          <div className="dialog__text">
            {artist.tbc && <p className="dialog__tbc">{t('cards.tbc')}</p>}
            <div>
              <p className="card__kind card__kind--inline">{t(`cards.${artist.kind}`)}</p>
              <h3 id="artist-dialog-title" className="dialog__title">{displayText(artist.name)}</h3>
            </div>
            <p className="dialog__bio">{tr(artist.bio) || t('cards.noBio')}</p>
            {links.length > 0 && (
              <ul className="dialog__links">
                {links.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer">{LINK_LABELS[key] ?? key}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
