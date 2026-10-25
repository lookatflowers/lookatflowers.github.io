import { useState } from 'react'
import { useLang } from '../i18n/useLang'
import { LIKES_URL } from '../data/analytics'
import { isLiked, setLiked } from '../utils/track'
import './like.css'

/** Botón ♥. `type`: 'Banda' | 'DJ' | 'Puesto'. `compact`: solo el corazón (tarjetas de puestos).
 *  No aparece hasta que LIKES_URL esté configurada, para no perder me gusta que no se registran. */
export default function LikeButton(props) {
  return LIKES_URL ? <Like {...props} /> : null
}

function Like({ type, name, compact = false }) {
  const { t } = useLang()
  const [liked, setState] = useState(() => isLiked(type, name))
  const [pop, setPop] = useState(false)

  const onClick = (e) => {
    e.stopPropagation()
    const next = !liked
    setState(next)
    setLiked(type, name, next)
    if (next) {
      setPop(true)
      setTimeout(() => setPop(false), 450)
    }
  }

  return (
    <button
      type="button"
      className={`like${compact ? ' like--compact' : ''}${liked ? ' is-liked' : ''}${pop ? ' is-pop' : ''}`}
      aria-pressed={liked}
      aria-label={compact ? `${t('likes.like')}: ${name}` : undefined}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.5 3.7 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      {!compact && <span>{liked ? t('likes.liked') : t('likes.like')}</span>}
    </button>
  )
}
