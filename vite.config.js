import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => ({
  plugins: [react()],
  // ถ้า build บน Vercel ให้ base = '/' ; ถ้าไม่ใช่ให้ใช้ของ GitHub Pages
  base: process.env.VERCEL ? '/' : '/kcal-tracker/',
}))
