// Postulaciones (página postulaciones.html y sección "Postulaciones" de la portada). Editar aquí.
//
// id:    se usa en la URL (postulaciones.html#bandas); no cambiarlo sin actualizar enlaces externos.
// info / how: textos bilingües. Cada línea del arreglo es un párrafo.
// links: { label: { es, en }, url: 'https://...' }. Con url vacía se muestra "Enlace próximamente".
//
// CONTENIDO PROVISIONAL: reemplazar los textos y enlaces de ejemplo.
export const applications = [
  {
    id: 'bandas',
    label: { es: 'Bandas', en: 'Bands' },
    info: [
      { es: 'Información general para bandas que quieran tocar en el festival. Texto por definir.', en: 'General information for bands that want to play at the festival. Text to be defined.' },
    ],
    how: [
      { es: 'Pasos para postular como banda. Texto por definir.', en: 'Steps to apply as a band. Text to be defined.' },
    ],
    links: [{ label: { es: 'Formulario de postulación', en: 'Application form' }, url: '' }],
  },
  {
    id: 'djs',
    label: { es: 'DJs', en: 'DJs' },
    info: [
      { es: 'Información general para DJs. Texto por definir.', en: 'General information for DJs. Text to be defined.' },
    ],
    how: [
      { es: 'Pasos para postular como DJ. Texto por definir.', en: 'Steps to apply as a DJ. Text to be defined.' },
    ],
    links: [{ label: { es: 'Formulario de postulación', en: 'Application form' }, url: '' }],
  },
  {
    id: 'emprendimientos',
    label: { es: 'Emprendimientos', en: 'Vendors' },
    info: [
      { es: 'Información general para emprendimientos y puestos de venta. Texto por definir.', en: 'General information for vendors and stalls. Text to be defined.' },
    ],
    how: [
      { es: 'Pasos para postular un emprendimiento. Texto por definir.', en: 'Steps to apply as a vendor. Text to be defined.' },
    ],
    links: [{ label: { es: 'Formulario de postulación', en: 'Application form' }, url: '' }],
  },
]

/** URL de la página de postulaciones (respeta la `base` de Vite). */
export const applyUrl = (id) => `${import.meta.env.BASE_URL}postulaciones.html${id ? `#${id}` : ''}`
