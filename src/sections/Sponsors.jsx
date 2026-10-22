import Section from '../components/Section'
import { sponsors } from '../data/sponsors'
import { useLang } from '../i18n/useLang'
import { publicUrl } from '../utils/assets'
import '../components/sponsors.css'

const isSafeUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)
const SIZES = ['large', 'medium']

/** Logo con su nombre al pasar el cursor (o al enfocarlo con teclado). */
function Logo({ sponsor }) {
  const content = (
    <>
      <img src={publicUrl(sponsor.svg)} alt={sponsor.name} loading="lazy" decoding="async" />
      <span className="sponsor__name" aria-hidden="true">{sponsor.name}</span>
    </>
  )
  return isSafeUrl(sponsor.link) ? (
    <a className="sponsor__link" href={sponsor.link} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    <span className="sponsor__link">{content}</span>
  )
}

export default function Sponsors() {
  const { t } = useLang()
  if (sponsors.length === 0) return null

  return (
    <Section id="sponsors" title={t('sponsors.title')}>
      <div className="sponsors">
        {SIZES.map((size) => {
          const row = sponsors.filter((s) => (s.size === 'medium' ? 'medium' : 'large') === size)
          if (row.length === 0) return null
          return (
            <ul key={size} className={`sponsors__row sponsors__row--${size}`}>
              {row.map((s) => <li key={s.svg} className="sponsor"><Logo sponsor={s} /></li>)}
            </ul>
          )
        })}
      </div>
    </Section>
  )
}
