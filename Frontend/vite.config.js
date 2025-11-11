import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Final Vite configuration for Vercel + Express backend
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ use relative paths so build works when served from Express
  build: {
    outDir: 'dist', // ✅ ensures the output folder is always created
  },
  server: {
    port: 5173, // optional for local dev
  },
})
