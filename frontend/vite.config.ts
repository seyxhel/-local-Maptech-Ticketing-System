import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'nonce-maptech-csp-v1' https://fonts.googleapis.com",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self' http://localhost:8000 ws://localhost:8000 http://127.0.0.1:8000 ws://127.0.0.1:8000 https://api.pwnedpasswords.com",
].join('; ')

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
}

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('xlsx') || id.includes('xlsx-js-style')) return 'xlsx'
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf'

          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 3000,
    headers: securityHeaders,
    proxy: {
      '/api': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
      '/ws': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
})
