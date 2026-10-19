import Section from '../components/Section'
import { getArtist } from '../data/artists'
import { stages } from '../data/schedule'
import { useLang } from '../i18n/useLang'

export default function Schedule() {
  const { t } = useLang()

  const labelFor = (slot) => {
    if (slot.kind === 'ambient') return t('schedule.ambient')
    if (slot.kind === 'close') return t('schedule.close')
    const artist = getArtist(slot.artistId)
    if (!artist) return t('schedule.tbc')
    if (artist.status === 'confirmed') return artist.name
    // Por confirmar: "BANDA 1", "DJ 2"... (el número sale del id: band-1 -> 1)
    const number = artist.id.split('-')[1]
    return `${t(`cards.${artist.kind}`)} ${number}`.toUpperCase()
  }

  return (
    <Section id="schedule" title={t('schedule.title')}>
      <div className="columns">
        {stages.map((stage) => (
          <div key={stage.id}>
            <h3 className="subtitle">{stage.name}</h3>
            <ol className="slots">
              {stage.slots.map((slot) => (
                <li key={slot.time}>
                  <time>{slot.time}</time>
                  <span>{labelFor(slot)}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Section>
  )
}
