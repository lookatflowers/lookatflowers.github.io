import { useState } from 'react'
import Section from '../components/Section'
import VendorCard from '../components/VendorCard'
import { PRIMARY_TAGS, vendors } from '../data/vendors'
import { useLang } from '../i18n/useLang'

// Etiquetas secundarias: todas las que aparecen en vendors.js, sin repetir y en orden alfabético
const SECONDARY_TAGS = [...new Set(vendors.flatMap((v) => v.secondary ?? []))].sort((a, b) => a.localeCompare(b, 'es'))

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
  const [moreOpen, setMoreOpen] = useState(false)

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
          <div className="filters" role="group" aria-label={t('vendors.filters')}>
            <div className="filters__row">
              {PRIMARY_TAGS.map((tag) => (
                <Chip key={tag} label={primaryLabel(tag)} pressed={primary.includes(tag)} onClick={() => setPrimary((p) => toggle(p, tag))} />
              ))}
              {SECONDARY_TAGS.length > 0 && (
                <button
                  type="button"
                  className="chip chip--more"
                  aria-expanded={moreOpen}
                  aria-controls="vendor-secondary"
                  aria-label={t('vendors.moreFilters')}
                  title={t('vendors.moreFilters')}
                  onClick={() => setMoreOpen((o) => !o)}
                >
                  ⋯
                </button>
              )}
              {filtering && (
                <button type="button" className="filters__clear" onClick={() => { setPrimary([]); setSecondary([]) }}>
                  {t('vendors.clear')}
                </button>
              )}
            </div>
            {SECONDARY_TAGS.length > 0 && (
              <div id="vendor-secondary" className="filters__row" hidden={!moreOpen}>
                {SECONDARY_TAGS.map((tag) => (
                  <Chip key={tag} label={tag} secondary pressed={secondary.includes(tag)} onClick={() => setSecondary((s) => toggle(s, tag))} />
                ))}
              </div>
            )}
          </div>

          {shown.length === 0 ? (
            <p className="placeholder" role="status">{t('vendors.noMatch')}</p>
          ) : (
            <ul className="vendors">
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
