import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local HTTPS: run `npm run cert:dev` in /server, then set VITE_HTTPS=true in client/.env.local.
// The certificate lives in <repo>/certs and is shared with the API server.
const loadHttpsOptions = (env) => {
  if (env.VITE_HTTPS !== 'true') return undefined
  const keyFile = path.resolve(__dirname, env.VITE_SSL_KEY_PATH || '../certs/localhost-key.pem')
  const certFile = path.resolve(__dirname, env.VITE_SSL_CERT_PATH || '../certs/localhost.pem')
  if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
    throw new Error(
      `VITE_HTTPS=true but no certificate was found at ${keyFile}.\nRun "npm run cert:dev" in the server folder first.`
    )
  }
  return { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const https = loadHttpsOptions(env)
  // Where the dev server forwards /api — use https://localhost:5001 when the API runs with TLS
  const apiTarget = env.VITE_PROXY_TARGET || 'http://localhost:5001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      https,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // Accept the self-signed development certificate of the local API
          secure: false,
        },
      },
    },
    preview: {
      https,
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
