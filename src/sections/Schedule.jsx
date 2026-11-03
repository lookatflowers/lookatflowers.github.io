import Section from '../components/Section'
import { confirmedAt } from '../data/artists'
import { days } from '../data/schedule'
import { useLang } from '../i18n/useLang'
import { displayText } from '../utils/displayText'

/** Cronograma: por jornada, cada escenario con su hora de inicio y sus artistas en orden. */
export default function Schedule() {
  const { t, tr } = useLang()

  const nameOf = (act) => {
    const artist = confirmedAt(act.type, act.slot)
    return artist ? displayText(artist.name) : t('schedule.tbcName')
  }
  const labelFor = (act) => (Array.isArray(act) ? act.map(nameOf).join(' B2B ') : nameOf(act))

  return (
    <Section id="schedule" title={t('schedule.title')}>
      <div className="schedule">
        {days.map((day) => (
          <div key={day.id} className="schedule__day">
            <h3 className="schedule__day-title">{tr(day.name)}</h3>
            <p className="schedule__place">{tr(day.place)}</p>
            <div className="columns">
              {day.stages.map((stage) => (
                <div key={stage.id} className="schedule__stage">
                  <h4 className="subtitle">{stage.name}</h4>
                  <p className="schedule__start">
                    {t('schedule.start')} <time>{stage.start}</time> {t('schedule.hrs')}
                  </p>
                  <ol className="slots schedule__acts">
                    {stage.acts.map((act, i) => (
                      <li key={i}>
                        <span className="schedule__n">{i + 1}</span>
                        <span>{labelFor(act)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
