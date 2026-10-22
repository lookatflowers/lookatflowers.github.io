/** Texto con **negritas** (marcado mínimo de los archivos de datos). */
export default function Rich({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))
}
