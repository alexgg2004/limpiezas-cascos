import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Reenvía las llamadas a la API al backend local, para poder exponer solo
    // el frontend por un túnel (ngrok, etc.) sin necesitar un segundo túnel
    // para el backend ni tocar CORS.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    // Necesario para que ngrok (y cualquier host externo) pueda servir este
    // dev server: Vite bloquea por defecto los hosts que no reconoce.
    allowedHosts: true,
  },
})
