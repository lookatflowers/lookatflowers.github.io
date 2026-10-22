import Section from '../components/Section'
import { applications, applyUrl } from '../data/applications'
import { useLang } from '../i18n/useLang'
import { daysLeft, formatDeadline } from '../utils/deadline'
import { displayText } from '../utils/displayText'

/** Sección de la portada con accesos a cada tipo de postulación. */
export default function Apply() {
  const { lang, t, tr } = useLang()
  return (
    <Section id="apply" title={t('apply.title')}>
      <ul className="apply-buttons">
        {applications.map((a) => (
          <li key={a.id}>
            <a className="apply-button" href={applyUrl(a.id)}>
              {displayText(tr(a.label))}
              <span className="apply-button__date">
                {daysLeft(a.deadline) < 0 ? t('apply.closed') : `${t('apply.until')} ${formatDeadline(a.deadline, lang, { short: true })}`}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
