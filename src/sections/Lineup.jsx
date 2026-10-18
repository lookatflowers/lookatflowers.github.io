import { useState } from 'react'
import Section from '../components/Section'
import ArtistCard from '../components/ArtistCard'
import ArtistDialog from '../components/ArtistDialog'
import { artists } from '../data/artists'
import { useLang } from '../i18n/useLang'

function Group({ title, items, onOpen }) {
  return (
    <div className="group">
      <h3 className="subtitle">{title}</h3>
      <ul className="cards">
        {items.map((a) => (
          <li key={a.id}><ArtistCard artist={a} onOpen={onOpen} /></li>
        ))}
      </ul>
    </div>
  )
}

export default function Lineup() {
  const { t } = useLang()
  const [selected, setSelected] = useState(null)

  return (
    <Section id="lineup" title={t('lineup.title')}>
      <p className="note">{t('lineup.note')}</p>
      <Group title={t('lineup.bands')} items={artists.filter((a) => a.kind === 'band')} onOpen={setSelected} />
      <Group title={t('lineup.djs')} items={artists.filter((a) => a.kind === 'dj')} onOpen={setSelected} />
      <ArtistDialog artist={selected} onClose={() => setSelected(null)} />
    </Section>
  )
}
