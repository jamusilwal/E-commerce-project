import app from './app.js';
import env from './config/env.js';
import prisma from './config/db.js';

const PORT = env.PORT;

let server;

/**
 * Start the server and verify database connection.
 */
const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start listening and keep event loop active
    server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🏪 HAMROLOK BAZAR API Server               ║
║                                              ║
║   Environment : ${env.NODE_ENV.padEnd(28)}║
║   Port        : ${String(PORT).padEnd(28)}║
║   URL         : http://localhost:${String(PORT).padEnd(13)}║
║   Health      : http://localhost:${PORT}/api/health  ║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });

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
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  if (server) server.close();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
