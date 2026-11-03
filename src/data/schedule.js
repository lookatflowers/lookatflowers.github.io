// Cronograma del festival: jornadas → escenarios → artistas en orden de presentación.
// Solo se publica la hora de inicio de cada escenario.
// Cada artista se indica con type ('band' | 'dj') y slot (número de carta, ver lineupConfig.js):
// el nombre sale del confirmado con esa carta. Un arreglo de varios ([{…}, {…}]) es un B2B.
const band = (slot) => ({ type: 'band', slot })
const dj = (slot) => ({ type: 'dj', slot })

export const days = [
  {
    id: 'miraflores',
    name: { es: 'Jornada Miraflores', en: 'Miraflores Day' },
    place: { es: 'Campus Miraflores UACh · viernes 6 de noviembre', en: 'Campus Miraflores UACh · Friday, November 6' },
    stages: [
      {
        id: 'flowers',
        name: 'Flowers Stage',
        start: '14:00',
        acts: [band(1), band(2), band(3), band(4), band(5), band(6)],
      },
      {
        id: 'valdivia',
        name: 'Valdivia Stage',
        start: '13:00',
        acts: [dj(1), dj(2), dj(3), dj(4), dj(5), dj(6)],
      },
    ],
  },
  {
    id: 'dubai',
    name: { es: 'Jornada Club Dubai', en: 'Club Dubai Night' },
    place: { es: 'Dubai Club', en: 'Dubai Club' },
    stages: [
      {
        id: 'dubai',
        name: 'Dubai Club',
        start: '00:00',
        // VECEIT B2B AMOONS · TnT live · StarrKush
        acts: [[dj(7), dj(8)], dj(9), dj(3)],
      },
    ],
  },
]
