import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: "/",
  server: {
    host: true, // Same as '0.0.0.0', allows LAN access
    port: 8090,
    strictPort: true,
    allowedHosts: [
      'node.icaro.com.au',
      'localhost',
      '192.168.1.107',
      '127.0.0.1',
      'msi.local'
    ],
    // historyApiFallback: true,
    hmr: {
      protocol: 'ws',
      // host: 'msi.local',
      clientPort: 8090,
    },
    watch: {
      usePolling: true       // Enable polling for file changes
    }
  }
})
