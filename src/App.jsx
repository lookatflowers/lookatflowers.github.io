import './App.css'
import { LanguageProvider } from './i18n/LanguageProvider'
import { useLang } from './i18n/useLang'
import Header from './components/Header'
import Speaker from './components/Speaker'
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
      <Speaker />
      <Header />
      <main>
        <Hero />
        <div className="curtain">
          <Info />
          <Lineup />
          <Schedule />
          <Vendors />
          <Useful />
          <MapSection />
          <Contact />
        </div>
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
