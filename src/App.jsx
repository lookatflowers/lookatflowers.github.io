import './App.css'
import { LanguageProvider } from './i18n/LanguageProvider'
import { useLang } from './i18n/useLang'
import Header from './components/Header'
import Hero from './sections/Hero'
import Info from './sections/Info'
import Lineup from './sections/Lineup'
import Schedule from './sections/Schedule'
import Vendors from './sections/Vendors'
import Useful from './sections/Useful'
import MapSection from './sections/MapSection'
import Contact from './sections/Contact'

function Page() {
  const { t } = useLang()
  return (
    <>
      <a className="skip" href="#info">{t('skip')}</a>
      <Header />
      <main>
        <Hero />
        <Info />
        <Lineup />
        <Schedule />
        <Vendors />
        <Useful />
        <MapSection />
        <Contact />
      </main>
      <footer className="footer">{t('footer')}</footer>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  )
}
