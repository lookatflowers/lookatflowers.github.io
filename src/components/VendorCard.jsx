import { useLang } from '../i18n/useLang'
import './vendors.css'
import { displayText } from '../utils/displayText'

// Solo se aceptan enlaces http(s); cualquier otra cosa (p. ej. javascript:) se ignora.
const isSafeUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

/** Tarjeta de puesto de venta: sobria, sin giro (el protagonismo es de los artistas).
 *  Orden: tipo (Emprendimiento / Comida / Bebida) · nombre · etiquetas de producto · descripción · enlace. */
export default function VendorCard({ vendor, primaryLabel }) {
  const { t, tr } = useLang()
  const name = displayText(vendor.name)
  const primary = vendor.primary ?? []
  const secondary = vendor.secondary ?? []
  return (
    <article className="vendor">
      {primary.length > 0 && (
        <ul className="vendor__tags">
          {primary.map((tag) => <li key={tag} className="vtag">{primaryLabel(tag)}</li>)}
        </ul>
      )}
      <h3 className="vendor__name">{name}</h3>
      {secondary.length > 0 && (
        <ul className="vendor__tags vendor__tags--products">
          {secondary.map((tag) => <li key={tag} className="vtag vtag--secondary">{tag}</li>)}
        </ul>
      )}
      {vendor.description && <p className="vendor__description">{tr(vendor.description)}</p>}
      {isSafeUrl(vendor.link) && (
        <a className="vendor__link" href={vendor.link} target="_blank" rel="noopener noreferrer">
          {t('vendors.visit')}
        </a>
      )}
    </article>
  )
}
