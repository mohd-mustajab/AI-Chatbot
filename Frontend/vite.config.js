import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // ✅ ensures the output folder is always created
  },
  server: {
    port: 5173, // optional, keeps default Vite dev port
  },
})
