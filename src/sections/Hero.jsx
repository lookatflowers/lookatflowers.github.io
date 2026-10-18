import logo from '../assets/brand/logo.svg'
import { festival } from '../data/festival'
import { useLang } from '../i18n/useLang'

export default function Hero() {
  const { tr } = useLang()
  return (
    <section id="top" className="hero">
      <img className="hero__logo" src={logo} alt={festival.name} width="1000" height="1000" />
      <p className="hero__edition">{tr(festival.edition)} · {festival.year}</p>
      <p className="hero__slogan">{festival.slogan}</p>
    </section>
  )
}
