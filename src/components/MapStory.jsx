import { useEffect, useRef, useState } from 'react'
import { MAP_SIZE, MAP_ZONES } from '../data/mapZones'
import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import { mapPhrase, pinLabel } from '../utils/mapStoryText'
import { ShareIcon } from './ShareStory'
import FlowerIcon from './FlowerIcon'
import './share.css'
import './map-story.css'

const MAP_SRC = publicUrl('mapa/mapa-lookat.svg')
const PAD = 18
// Orden de búsqueda: los baños del Casino están dentro del Casino, por eso van antes que "comida"
const ZONE_ORDER = ['acceso', 'escenarios', 'feria', 'banos', 'comida']
const STEP = 40 // movimiento con flechas (unidades del mapa)

function zoneAt({ x, y }) {
  for (const id of ZONE_ORDER) {
    const zone = MAP_ZONES.find((z) => z.id === id)
    if (zone?.rects.some(([x1, y1, x2, y2]) => x >= x1 - PAD && x <= x2 + PAD && y >= y1 - PAD && y <= y2 + PAD)) return id
  }
  return null
}

const clampPin = ({ x, y }) => ({
  x: Math.round(Math.min(Math.max(x, 40), MAP_SIZE.width - 40)),
  y: Math.round(Math.min(Math.max(y, 380), MAP_SIZE.height - 20)), // arriba: que el pin no se corte
})

const canShareFile = (file) => {
  try {
    return Boolean(file && navigator.canShare?.({ files: [file] }))
  } catch {
    return false
  }
}

/**
 * "Crear mi historia del mapa": la persona escribe su nombre, presiona el mapa donde va a estar
 * (o no pone pin), la frase se elige sola según la zona (se puede cambiar) y la hora es opcional.
 * Luego ve la historia 1080×1920 y la comparte o descarga.
 */
export default function MapStory() {
  const { t } = useLang()
  const ref = useRef(null)
  const pickerRef = useRef(null)
  const dragging = useRef(false)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('edit') // 'edit' | 'preview'
  const [name, setName] = useState('')
  const [pin, setPin] = useState(null)
  const [time, setTime] = useState(null) // null = sin hora (por defecto)
  const [customPhrase, setCustomPhrase] = useState(null) // null = automática según la zona
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}${import.meta.env.BASE_URL}#map`

  const autoPhrase = mapPhrase(pin ? zoneAt(pin) : null, Boolean(pin))
  const phrase = customPhrase ?? autoPhrase

  useEffect(() => {
    const dialog = ref.current
    if (open && dialog && !dialog.open) dialog.showModal()
  }, [open])

  useEffect(() => () => url && URL.revokeObjectURL(url), [url])

  // Arma la imagen al pasar a la vista previa
  useEffect(() => {
    if (!open || step !== 'preview') return
    let cancelled = false
    import('../utils/storyImage')
      .then(({ makeMapStory }) => makeMapStory({ pin, name, time: time || '', phrase }))
      .then((made) => {
        if (cancelled) return
        setFile(made)
        setUrl(URL.createObjectURL(made))
        setError(false)
      })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [open, step, pin, name, time, phrase])

  const copyLink = () =>
    navigator.clipboard?.writeText(link).then(
      () => setCopied(true),
      () => setCopied(false),
    )

  const close = () => ref.current?.close()

  // Punto del mapa (en coordenadas del SVG) bajo el dedo o el mouse
  const pointFrom = (e) => {
    const r = pickerRef.current.getBoundingClientRect()
    return clampPin({ x: ((e.clientX - r.left) / r.width) * MAP_SIZE.width, y: ((e.clientY - r.top) / r.height) * MAP_SIZE.height })
  }

  // Un toque (click) pone o mueve el pin; deslizar sobre el mapa sigue haciendo scroll
  const onPickerClick = (e) => {
    if (dragging.current) return
    setPin(pointFrom(e))
  }
  // Arrastrar el pin
  const onPinDown = (e) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
  }
  const onPinMove = (e) => { if (dragging.current) setPin(pointFrom(e)) }
  const onPinUp = () => { setTimeout(() => { dragging.current = false }, 0) }

  const onPickerKey = (e) => {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    if (moves[e.key]) {
      e.preventDefault()
      const [dx, dy] = moves[e.key]
      setPin((p) => clampPin(p ? { x: p.x + dx * STEP, y: p.y + dy * STEP } : { x: MAP_SIZE.width / 2, y: MAP_SIZE.height / 2 }))
    } else if ((e.key === 'Enter' || e.key === ' ') && !pin) {
      e.preventDefault()
      setPin({ x: MAP_SIZE.width / 2, y: MAP_SIZE.height / 2 })
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      setPin(null)
    }
  }

  const goPreview = () => {
    setUrl(null)
    setFile(null)
    setStep('preview')
    copyLink() // listo para pegarlo en el sticker de enlace de Instagram
  }

  const onShare = async () => {
    try {
      await navigator.share({ files: [file] })
    } catch {
      /* el usuario canceló */
    }
  }

  const pinStyle = pin ? { left: `${(pin.x / MAP_SIZE.width) * 100}%`, top: `${(pin.y / MAP_SIZE.height) * 100}%` } : null
  const labelBelow = pin && pin.y < 540

  return (
    <>
      <button type="button" className="share mapstory__open" onClick={() => { setStep('edit'); setOpen(true) }}>
        <FlowerIcon className="mapstory__open-flower" />
        <span>{t('mapStory.button')}</span>
      </button>

      {open && (
        <dialog
          ref={ref}
          className="story-dialog mapstory"
          aria-label={t('mapStory.title')}
          onClose={() => setOpen(false)}
          onClick={(e) => { if (e.target === ref.current) close() }}
        >
          <div className="story-dialog__body">
            <button type="button" className="dialog__close" aria-label={t('cards.close')} onClick={close}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
            <p className="story-dialog__title">{t('mapStory.title')}</p>

            {step === 'edit' ? (
              <>
                <div className="story-phrase">
                  <label className="story-phrase__label" htmlFor="mapstory-name">{t('mapStory.step1')}</label>
                  <input
                    id="mapstory-name"
                    className="story-phrase__input"
                    type="text"
                    value={name}
                    maxLength={18}
                    placeholder={t('mapStory.namePlaceholder')}
                    autoComplete="given-name"
                    enterKeyHint="done"
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                  />
                </div>

                <div className="story-phrase">
                  <span className="story-phrase__label" id="mapstory-step2">{t('mapStory.step2')}</span>
                  <div
                    ref={pickerRef}
                    className={`mapstory__picker${pin ? ' has-pin' : ''}`}
                    style={{ aspectRatio: `${MAP_SIZE.width} / ${MAP_SIZE.height}` }}
                    role="application"
                    tabIndex={0}
                    aria-labelledby="mapstory-step2"
                    aria-description={t('mapStory.pinAria')}
                    onClick={onPickerClick}
                    onKeyDown={onPickerKey}
                  >
                    <img src={MAP_SRC} alt="" width={MAP_SIZE.width} height={MAP_SIZE.height} draggable="false" />
                    {!pin && (
                      <span className="mapstory__tap" aria-hidden="true">
                        <span className="mapstory__tap-dot" />
                        {t('mapStory.tapHint')}
                      </span>
                    )}
                    {pin && (
                      <span
                        className={`mapstory__pin${labelBelow ? ' is-below' : ''}${pin.x < MAP_SIZE.width * 0.22 ? ' is-left' : pin.x > MAP_SIZE.width * 0.78 ? ' is-right' : ''}`}
                        style={pinStyle}
                        onPointerDown={onPinDown}
                        onPointerMove={onPinMove}
                        onPointerUp={onPinUp}
                        onPointerCancel={onPinUp}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="mapstory__label">{pinLabel(name, time)}</span>
                        <svg className="mapstory__drop" viewBox="0 0 48 64" aria-hidden="true">
                          <path d="M24 62C20 50 3 40 3 24a21 21 0 0 1 42 0c0 16-17 26-21 38Z" />
                        </svg>
                        <FlowerIcon className="mapstory__drop-flower" />
                      </span>
                    )}
                  </div>
                  <div className="mapstory__row">
                    <p className="mapstory__hint">{pin ? t('mapStory.moveHint') : t('mapStory.noPinHint')}</p>
                    {pin && (
                      <button type="button" className="story-btn mapstory__small" onClick={() => setPin(null)}>
                        {t('mapStory.removePin')}
                      </button>
                    )}
                  </div>
                  {pin && (time === null ? (
                    <button type="button" className="story-btn mapstory__small mapstory__addtime" onClick={() => setTime('')}>
                      {t('mapStory.addTime')}
                    </button>
                  ) : (
                    <div className="mapstory__time">
                      <label htmlFor="mapstory-time">{t('mapStory.timeLabel')}</label>
                      <input id="mapstory-time" type="time" step="300" value={time} onChange={(e) => setTime(e.target.value)} autoFocus />
                      <button type="button" className="story-btn mapstory__small" onClick={() => setTime(null)}>
                        {t('mapStory.removeTime')}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="story-phrase">
                  <label className="story-phrase__label" htmlFor="mapstory-phrase">{t('mapStory.step3')}</label>
                  <div className="story-phrase__row">
                    <input
                      id="mapstory-phrase"
                      className="story-phrase__input"
                      type="text"
                      value={phrase}
                      maxLength={30}
                      placeholder={t('share.phraseEmpty')}
                      autoComplete="off"
                      enterKeyHint="done"
                      onChange={(e) => setCustomPhrase(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                    />
                    {customPhrase !== null && customPhrase !== autoPhrase && (
                      <button type="button" className="story-phrase__reset" onClick={() => setCustomPhrase(null)} title={t('share.reset')} aria-label={t('share.reset')}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="mapstory__hint">{t('mapStory.phraseAuto')}</p>
                </div>

                <div className="story-dialog__actions mapstory__sticky">
                  <button type="button" className="story-btn story-btn--main" onClick={goPreview}>
                    {t('mapStory.next')} →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="story-dialog__preview">
                  {url ? (
                    <img src={url} alt={t('share.alt').replace('{name}', name || t('nav.map'))} width="1080" height="1920" />
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
                  <button type="button" className="story-btn" onClick={() => setStep('edit')}>
                    {t('mapStory.back')}
                  </button>
                </div>
                <p className="story-dialog__hint">{canShareFile(file) || !url ? t('share.hintMobile') : t('share.hintDesktop')}</p>
              </>
            )}
          </div>
        </dialog>
      )}
    </>
  )
}
