import { useState } from 'react'
import { useLang } from '../i18n/useLang'
import { LIKES_URL } from '../data/analytics'
import { isLiked, setLiked } from '../utils/track'
import FlowerIcon from './FlowerIcon'
import './like.css'

/** Botón de me gusta con una flor 🌸. `type`: 'Banda' | 'DJ' | 'Puesto'. `compact`: solo la flor (tarjetas de puestos).
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
      <FlowerIcon />
      {!compact && <span>{liked ? t('likes.liked') : t('likes.like')}</span>}
    </button>
  )
}
