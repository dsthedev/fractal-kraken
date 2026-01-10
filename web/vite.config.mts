import dns from 'dns'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

import { cedar } from '@cedarjs/vite'

// So that Vite will load on localhost instead of `127.0.0.1`.
// See: https://vitejs.dev/config/server-options.html#server-host.
dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  plugins: [cedar(), tailwindcss()],
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8911',
        changeOrigin: true,
        secure: false,
      },
      '/graphql': {
        target: 'http://localhost:8911',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
