// Puestos de venta. Editar solo aquí: los filtros se generan solos a partir de esta lista.
//
// Forma de cada puesto:
// {
//   name: 'Nombre del puesto',
//   primary: ['Comida', 'Bebida'],        // una o más de PRIMARY_TAGS
//   secondary: ['Aros', 'Merch Banda'],   // etiquetas libres (se muestran tal cual)
//   link: 'https://...',                  // destino del botón "Ver más" (solo http/https)
//   description: { es: '...', en: '...' }, // opcional
// },
//
// Filtros: dentro de un mismo grupo las etiquetas suman (Comida O Bebida);
// entre el grupo principal y el secundario se restringe (Comida Y Merch Banda).
export const PRIMARY_TAGS = ['Emprendimiento', 'Comida', 'Bebida']

export const vendors = [
  {
    name: 'Puesto de ejemplo',
    primary: ['Comida'],
    secondary: [],
    description: { es: 'Descripción de ejemplo.', en: 'Sample description.' },
    link: 'https://www.instagram.com/lookatflowers.cl/',
  },
]
