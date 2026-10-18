// Bandas y DJs. Para CONFIRMAR un artista, cambia su entrada a:
//   { id, kind, status: 'confirmed', name, photo, bio: { es, en }, links: { ... } }
//
// status:  'tbc' (por confirmar) | 'confirmed' (confirmado)
// kind:    'band' | 'dj'
// photo:   ruta dentro de /public, p. ej. 'artists/band-1.webp'
//          (archivo en public/artists/; recomendado 630×880 px, WebP, < 100 KB)
// links:   instagram, spotify, soundcloud, youtube, web (los vacíos no se muestran)
// provisional: true marca contenido de EJEMPLO que no es real (quitar al confirmar).
export const artists = [
  {
    id: 'band-1', kind: 'band', status: 'confirmed', provisional: true,
    name: 'Banda de Ejemplo A', photo: null,
    bio: {
      es: 'Reseña provisional de ejemplo. Aquí irá una breve presentación de la banda.',
      en: 'Placeholder bio. A short introduction to the band will go here.',
    },
    links: { instagram: 'https://www.instagram.com/lookatflowers.cl/', spotify: null },
  },
  {
    id: 'band-2', kind: 'band', status: 'confirmed', provisional: true,
    name: 'Banda de Ejemplo B', photo: null,
    bio: { es: 'Reseña provisional de ejemplo.', en: 'Placeholder bio.' },
    links: {},
  },
  { id: 'band-3', kind: 'band', status: 'tbc' },
  { id: 'band-4', kind: 'band', status: 'tbc' },
  { id: 'band-5', kind: 'band', status: 'tbc' },
  { id: 'band-6', kind: 'band', status: 'tbc' },
  {
    id: 'dj-1', kind: 'dj', status: 'confirmed', provisional: true,
    name: 'DJ de Ejemplo', photo: null,
    bio: { es: 'Reseña provisional de ejemplo.', en: 'Placeholder bio.' },
    links: {},
  },
  { id: 'dj-2', kind: 'dj', status: 'tbc' },
  { id: 'dj-3', kind: 'dj', status: 'tbc' },
  { id: 'dj-4', kind: 'dj', status: 'tbc' },
  { id: 'dj-5', kind: 'dj', status: 'tbc' },
]

export const getArtist = (id) => artists.find((a) => a.id === id)
