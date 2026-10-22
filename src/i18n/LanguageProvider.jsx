import { useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './LanguageContext'
import es from './es'
import en from './en'

const dictionaries = { es, en }
const STORAGE_KEY = 'laf-lang'

function readInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && Object.hasOwn(dictionaries, saved)) return saved
  } catch {
    /* localStorage no disponible: se usa el idioma por defecto */
  }
  return 'es' // español es el idioma principal
}

/** `titleKey`: clave del título de la pestaña (cada página HTML puede tener el suyo). */
export function LanguageProvider({ children, titleKey = 'meta.title' }) {
  const [lang, setLang] = useState(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = titleKey.split('.').reduce((node, key) => node?.[key], dictionaries[lang]) ?? document.title
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* sin persistencia, no pasa nada */
    }
  }, [lang, titleKey])

  const value = useMemo(() => {
    const dict = dictionaries[lang]
    const t = (path) => path.split('.').reduce((node, key) => node?.[key], dict) ?? path
    const tr = (v) => (typeof v === 'string' ? v : (v?.[lang] ?? v?.es ?? ''))
    return { lang, setLang, t, tr }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
