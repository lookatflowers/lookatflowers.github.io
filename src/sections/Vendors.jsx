import Section from '../components/Section'
import { vendors } from '../data/vendors'
import { useLang } from '../i18n/useLang'

export default function Vendors() {
  const { t, tr } = useLang()
  return (
    <Section id="vendors" title={t('vendors.title')}>
      {vendors.length === 0 ? (
        <p className="placeholder">{t('vendors.empty')}</p>
      ) : (
        <ul className="roster">
          {vendors.map((v) => (
            <li key={v.id}>
              <span className="roster__name">{v.name}</span>
              {v.category && <span className="tag">{tr(v.category)}</span>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
