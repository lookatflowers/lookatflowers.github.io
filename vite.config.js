import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const page = (file) => fileURLToPath(new URL(file, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // Sitio de varias páginas: cada HTML es una entrada (GitHub Pages sirve dist/ tal cual)
    rolldownOptions: {
      input: {
        main: page('./index.html'),
        postulaciones: page('./postulaciones.html'),
      },
    },
  },
})
