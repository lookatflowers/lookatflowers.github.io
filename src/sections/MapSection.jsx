import Section from '../components/Section'
import { useLang } from '../i18n/useLang'

export default function MapSection() {
  const { t } = useLang()
  return (
    <Section id="map" title={t('map.title')}>
      <p className="placeholder">{t('map.text')}</p>
    </Section>
  )
}
