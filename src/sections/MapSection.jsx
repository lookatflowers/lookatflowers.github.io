import { useState } from 'react'
import Section from '../components/Section'
import { MAP_SIZE, MAP_ZONES } from '../data/mapZones'
import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import './map.css'

const MAP_SRC = publicUrl('mapa/mapa-lookat.svg')
const PAD = 18 // margen alrededor de cada zona resaltada (unidades del SVG)

/**
 * Mapa interactivo: el dibujo (SVG estático, cacheable) con una capa encima que oscurece todo
 * menos la categoría elegida y la resalta. Se elige tocando una zona del mapa o con los botones.
 */
export default function MapSection() {
  const { t } = useLang()
  const [selected, setSelected] = useState(null)
  const zone = MAP_ZONES.find((z) => z.id === selected)
  const toggle = (id) => setSelected((cur) => (cur === id ? null : id))
  const box = ([x1, y1, x2, y2]) => ({ x: x1 - PAD, y: y1 - PAD, width: x2 - x1 + PAD * 2, height: y2 - y1 + PAD * 2 })

  return (
    <Section id="map" title={t('map.title')}>
      <p className="note">{t('map.intro')}</p>
      <div className="filters__row map__chips" role="group" aria-label={t('map.categories')}>
        {MAP_ZONES.map((z) => (
          <button key={z.id} type="button" className="chip" aria-pressed={selected === z.id} onClick={() => toggle(z.id)}>
            {t(`map.cats.${z.id}.label`)}
          </button>
        ))}
      </div>

      <div className="map">
        <div className="map__frame" style={{ aspectRatio: `${MAP_SIZE.width} / ${MAP_SIZE.height}` }}>
          <img className="map__img" src={MAP_SRC} alt={t('map.alt')} width={MAP_SIZE.width} height={MAP_SIZE.height} loading="lazy" decoding="async" />
          <svg
            className={`map__overlay${zone ? ' has-selection' : ''}`}
            viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null) }}
          >
            <defs>
              <mask id="map-mask">
                <rect width={MAP_SIZE.width} height={MAP_SIZE.height} fill="white" />
                {zone?.rects.map((r, i) => <rect key={i} {...box(r)} rx="28" fill="black" />)}
              </mask>
            </defs>
            <rect className="map__scrim" width={MAP_SIZE.width} height={MAP_SIZE.height} mask="url(#map-mask)" onClick={() => setSelected(null)} />
            {zone?.rects.map((r, i) => <rect key={`${zone.id}-${i}`} className="map__ring" {...box(r)} rx="28" />)}
            {MAP_ZONES.map((z) =>
              z.rects.map((r, i) => (
                <rect
                  key={`${z.id}-hit-${i}`}
                  className="map__hit"
                  {...box(r)}
                  rx="28"
                  role="button"
                  tabIndex={i === 0 ? 0 : -1}
                  aria-label={t(`map.cats.${z.id}.label`)}
                  aria-pressed={selected === z.id}
                  onClick={(e) => { e.stopPropagation(); toggle(z.id) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(z.id) } }}
                />
              )),
            )}
          </svg>
        </div>

        <div className="map__info" aria-live="polite">
          {zone ? (
            <>
              <h3 className="map__title">{t(`map.cats.${zone.id}.title`)}</h3>
              <p className="map__text">{t(`map.cats.${zone.id}.text`)}</p>
              {zone.link && (
                <a
                  className="map__link"
                  href={zone.link}
                  {...(zone.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {t(`map.cats.${zone.id}.link`)} →
                </a>
              )}
            </>
          ) : (
            <p className="map__text map__text--hint">{t('map.hint')}</p>
          )}
          <a className="map__big" href={MAP_SRC} target="_blank" rel="noopener noreferrer">{t('map.big')}</a>
        </div>
      </div>
    </Section>
  )
}
