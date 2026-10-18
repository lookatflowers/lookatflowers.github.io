import { useLang } from '../i18n/useLang'

const links = ['info', 'lineup', 'schedule', 'vendors', 'useful', 'map', 'contact']

export default function Header() {
  const { lang, setLang, t } = useLang()
  return (
    <header className="header">
      <a className="header__brand" href="#top">LOOK AT FLOWERS</a>
      <nav className="header__nav" aria-label={t('nav.label')}>
        {links.map((id) => (
          <a key={id} href={`#${id}`}>{t(`nav.${id}`)}</a>
        ))}
      </nav>
      <div className="lang" role="group" aria-label={t('lang.label')}>
        {['es', 'en'].map((code) => (
          <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  )
}
