import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base ต้องตรงกับชื่อ repo บน GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/kcal-tracker/',
})
