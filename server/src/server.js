import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import app from './app.js';
import env from './config/env.js';
import prisma from './config/db.js';

const PORT = env.PORT;

let server;
let redirectServer;

/**
 * Read the TLS key/certificate when SSL_KEY_PATH and SSL_CERT_PATH are set.
 * Relative paths are resolved from the server/ folder.
 */
const loadTlsOptions = () => {
  const read = (file, name) => {
    const resolved = path.resolve(process.cwd(), file);
    if (!fs.existsSync(resolved)) {
      throw new Error(`${name} not found at ${resolved}. Run "npm run cert:dev" or fix the path in .env`);
    }
    return fs.readFileSync(resolved);
  };
  return {
    key: read(env.SSL_KEY_PATH, 'SSL_KEY_PATH'),
    cert: read(env.SSL_CERT_PATH, 'SSL_CERT_PATH'),
    minVersion: 'TLSv1.2',
  };
};

/**
 * Optional plain-HTTP listener that only sends visitors to the HTTPS URL.
 */
const startRedirectServer = () => {
  redirectServer = http
    .createServer((req, res) => {
      const host = (req.headers.host || 'localhost').replace(/:\d+$/, '');
      const port = PORT === 443 ? '' : `:${PORT}`;
      res.writeHead(308, { Location: `https://${host}${port}${req.url}` });
      res.end();
    })
    .listen(env.HTTP_REDIRECT_PORT, () => {
      console.log(`↪️  HTTP on port ${env.HTTP_REDIRECT_PORT} redirects to HTTPS`);
    });
};

/**
 * Start the server and verify database connection.
 */
const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start listening (HTTPS when a certificate is configured, otherwise HTTP)
    const protocol = env.HTTPS_ENABLED ? 'https' : 'http';
    server = env.HTTPS_ENABLED ? https.createServer(loadTlsOptions(), app) : http.createServer(app);

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🏪 HAMROLOK BAZAR API Server               ║
║                                              ║
║   Environment : ${env.NODE_ENV.padEnd(28)}║
║   Port        : ${String(PORT).padEnd(28)}║
║   TLS         : ${(env.HTTPS_ENABLED ? 'enabled (HTTPS)' : 'off (HTTP)').padEnd(28)}║
║   URL         : ${`${protocol}://localhost:${PORT}`.padEnd(28)}║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });

    if (env.HTTPS_ENABLED && env.HTTP_REDIRECT_PORT) startRedirectServer();

    // Keep event loop active
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down server gracefully...');
  if (server) server.close();
  if (redirectServer) redirectServer.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  if (server) server.close();
  if (redirectServer) redirectServer.close();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
