import { useLang } from '../i18n/useLang'
import './vendors.css'

// Solo se aceptan enlaces http(s); cualquier otra cosa (p. ej. javascript:) se ignora.
const isSafeUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

/** Tarjeta de puesto de venta: sobria, sin giro (el protagonismo es de los artistas). */
export default function VendorCard({ vendor }) {
  const { t, tr } = useLang()
  return (
    <article className="vendor">
      {vendor.category && <p className="vendor__category">{tr(vendor.category)}</p>}
      <h3 className="vendor__name">{vendor.name}</h3>
      {vendor.description && <p className="vendor__description">{tr(vendor.description)}</p>}
      {isSafeUrl(vendor.link) && (
        <a className="vendor__link" href={vendor.link} target="_blank" rel="noopener noreferrer">
          {t('vendors.visit')}
        </a>
      )}
    </article>
  )
}
