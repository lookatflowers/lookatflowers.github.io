import Section from '../components/Section'
import { confirmedAt } from '../data/artists'
import { stages } from '../data/schedule'
import { useLang } from '../i18n/useLang'

export default function Schedule() {
  const { t } = useLang()

  const labelFor = (slot) => {
    if (slot.kind === 'ambient') return t('schedule.ambient')
    if (slot.kind === 'close') return t('schedule.close')
    const artist = confirmedAt(slot.type, slot.slot)
    if (artist) return artist.name
    if (!slot.slot) return <span className="slots__tbc">{t('schedule.tbc')}</span>
    // Por confirmar: "BANDA 1", "DJ 2"...
    return `${t(`cards.${slot.type}`)} ${slot.slot}`.toUpperCase()
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
