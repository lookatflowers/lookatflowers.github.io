import { useEffect, useRef, useState } from 'react'
import '../App.css'
import './apply.css'
import logo from '../assets/brand/logo.svg'
import Header from '../components/Header'
import { applications } from '../data/applications'
import { festival } from '../data/festival'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { useLang } from '../i18n/useLang'

const ids = applications.map((a) => a.id)

/** Pestaña indicada en la URL (#bandas, #djs, #emprendimientos) o la primera. */
const tabFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  return ids.includes(id) ? id : ids[0]
}

const isSafeUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

function Panel({ app, active }) {
  const { t, tr } = useLang()
  return (
    <div
      id={`panel-${app.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${app.id}`}
      className="apply-panel"
      hidden={!active}
      tabIndex={0}
    >
      <section>
        <h2>{t('apply.info')}</h2>
        {app.info.map((p, i) => <p key={i}>{tr(p)}</p>)}
      </section>
      <section>
        <h2>{t('apply.how')}</h2>
        {app.how.map((p, i) => <p key={i}>{tr(p)}</p>)}
      </section>
      <section>
        <h2>{t('apply.links')}</h2>
        <ul className="apply-panel__links">
          {app.links.map((link, i) => (
            <li key={i}>
              {isSafeUrl(link.url) ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">{tr(link.label)}</a>
              ) : (
                <span className="apply-panel__soon">{tr(link.label)} · {t('apply.linkSoon')}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Page() {
  const { t, tr } = useLang()
  const [active, setActive] = useState(tabFromHash)
  const tabsRef = useRef(null)

  // El desplegable de la cabecera cambia el hash sin recargar: se sigue aquí
  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (ids.includes(id)) setActive(id) // otros hashes (p. ej. el enlace de salto) no cambian la pestaña
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id, focus = false) => {
    setActive(id)
    window.history.replaceState(null, '', `#${id}`)
    if (focus) tabsRef.current?.querySelector(`#tab-${id}`)?.focus()
  }

  // Teclado de pestañas (patrón ARIA): flechas, Inicio y Fin
  const onKeyDown = (e) => {
    const i = ids.indexOf(active)
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: ids.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    select(ids[(next + ids.length) % ids.length], true)
  }

  return (
    <>
      <a className="skip" href="#apply-main">{t('skip')}</a>
      <div className="apply-logo">
        <a href={import.meta.env.BASE_URL} aria-label={festival.name}>
          <img src={logo} alt="" width="1000" height="1000" />
        </a>
      </div>
      <Header home={false} />
      <main id="apply-main" className="apply-page">
        <h1 className="apply-page__title">{t('apply.pageTitle')}</h1>
        <div className="apply-tabs" role="tablist" aria-label={t('apply.tabsLabel')} ref={tabsRef} onKeyDown={onKeyDown}>
          {applications.map((app) => (
            <button
              key={app.id}
              id={`tab-${app.id}`}
              type="button"
              role="tab"
              aria-selected={active === app.id}
              aria-controls={`panel-${app.id}`}
              tabIndex={active === app.id ? 0 : -1}
              onClick={() => select(app.id)}
            >
              {tr(app.label)}
            </button>
          ))}
        </div>
        {applications.map((app) => <Panel key={app.id} app={app} active={active === app.id} />)}
      </main>
      <footer className="footer">{t('footer')}</footer>
    </>
  )
}

export default function ApplyPage() {
  return (
    <LanguageProvider titleKey="meta.applyTitle">
      <Page />
    </LanguageProvider>
  )
}
