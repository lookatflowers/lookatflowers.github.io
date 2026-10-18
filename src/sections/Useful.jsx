import Section from '../components/Section'
import { useLang } from '../i18n/useLang'

export default function Useful() {
  const { t } = useLang()
  return (
    <Section id="useful" title={t('useful.title')}>
      <p className="placeholder">{t('useful.text')}</p>
    </Section>
  )
}
