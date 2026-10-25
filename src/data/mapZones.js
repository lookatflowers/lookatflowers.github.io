// Zonas tocables del mapa (public/mapa/mapa-lookat.svg). Coordenadas en el sistema del SVG
// (viewBox 0 0 2169 2768): [x1, y1, x2, y2]. Si cambia el dibujo del mapa, se ajustan aquí.
// Los textos de cada categoría están en i18n (map.cats.<id>).
export const MAP_SIZE = { width: 2169, height: 2768 }

export const MAP_ZONES = [
  {
    id: 'escenarios',
    rects: [
      [470, 1350, 1140, 1830], // Flowers Stage
      [1210, 680, 1620, 824], // Valdivia Stage
    ],
    link: '#lineup',
  },
  {
    id: 'feria',
    rects: [
      [1230, 1146, 1460, 1404], // frente al Casino
      [1124, 1720, 1336, 1996], // junto al Gimnasio
      [568, 1844, 672, 2124], // junto al Edificio 7000
    ],
    link: '#vendors',
  },
  {
    id: 'comida',
    rects: [
      [1196, 828, 1644, 1136], // Casino
      [1060, 1630, 1164, 1724], // bebidas junto al Gimnasio
      [548, 1760, 652, 1850], // bebidas junto al Edificio 7000
    ],
  },
  {
    id: 'banos',
    rects: [
      [1300, 1026, 1474, 1094], // Casino
      [376, 1998, 552, 2066], // Edificio 7000
    ],
  },
  {
    id: 'acceso',
    rects: [[840, 2010, 1680, 2290]],
    link: 'https://www.google.com/maps/search/?api=1&query=General+Lagos+2086,+Valdivia',
  },
]
