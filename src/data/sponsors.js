// Auspicios y colaboradores. Editar solo aquí.
//
// { name: 'Nombre', svg: 'sponsors/archivo.svg', size: 'large', link: 'https://...' }
//   name: nombre de la marca: se muestra al pasar el cursor y es el texto alternativo del logo.
//   svg:  ruta dentro de /public (archivo en public/sponsors/).
//   size: 'large' (grande) | 'medium' (mediano). Primero se muestran los grandes y debajo los
//         medianos, cada grupo en el orden de esta lista. El tamaño fija la ALTURA del logo:
//         un logo muy horizontal (p. ej. FCI) queda igual de alto y simplemente más ancho.
//   link: a dónde lleva el logo al presionarlo (solo http/https). Vacío: el logo no es enlace.
//
// OJO: el fondo de la sección es blanco; un logo blanco no se vería. Pide la versión a color o negra.
export const sponsors = [
  { name: 'RED BULL CHILE', svg: 'sponsors/A_redbull.svg', size: 'large', link: 'https://www.redbull.com/' },
  { name: 'DAE UACh', svg: 'sponsors/A_dae.svg', size: 'large', link: 'https://dae.uach.cl/' },
  { name: 'FCI UACh', svg: 'sponsors/A_fci.svg', size: 'large', link: 'https://ingenieria.uach.cl/' },
  { name: 'ASPRINTEC ARQUITECTOS', svg: 'sponsors/B_asprintec.svg', size: 'medium', link: 'https://asprintec.cl/' },
  { name: 'CAFÉ EL ESCRITORIO', svg: 'sponsors/B_escritorio.svg', size: 'medium', link: 'https://www.instagram.com/cafeelescritorio/?hl=es' },
]
