import Section from '../components/Section'
import { applications, applyUrl } from '../data/applications'
import { useLang } from '../i18n/useLang'

/** Sección de la portada con accesos a cada tipo de postulación. */
export default function Apply() {
  const { t, tr } = useLang()
  return (
    <Section id="apply" title={t('apply.title')}>
      <ul className="apply-buttons">
        {applications.map((a) => (
          <li key={a.id}>
            <a className="apply-button" href={applyUrl(a.id)}>{tr(a.label)}</a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
