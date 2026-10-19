import Section from '../components/Section'
import VendorCard from '../components/VendorCard'
import { vendors } from '../data/vendors'
import { useLang } from '../i18n/useLang'

export default function Vendors() {
  const { t } = useLang()
  return (
    <Section id="vendors" title={t('vendors.title')}>
      {vendors.length === 0 ? (
        <p className="placeholder">{t('vendors.empty')}</p>
      ) : (
        <ul className="vendors">
          {vendors.map((v) => (
            <li key={v.id}><VendorCard vendor={v} /></li>
          ))}
        </ul>
      )}
    </Section>
  )
}
