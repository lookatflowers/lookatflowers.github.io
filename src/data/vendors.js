// Puestos de venta. Los filtros se generan solos a partir de esta lista.
//
// LOS DATOS SE EDITAN EN LA PLANILLA, pestaña "Web Puestos", y se publican con la acción
// "Actualizar web desde la planilla" de GitHub (o con `npm run sync`). Esa acción reescribe
// src/data/generated/vendors.json: no lo edites a mano, se pierde en la próxima sincronización.
//
// Forma de cada puesto (la arma el sincronizador):
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
import data from './generated/vendors.json'

export { PRIMARY_TAGS } from './lineupConfig'

export const vendors = data
