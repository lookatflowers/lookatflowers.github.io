import Section from '../components/Section'
import { festival } from '../data/festival'
import { useLang } from '../i18n/useLang'

export default function Contact() {
  const { t } = useLang()
  return (
    <Section id="contact" title={t('contact.title')}>
      <p>{t('contact.text')}</p>
      <p>
        <a href={festival.social.instagram} target="_blank" rel="noopener noreferrer">
          Instagram · @lookatflowers.cl
        </a>
      </p>
    </Section>
  )
}
