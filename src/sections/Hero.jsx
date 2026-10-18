import { festival } from '../data/festival'
import { useLang } from '../i18n/useLang'

/** Escena de portada: el parlante (componente Speaker) vive fijo detrás; aquí solo
 *  el texto que se revela al hacer scroll. */
export default function Hero() {
  const { t, tr } = useLang()
  return (
    <section id="top" className="stage">
      <h1 className="visually-hidden">{festival.name} · {tr(festival.edition)} {festival.year}</h1>
      <p className="stage__scroll" aria-hidden="true">{t('hero.scroll')}</p>
      <div className="stage__copy">
        <p className="stage__edition">{tr(festival.edition)} · {festival.year}</p>
        <p className="stage__slogan">{festival.slogan}</p>
      </div>
    </section>
  )
}
