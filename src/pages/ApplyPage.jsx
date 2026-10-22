import { useEffect, useRef, useState } from 'react'
import '../App.css'
import './apply.css'
import logo from '../assets/brand/logo.svg'
import Header from '../components/Header'
import Rich from '../components/Rich'
import { applications } from '../data/applications'
import { festival } from '../data/festival'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { useLang } from '../i18n/useLang'
import { daysLeft, formatDeadline } from '../utils/deadline'
import ApplyForm from './ApplyForm'

const ids = applications.map((a) => a.id)

/** Pestaña indicada en la URL (#bandas, #djs, #emprendimientos) o la primera. */
const tabFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  return ids.includes(id) ? id : ids[0]
}

/** Plazo con cuenta regresiva. */
function Deadline({ iso }) {
  const { lang, t } = useLang()
  const left = daysLeft(iso)
  let badge = t('apply.daysLeft').replace('{n}', left)
  if (left === 1) badge = t('apply.oneDay')
  if (left === 0) badge = t('apply.lastDay')
  if (left < 0) badge = t('apply.closed')
  return (
    <p className={`deadline${left < 0 ? ' deadline--closed' : ''}${left >= 0 && left <= 2 ? ' deadline--soon' : ''}`}>
      <span className="deadline__icon" aria-hidden="true">📅</span>
      <span className="deadline__text">
        {t('apply.deadline')} <strong>{formatDeadline(iso, lang)}</strong>
      </span>
      <span className="deadline__badge">{badge}</span>
    </p>
  )
}

function Panel({ app, active }) {
  const { t, tr } = useLang()
  const closed = daysLeft(app.deadline) < 0
  return (
    <div
      id={`panel-${app.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${app.id}`}
      className="apply-panel"
      hidden={!active}
    >
      <header className="apply-panel__head">
        <p className="apply-panel__stage">{tr(app.stage)}</p>
        <h2 className="apply-panel__title">{tr(app.label)}</h2>
        <p className="apply-panel__intro">{tr(app.intro)}</p>
        <Deadline iso={app.deadline} />
      </header>

      <section aria-labelledby={`${app.id}-facts`}>
        <h3 id={`${app.id}-facts`} className="apply-h3">{t('apply.essentials')}</h3>
        <ul className="facts-grid">
          {app.facts.map((f, i) => (
            <li key={i} className="fact">
              <span className="fact__icon" aria-hidden="true">{f.icon}</span>
              <span className="fact__title">{tr(f.title)}</span>
              <span className="fact__text">{tr(f.text)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${app.id}-rules`}>
        <h3 id={`${app.id}-rules`} className="apply-h3">{t('apply.rules')}</h3>
        <p className="field__hint">{t('apply.rulesHint')}</p>
        <div className="rules">
          {app.rules.map((rule, i) => (
            <details key={i} className="rule" open={i === 0}>
              <summary>{tr(rule.title)}</summary>
              <ul>{rule.items.map((item, n) => <li key={n}><Rich text={tr(item)} /></li>)}</ul>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby={`${app.id}-form`}>
        <h3 id={`${app.id}-form`} className="apply-h3">{t('apply.formTitle')}</h3>
        <ApplyForm app={app} closed={closed} />
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
      <Header home={false} />
      <main id="apply-main" className="apply-page">
        <div className="apply-logo">
          <a href={import.meta.env.BASE_URL} aria-label={festival.name}>
            <img src={logo} alt="" width="1000" height="1000" />
          </a>
        </div>
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
