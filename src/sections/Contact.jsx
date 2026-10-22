import Section from '../components/Section'
import { festival } from '../data/festival'
import { useLang } from '../i18n/useLang'

export default function Contact() {
  const { t } = useLang()
  return (
    <Section id="contact" title={t('contact.title')}>
      <p>{t('contact.text')}</p>
      <ul className="contact-links">
        <li>
          <a className="contact-link" href={festival.social.instagram} target="_blank" rel="noopener noreferrer">
            <span className="contact-link__label">{t('contact.instagram')}</span>
            <span className="contact-link__value">{festival.social.instagramHandle}</span>
          </a>
        </li>
        <li>
          <a className="contact-link" href={`mailto:${festival.email}`}>
            <span className="contact-link__label">{t('contact.email')}</span>
            <span className="contact-link__value">{festival.email}</span>
          </a>
        </li>
      </ul>
    </Section>
  )
}
