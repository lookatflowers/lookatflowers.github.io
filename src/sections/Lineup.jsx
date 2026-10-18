import Section from '../components/Section'
import { artists } from '../data/artists'
import { useLang } from '../i18n/useLang'

function Roster({ title, items }) {
  const { t } = useLang()
  return (
    <div>
      <h3 className="subtitle">{title}</h3>
      <ul className="roster">
        {items.map((a) => (
          <li key={a.id} data-status={a.status}>
            <span className="roster__name">{a.status === 'confirmed' ? a.name : t('schedule.tbc')}</span>
            <span className="tag">{t(`lineup.${a.status}`)}</span>
            {a.provisional && <span className="tag tag--muted">{t('provisional')}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Lineup() {
  const { t } = useLang()
  return (
    <Section id="lineup" title={t('lineup.title')}>
      <p className="note">{t('lineup.note')}</p>
      <div className="columns">
        <Roster title={t('lineup.bands')} items={artists.filter((a) => a.kind === 'band')} />
        <Roster title={t('lineup.djs')} items={artists.filter((a) => a.kind === 'dj')} />
      </div>
    </Section>
  )
}
