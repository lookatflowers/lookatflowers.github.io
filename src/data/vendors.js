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
//   secondary: ['Joyería', 'Llaveros'],   // etiquetas de producto (pestaña Etiquetas)
//   link: 'https://...',                  // destino del botón "Ver más" (solo http/https)
//   description: { es: '...', en: '...' }, // opcional
// },
//
// Filtros: dentro de un mismo grupo las etiquetas suman (Comida O Bebida);
// entre el grupo principal y el secundario se restringe (Comida Y Joyería).
//
// secondary son las etiquetas de producto: salen de la pestaña "Etiquetas" de la planilla
// (lista cerrada) y se muestran como filtros en el orden de esa pestaña (PRODUCT_TAGS).
import data from './generated/vendors.json'

export { PRIMARY_TAGS } from './lineupConfig'

export const vendors = data.vendors

/** Lista oficial de etiquetas de producto, en el orden de la planilla. */
export const PRODUCT_TAGS = data.tags
