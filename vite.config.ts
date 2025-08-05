import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util'
    }
  },
  optimizeDeps: {
    include: [
      '@stellar/stellar-sdk', 
      '@creit.tech/stellar-wallets-kit',
      'buffer',
      'stream-browserify',
      'util'
    ],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
