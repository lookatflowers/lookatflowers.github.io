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
  const { t } = useLang()
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [phrase, setPhrase] = useState(null) // null = aún no se carga la frase por defecto
  const [defaultText, setDefaultText] = useState('')
  const [renderedFor, setRenderedFor] = useState(null) // frase de la imagen que se ve ahora
  const renderId = useRef(0)
  const firstRender = useRef(true)
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

  // Arma la imagen al abrir y cada vez que cambia la frase (con una pausa corta mientras se escribe)
  useEffect(() => {
    if (!open || phrase === null) return
    const id = ++renderId.current
    const wait = firstRender.current ? 0 : 450
    firstRender.current = false
    const timer = setTimeout(async () => {
      try {
        const { makeStory } = await import('../utils/storyImage')
        const made = await makeStory(item, { phrase })
        if (id !== renderId.current) return // llegó una versión más nueva
        setFile(made)
        setUrl(URL.createObjectURL(made))
        setRenderedFor(phrase)
        setError(false)
      } catch {
        if (id === renderId.current) setError(true)
      }
    }, wait)
    return () => clearTimeout(timer)
  }, [open, phrase, item])

  const onOpen = async (e) => {
    e.stopPropagation()
    setOpen(true)
    copyLink() // así queda listo para pegarlo en el sticker de enlace de Instagram
    if (phrase !== null) return
    try {
      const { defaultPhrase } = await import('../utils/storyImage')
      const text = defaultPhrase(item)
      setDefaultText(text)
      setPhrase(text)
    } catch {
      setError(true)
    }
  }

  const busy = phrase !== null && phrase !== renderedFor
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
                <img className={busy ? 'is-busy' : undefined} src={url} alt={t('share.alt').replace('{name}', name)} width="1080" height="1920" />
              ) : (
                <p className="story-dialog__status">{error ? t('share.error') : t('share.loading')}</p>
              )}
            </div>
            {phrase !== null && (
              <div className="story-phrase">
                <label className="story-phrase__label" htmlFor={`phrase-${anchor}-${name}`}>{t('share.phrase')}</label>
                <div className="story-phrase__row">
                  <input
                    id={`phrase-${anchor}-${name}`}
                    className="story-phrase__input"
                    type="text"
                    value={phrase}
                    maxLength={30}
                    placeholder={t('share.phraseEmpty')}
                    autoComplete="off"
                    enterKeyHint="done"
                    onChange={(e) => setPhrase(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                  />
                  {phrase !== defaultText && (
                    <button type="button" className="story-phrase__reset" onClick={() => setPhrase(defaultText)} title={t('share.reset')} aria-label={t('share.reset')}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="story-dialog__actions">
              {canShareFile(file) && (
                <button type="button" className="story-btn story-btn--main" onClick={onShare} disabled={busy}>
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
