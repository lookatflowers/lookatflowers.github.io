// Textos de la historia del mapa (siempre en español). Aparte de storyImage.js para que el editor
// los use sin cargar el generador de imágenes.

/** Frase automática según la zona donde cae el pin (null = fuera de zonas, undefined = sin pin). */
export function mapPhrase(zoneId, hasPin = true) {
  if (!hasPin) return 'NOS VEMOS EN EL LOOKAT'
  return {
    escenarios: 'AQUÍ BAILANDO',
    feria: 'AQUÍ DE COMPRAS',
    comida: 'AQUÍ COMIENDO RICO',
    acceso: 'TE ESPERO EN LA ENTRADA',
  }[zoneId] ?? 'ENCUÉNTRAME AQUÍ'
}

/** Texto de la etiqueta sobre el pin: nombre (o "¡AQUÍ ESTOY!") y hora si se agregó. */
export function pinLabel(name, time) {
  const n = String(name ?? '').trim()
  return [n || '¡AQUÍ ESTOY!', time].filter(Boolean).join(' · ').toUpperCase()
}

