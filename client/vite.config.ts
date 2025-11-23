import { defineConfig, loadEnv } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import path from 'path' 


export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

  const HOST   = env.VITE_HOST
	const MODE   = env.VITE_MODE // 'dev' | 'test' | 'prod' (defaul - 'dev')
	const DOMAIN = env.VITE_DOMAIN
	const PORT   = Number(env.VITE_PORT)

  if (!HOST || !MODE || !DOMAIN || isNaN(PORT))
		throw new Error('Hasn`t some environments in vite.config.ts')

  const allowedHosts = [DOMAIN, 'client']
  
  const isTest = MODE === 'test'
  const isProd = MODE === 'prod'

  return {
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
    server: {
      host: HOST,
      port: PORT,
      ...( (isProd || isTest)
        ? { allowedHosts }
        : {
          host: HOST,
          protocol: 'ws',
          clientPort: PORT,
        } )
    },
    preview: {
      host: HOST,
      port: PORT,
      allowedHosts,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }
})
