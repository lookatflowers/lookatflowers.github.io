import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/useLang'
import './share.css'

/** Ícono universal de compartir: caja con flecha hacia arriba. */
export function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 11.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7.5" />
    </svg>
  )
}

const canShareFile = (file) => {
  try {
    return Boolean(file && navigator.canShare?.({ files: [file] }))
  } catch {
    return false
  }
}

/**
 * Botón "Compartir historia": arma la imagen 1080×1920 (src/utils/storyImage.js), la muestra y
 * permite compartirla (menú del celular → Instagram → Historia) o descargarla.
 *  item: lo que recibe makeStory · name: para textos accesibles · anchor: sección de la web (#lineup)
 *  compact: solo el ícono (tarjetas de puestos)
 */
export default function ShareStory({ item, name, anchor, compact = false }) {
  const { t, lang } = useLang()
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}${import.meta.env.BASE_URL}#${anchor}`

  useEffect(() => {
    const dialog = ref.current
    if (open && dialog && !dialog.open) dialog.showModal()
  }, [open])

  useEffect(() => () => url && URL.revokeObjectURL(url), [url])

  const copyLink = () =>
    navigator.clipboard?.writeText(link).then(
      () => setCopied(true),
      () => setCopied(false),
    )

  const onOpen = async (e) => {
    e.stopPropagation()
    setOpen(true)
    setError(false)
    copyLink() // así queda listo para pegarlo en el sticker de enlace de Instagram
    if (file) return
    try {
      const { makeStory } = await import('../utils/storyImage')
      const made = await makeStory(item, lang)
      setFile(made)
      setUrl(URL.createObjectURL(made))
    } catch {
      setError(true)
    }
  }

  const close = () => ref.current?.close()

  const onShare = async () => {
    try {
      await navigator.share({ files: [file] })
    } catch {
      /* el usuario canceló */
    }
  }

  return (
    <>
      <button
        type="button"
        className={`share${compact ? ' share--compact' : ''}`}
        aria-label={compact ? `${t('share.button')}: ${name}` : undefined}
        title={compact ? t('share.button') : undefined}
        onClick={onOpen}
      >
        <ShareIcon />
        {!compact && <span>{t('share.button')}</span>}
      </button>

      {open && (
        <dialog
          ref={ref}
          className="story-dialog"
          aria-label={t('share.title')}
          onClose={(e) => { e.stopPropagation(); setOpen(false) }}
          onCancel={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); if (e.target === ref.current) close() }}
        >
          <div className="story-dialog__body">
            <button type="button" className="dialog__close" aria-label={t('cards.close')} onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
            <p className="story-dialog__title">{t('share.title')}</p>
            <div className="story-dialog__preview">
              {url ? (
                <img src={url} alt={t('share.alt').replace('{name}', name)} width="1080" height="1920" />
              ) : (
                <p className="story-dialog__status">{error ? t('share.error') : t('share.loading')}</p>
              )}
            </div>
            <div className="story-dialog__actions">
              {canShareFile(file) && (
                <button type="button" className="story-btn story-btn--main" onClick={onShare}>
                  <ShareIcon /> {t('share.share')}
                </button>
              )}
              {url && (
                <a className="story-btn" href={url} download={file.name}>
                  {t('share.download')}
                </a>
              )}
              <button type="button" className="story-btn" onClick={copyLink}>
                {copied ? t('share.copied') : t('share.copy')}
              </button>
            </div>
            <p className="story-dialog__hint">{canShareFile(file) || !url ? t('share.hintMobile') : t('share.hintDesktop')}</p>
          </div>
        </dialog>
      )}
    </>
  )
}
