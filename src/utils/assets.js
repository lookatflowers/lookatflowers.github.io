/** Convierte una ruta de /public (p. ej. 'artists/band-1.webp') en una URL válida
 *  tanto en local como en GitHub Pages (respeta la `base` de Vite). */
export const publicUrl = (path) => (path ? `${import.meta.env.BASE_URL}${path}` : null)
