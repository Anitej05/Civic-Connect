import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    // Fix: Updated the proxy to a more robust object configuration
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true, // This is crucial for the backend to accept the request
        secure: false, // Allows proxying from https to http
      },
    },
  },
})