// Line-up: una lista para bandas (bands) y otra para DJs (djs). Editar solo aquí.
//
// Cada lista admite dos tipos de entrada:
//
//  CONFIRMADO — ocupa la carta número `slot` (BANDA 1…6 / DJ 1…5) y su franja del cronograma:
//   {
//     name: 'Nombre', confirmed: true, slot: 1,
//     photo: 'artists/nombre.webp',   // archivo en public/artists/ (630×880 px, WebP, < 100 KB)
//     bio: { es: 'Reseña breve.', en: 'Short bio.' },
//     links: { instagram: 'https://...', spotify: 'https://...' }, // también soundcloud, youtube, web
//   },
//
//  POR CONFIRMAR — entra al sorteo de las cartas libres (photo y bio son opcionales):
//   { name: 'Nombre', confirmed: false, photo: 'artists/nombre.webp', bio: { es: '...', en: '...' } },
//
// Cómo se comporta cada carta:
//  · Con confirmed: true y slot N  -> la carta N muestra foto + nombre y abre la ventana al tocar.
//  · Carta libre y HAY entradas por confirmar -> borde verde + "?"; al girar sortea un nombre
//    (sin repetirlo en otra carta girada). Un 2.º toque abre la ventana marcada "por confirmar".
//    Si no quedan nombres libres, muestra BANDA / POR CONFIRMAR.
//  · Carta libre y NO hay entradas por confirmar, o su número está en forzarIncognita
//    -> "?" que al girar muestra BANDA / POR CONFIRMAR.

export const lineup = {
  band: { total: 6, forzarIncognita: [] }, // p. ej. [5, 6] deja siempre la incógnita en las cartas 5 y 6
  dj: { total: 5, forzarIncognita: [] },
}

export const bands = []

export const djs = []

export const lists = { band: bands, dj: djs }

/** Artista confirmado en la carta `slot` de `type` ('band' | 'dj'), o undefined. */
export const confirmedAt = (type, slot) => lists[type]?.find((a) => a.confirmed && a.slot === slot)
