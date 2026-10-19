// Cronograma por escenario. kind: 'ambient' | 'artist' | 'close'
// Los artistas se referencian por id (ver artists.js).
export const stages = [
  {
    id: 'flowers',
    name: 'Flowers Stage',
    slots: [
      { time: '14:00', kind: 'ambient' },
      { time: '14:30', kind: 'artist', artistId: 'band-1' },
      { time: '15:15', kind: 'artist', artistId: 'band-2' },
      { time: '16:00', kind: 'artist', artistId: 'band-3' },
      { time: '16:45', kind: 'artist', artistId: 'band-4' },
      { time: '17:30', kind: 'artist', artistId: 'band-5' },
      { time: '18:15', kind: 'artist', artistId: 'band-6' },
      { time: '19:30', kind: 'close'},
    ],
  },
  {
    id: 'valdivia',
    name: 'Valdivia Stage',
    slots: [
      { time: '14:00', kind: 'artist', artistId: 'dj-1' },
      { time: '15:00', kind: 'artist', artistId: 'dj-2' },
      { time: '16:00', kind: 'artist', artistId: 'dj-3' },
      { time: '17:00', kind: 'artist', artistId: 'dj-4' },
      { time: '18:00', kind: 'artist', artistId: 'dj-5' },
      { time: '19:30', kind: 'close' },
    ],
  },
]
