// Cantidad de cartas por grupo. Lo usan la web (artists.js) y el sincronizador (scripts/sync-web.mjs).
// forzarIncognita: números de carta que siempre muestran "?" aunque haya nombres por confirmar,
// p. ej. [5, 6] deja la incógnita en las cartas 5 y 6.
export const lineup = {
  band: { total: 6, forzarIncognita: [] },
  dj: { total: 6, forzarIncognita: [] },
}

// Etiquetas principales de los puestos (filtro principal de la sección Puestos)
export const PRIMARY_TAGS = ['Emprendimiento', 'Comida', 'Bebida']
