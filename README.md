# LOOK AT FLOWERS · sitio web

## Actualizar el line-up y los puestos

Los artistas y los puestos **se editan en la planilla "Postulaciones LOOKAT E2"**, no en el código:

- Pestaña **Web Line-up**: bandas y DJs. Cada fila elige "Confirmado" (con su número de carta, que también define la hora en el cronograma) o "Por confirmar" (entra al sorteo de las cartas libres).
- Pestaña **Web Puestos**: emprendimientos y comida, en el orden en que deben aparecer.
- Pestaña **Etiquetas**: lista oficial de etiquetas de producto (Joyería, Llaveros...). Los puestos solo pueden usar
  etiquetas de esta lista, y en la web aparecen como filtros en este mismo orden.
- Solo salen a la web las filas con la casilla **Publicar** marcada.
- **Fotos de artistas** (columna "Foto" de Web Line-up, link de Drive compartido como "Cualquier persona con el enlace"):
  verticales en proporción de carta **63:88**, por ejemplo **2520 × 3520 px**. No se recortan: se publican enteras,
  achicadas a 945 × 1320 y comprimidas. Si la proporción no calza, la actualización se detiene y avisa.

Para publicar los cambios: en GitHub, **Actions → "Actualizar web desde la planilla" → Run workflow**.
La acción revisa los datos y, si encuentra un error (por ejemplo, dos bandas en la misma carta),
no cambia nada y muestra en el registro qué corregir. Si todo está bien, guarda los datos y publica el sitio.

Desde la terminal se puede hacer lo mismo con `npm run sync` (o `npm run sync -- --dry` para revisar sin escribir).
El sincronizador está en `scripts/sync-web.mjs` y las URLs de las tres pestañas publicadas en `scripts/sync-web.config.json`.
Escribe `src/data/generated/*.json` y las fotos en `public/artists/`: esos archivos no se editan a mano.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
