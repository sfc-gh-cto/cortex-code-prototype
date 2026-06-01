import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Use the repo subpath as base only for production builds (GitHub Pages);
// keep the dev server at root for convenience.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/cortex-code-prototype/' : '/',
  plugins: [react(), tailwindcss()],
}))
