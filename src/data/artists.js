// Bandas y DJs. Para CONFIRMAR un artista, reemplaza su línea por una entrada
// completa como las de los ejemplos de abajo (sin el // del inicio).
//
// status:  'tbc' (por confirmar) | 'confirmed' (confirmado)
// kind:    'band' | 'dj'
// name:    mientras esté 'tbc' solo sirve para identificar la línea; la carta muestra ¿?
// photo:   ruta dentro de /public, p. ej. 'artists/band-1.webp'
//          (archivo en public/artists/; recomendado 630×880 px, WebP, < 100 KB)
// links:   instagram, spotify, soundcloud, youtube, web (los vacíos no se muestran)
// provisional: true marca contenido de EJEMPLO que no es real (no lo uses en artistas reales).
//
// EJEMPLO de BANDA confirmada (cópialo y reemplaza la línea de la banda correspondiente):
// {
//   id: 'band-1', kind: 'band', status: 'confirmed',
//   name: 'Nombre de la banda', photo: 'artists/band-1.webp',
//   bio: {
//     es: 'Reseña breve de la banda.',
//     en: 'Short bio of the band.',
//   },
//   links: { instagram: 'https://www.instagram.com/usuario/', spotify: 'https://open.spotify.com/...' },
// },
//
// EJEMPLO de DJ confirmado:
// {
//   id: 'dj-1', kind: 'dj', status: 'confirmed',
//   name: 'Nombre del DJ', photo: 'artists/dj-1.webp',
//   bio: {
//     es: 'Reseña breve del DJ.',
//     en: 'Short bio of the DJ.',
//   },
//   links: { instagram: 'https://www.instagram.com/usuario/', soundcloud: 'https://soundcloud.com/...' },
// },
//
// IMPORTANTE: el id debe quedar igual (band-1, dj-1...), porque el cronograma
// (schedule.js) se conecta con cada artista por su id.
export const artists = [
  { id: 'band-1', kind: 'band', status: 'tbc', name: 'Banda 1' },
  { id: 'band-2', kind: 'band', status: 'tbc', name: 'Banda 2' },
  { id: 'band-3', kind: 'band', status: 'tbc', name: 'Banda 3' },
  { id: 'band-4', kind: 'band', status: 'tbc', name: 'Banda 4' },
  { id: 'band-5', kind: 'band', status: 'tbc', name: 'Banda 5' },
  { id: 'band-6', kind: 'band', status: 'tbc', name: 'Banda 6' },
  { id: 'dj-1', kind: 'dj', status: 'tbc', name: 'DJ 1' },
  { id: 'dj-2', kind: 'dj', status: 'tbc', name: 'DJ 2' },
  { id: 'dj-3', kind: 'dj', status: 'tbc', name: 'DJ 3' },
  { id: 'dj-4', kind: 'dj', status: 'tbc', name: 'DJ 4' },
  { id: 'dj-5', kind: 'dj', status: 'tbc', name: 'DJ 5' },
]

export const getArtist = (id) => artists.find((a) => a.id === id)
