import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["frontend-confirmacionasistenacia.up.railway.app"],
    host: "0.0.0.0",
    port: 5173
  }
})
