import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@stellar/stellar-sdk', '@creit.tech/stellar-wallets-kit'],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
