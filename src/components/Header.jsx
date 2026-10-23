import { useEffect, useRef, useState } from 'react'
import { applications, applyUrl } from '../data/applications'
import { useLang } from '../i18n/useLang'

// const links = ['info', 'lineup', 'schedule', 'vendors', 'map', 'sponsors', 'contact']
const links = ['info', 'lineup', 'vendors', 'map', 'sponsors', 'contact']

/** Botón "Postulaciones" con su desplegable. Va fuera del menú con scroll horizontal
 *  para que el desplegable no quede recortado. */
function ApplyMenu() {
  const { t, tr } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      ref.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="apply-menu" ref={ref}>
      <button
        type="button"
        className="apply-menu__button"
        aria-expanded={open}
        aria-controls="apply-menu-list"
        onClick={() => setOpen((o) => !o)}
      >
        {t('apply.button')}
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>
      <ul id="apply-menu-list" className="apply-menu__list" aria-label={t('apply.menuLabel')} hidden={!open}>
        {applications.map((a) => (
          <li key={a.id}>
            <a href={applyUrl(a.id)} onClick={() => setOpen(false)}>{tr(a.label)}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Cabecera común. En postulaciones.html (`home` = false) los enlaces vuelven a la portada. */
export default function Header({ home = true }) {
  const { lang, setLang, t } = useLang()
  const base = home ? '' : import.meta.env.BASE_URL
  return (
    <header className="header">
      <a className="header__brand" href={home ? '#top' : base}>LOOK AT FLOWERS</a>
      <nav className="header__nav" aria-label={t('nav.label')}>
        {links.map((id) => (
          <a key={id} href={`${base}#${id}`}>{t(`nav.${id}`)}</a>
        ))}
      </nav>
      <ApplyMenu />
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
