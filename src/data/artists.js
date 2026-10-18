// Bandas y DJs. Para confirmar un artista: status 'confirmed', name, photo, bio y links.
// status: 'tbc' (por confirmar) | 'confirmed' (confirmado)
// provisional: true marca contenido de ejemplo que NO es real.
export const artists = [
  {
    id: 'band-1', kind: 'band', status: 'confirmed', provisional: true,
    name: 'Banda de Ejemplo A', photo: null,
    bio: { es: 'Reseña provisional de ejemplo.', en: 'Placeholder bio.' },
    links: { instagram: null, spotify: null },
  },
  {
    id: 'band-2', kind: 'band', status: 'confirmed', provisional: true,
    name: 'Banda de Ejemplo B', photo: null,
    bio: { es: 'Reseña provisional de ejemplo.', en: 'Placeholder bio.' },
    links: { instagram: null, spotify: null },
  },
  { id: 'band-3', kind: 'band', status: 'tbc' },
  { id: 'band-4', kind: 'band', status: 'tbc' },
  { id: 'band-5', kind: 'band', status: 'tbc' },
  { id: 'band-6', kind: 'band', status: 'tbc' },
  { id: 'dj-1', kind: 'dj', status: 'tbc' },
  { id: 'dj-2', kind: 'dj', status: 'tbc' },
  { id: 'dj-3', kind: 'dj', status: 'tbc' },
  { id: 'dj-4', kind: 'dj', status: 'tbc' },
  { id: 'dj-5', kind: 'dj', status: 'tbc' },
]

export const getArtist = (id) => artists.find((a) => a.id === id)
