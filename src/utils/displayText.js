// Texto para la fuente de títulos (Anderson Grotesk). La fuente trae Á, É, Í, Ó, Ú, Ñ, Ü... pero
// dibujadas SIN tilde, y no tiene ¡ ni ¿ (el navegador los tomaría de otra fuente). Aquí se quitan
// las tildes que la fuente no dibuja y esos signos, para que todo el título salga de la misma fuente.
// Si arte consigue una versión con tildes, agregar aquí las letras que ya dibuja bien (p. ej. 'ÁÉÍÓÚáéíóú').
const DRAWN_WITH_ACCENT = ''

export function displayText(text) {
  if (typeof text !== 'string') return text
  return Array.from(text)
    .filter((ch) => ch !== '¡' && ch !== '¿')
    .map((ch) => (DRAWN_WITH_ACCENT.includes(ch) ? ch : ch.normalize('NFD').replace(/[̀-ͯ]/g, '')))
    .join('')
    .trim()
}
