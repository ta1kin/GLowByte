import { defineConfig } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import path from 'path' 


export default defineConfig({
  plugins: [
    react(),
    svgr(),
    ViteImageOptimizer({
      png: { quality: 70 },
      jpeg: {
        quality: 70,
        progressive: true,
      },
      jpg: {
        quality: 70,
        progressive: true,
      },
      webp: { quality: 65 },
      avif: { quality: 50 },
      svg: { multipass: true },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
