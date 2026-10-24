// Cronograma por escenario. kind: 'ambient' | 'artist' | 'close'
// Las franjas de artista indican type ('band' | 'dj') y slot (número de carta, ver artists.js):
// muestran el nombre del confirmado con ese slot o, si no hay, "BANDA 1", "DJ 2"...
export const stages = [
  {
    id: 'flowers',
    name: 'Flowers Stage',
    slots: [
      { time: '14:00', kind: 'ambient' },
      { time: '14:30', kind: 'artist', type: 'band', slot: 1 },
      { time: '15:15', kind: 'artist', type: 'band', slot: 2 },
      { time: '16:00', kind: 'artist', type: 'band', slot: 3 },
      { time: '16:45', kind: 'artist', type: 'band', slot: 4 },
      { time: '17:30', kind: 'artist', type: 'band', slot: 5 },
      { time: '18:15', kind: 'artist', type: 'band', slot: 6 },
      { time: '19:30', kind: 'close' },
    ],
  },
  {
    id: 'valdivia',
    name: 'Valdivia Stage',
    slots: [
      { time: '14:00', kind: 'artist', type: 'dj', slot: 1 },
      { time: '15:00', kind: 'artist', type: 'dj', slot: 2 },
      { time: '16:00', kind: 'artist', type: 'dj', slot: 3 },
      { time: '17:00', kind: 'artist', type: 'dj', slot: 4 },
      { time: '18:00', kind: 'artist', type: 'dj', slot: 5 },
      { time: '19:00', kind: 'artist', type: 'dj', slot: 6 }, // hora provisional: confirmar con producción
      { time: '19:00', kind: 'artist', type: 'dj', slot: 6 },
      { time: '20:00', kind: 'close' },
    ],
  },
]
