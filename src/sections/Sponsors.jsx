import Section from '../components/Section'
import { sponsors } from '../data/sponsors'
import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import '../components/sponsors.css'

const isSafeUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

// Cuadros de muestra mientras no haya logos
const SAMPLES = [
  ...Array.from({ length: 3 }, () => ({ size: 'full' })),
  ...Array.from({ length: 4 }, () => ({ size: 'small' })),
]

function Logo({ sponsor }) {
  const img = <img src={publicUrl(sponsor.svg)} alt={sponsor.name} loading="lazy" decoding="async" />
  return isSafeUrl(sponsor.link) ? (
    <a href={sponsor.link} target="_blank" rel="noopener noreferrer">{img}</a>
  ) : img
}

function Row({ items, size, render }) {
  const row = items.filter((s) => (s.size === 'small' ? 'small' : 'full') === size)
  if (row.length === 0) return null
  return (
    <ul className={`sponsors__row sponsors__row--${size}`}>
      {row.map((s, i) => <li key={s.name ?? i} className="sponsor">{render(s)}</li>)}
    </ul>
  )
}

export default function Sponsors() {
  const { t } = useLang()
  const empty = sponsors.length === 0
  const items = empty ? SAMPLES : sponsors
  const render = empty
    ? (s) => <span className="sponsor__sample" role="img" aria-label={t('sponsors.sample')}>{s.size === 'small' ? '70%' : '100%'}</span>
    : (s) => <Logo sponsor={s} />

  return (
    <Section id="sponsors" title={t('sponsors.title')}>
      <div className="sponsors">
        <Row items={items} size="full" render={render} />
        <Row items={items} size="small" render={render} />
      </div>
    </Section>
  )
}
