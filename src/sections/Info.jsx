import Section from '../components/Section'
import { festival } from '../data/festival'
import { useLang } from '../i18n/useLang'
import { formatLongDate } from '../utils/format'

export default function Info() {
  const { lang, t } = useLang()
  return (
    <Section id="info" title={t('info.title')}>
      <dl className="facts">
        <div><dt>{t('info.date')}</dt><dd>{formatLongDate(festival.date, lang)}</dd></div>
        <div><dt>{t('info.venue')}</dt><dd>{festival.venue}, {festival.city}</dd></div>
        <div><dt>{t('info.start')}</dt><dd>{festival.startTime}</dd></div>
        <div><dt>{t('info.access')}</dt><dd>{t('info.accessText')}</dd></div>
      </dl>
    </Section>
  )
}
