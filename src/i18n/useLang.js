import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'

/** Devuelve { lang, setLang, t, tr }.
 *  t('seccion.clave')  -> texto de la interfaz en el idioma activo
 *  tr({ es, en })      -> elige el idioma de un dato bilingüe (src/data) */
export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang debe usarse dentro de <LanguageProvider>')
  return ctx
}
