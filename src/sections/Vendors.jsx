import { useState } from 'react'
import Section from '../components/Section'
import VendorCard from '../components/VendorCard'
import { PRIMARY_TAGS, PRODUCT_TAGS, vendors } from '../data/vendors'
import { useLang } from '../i18n/useLang'
import { displayText } from '../utils/displayText'
import FlowerIcon from '../components/FlowerIcon'
import '../components/like.css'

// Solo se muestran filtros que tengan al menos un puesto
const usedSecondary = new Set(vendors.flatMap((v) => v.secondary ?? []))
const SECONDARY_TAGS = [
  ...PRODUCT_TAGS.filter((tag) => usedSecondary.has(tag)),
  ...[...usedSecondary].filter((tag) => !PRODUCT_TAGS.includes(tag)).sort((a, b) => a.localeCompare(b, 'es')),
]
// El filtro principal (Emprendimiento / Comida / Bebida) solo aparece si hay más de un tipo
const usedPrimary = PRIMARY_TAGS.filter((tag) => vendors.some((v) => v.primary?.includes(tag)))
const SHOWN_PRIMARY = usedPrimary.length > 1 ? usedPrimary : []

// Letras de la palabra más larga entre todos los nombres: todas las tarjetas usan el mismo tamaño
// de título, el mayor en que esa palabra cabe entera (ver .vendor__name en vendors.css)
const LONGEST_WORD = Math.max(1, ...vendors.flatMap((v) => displayText(v.name).split(/\s+/).map((w) => w.length)))

const toggle = (list, tag) => (list.includes(tag) ? list.filter((x) => x !== tag) : [...list, tag])

// OR dentro del grupo; un grupo sin etiquetas elegidas no restringe
const matchesGroup = (selected, tags = []) => selected.length === 0 || selected.some((tag) => tags.includes(tag))

function Chip({ label, pressed, secondary, onClick }) {
  return (
    <button type="button" className={`chip${secondary ? ' chip--secondary' : ''}`} aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  )
}

export default function Vendors() {
  const { t } = useLang()
  const [primary, setPrimary] = useState([])
  const [secondary, setSecondary] = useState([])

  const primaryLabel = (tag) => {
    const label = t(`vendors.primary.${tag}`)
    return label.startsWith('vendors.') ? tag : label
  }
  // AND entre el grupo principal y el secundario
  const shown = vendors.filter((v) => matchesGroup(primary, v.primary) && matchesGroup(secondary, v.secondary))
  const filtering = primary.length > 0 || secondary.length > 0

  return (
    <Section id="vendors" title={t('vendors.title')}>
      {vendors.length === 0 ? (
        <p className="placeholder">{t('vendors.empty')}</p>
      ) : (
        <>
          <p className="note">
            {t('vendors.note')}
            <FlowerIcon className="inline-flower" />
          </p>
          <div className="filters" role="group" aria-label={t('vendors.filters')}>
            {SHOWN_PRIMARY.length > 0 && (
              <div className="filters__row">
                {SHOWN_PRIMARY.map((tag) => (
                  <Chip key={tag} label={primaryLabel(tag)} pressed={primary.includes(tag)} onClick={() => setPrimary((p) => toggle(p, tag))} />
                ))}
              </div>
            )}
            {SECONDARY_TAGS.length > 0 && (
              <div className="filters__row">
                {SECONDARY_TAGS.map((tag) => (
                  <Chip key={tag} label={tag} secondary pressed={secondary.includes(tag)} onClick={() => setSecondary((s) => toggle(s, tag))} />
                ))}
              </div>
            )}
            {filtering && (
              <div className="filters__row">
                <button type="button" className="filters__clear" onClick={() => { setPrimary([]); setSecondary([]) }}>
                  {t('vendors.clear')}
                </button>
              </div>
            )}
          </div>

          {shown.length === 0 ? (
            <p className="placeholder" role="status">{t('vendors.noMatch')}</p>
          ) : (
            <ul className="vendors" style={{ '--longest': LONGEST_WORD }}>
              {shown.map((v) => (
                <li key={v.name}><VendorCard vendor={v} primaryLabel={primaryLabel} /></li>
              ))}
            </ul>
          )}
        </>
      )}
    </Section>
  )
}
