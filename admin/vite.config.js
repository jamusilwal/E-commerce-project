import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const loadHttpsOptions = (env) => {
  if (env.VITE_HTTPS !== 'true') return undefined
  const keyFile = path.resolve(import.meta.dirname, env.VITE_SSL_KEY_PATH || '../certs/localhost-key.pem')
  const certFile = path.resolve(import.meta.dirname, env.VITE_SSL_CERT_PATH || '../certs/localhost.pem')
  if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
    return { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
  }
  return undefined
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const https = loadHttpsOptions(env)
  const apiTarget = env.VITE_PROXY_TARGET || (https ? 'https://localhost:5050' : 'http://localhost:5050')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      https,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 5174,
      https,
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
