'use strict';

const fs = require('fs');
const path = require('path');

const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

/**
 * Entry point — connects to MongoDB (with MongoMemoryServer fallback in dev)
 * then starts the HTTP server.
 */
async function start() {
  try {
    // Ensure temp upload directory exists before multer handles file scans
    const uploadDir = path.resolve(process.cwd(), config.upload.dir);
    fs.mkdirSync(uploadDir, { recursive: true });

    // Establish DB connection first — auth and analysis routes depend on Mongoose models
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`[server] ThreatLens API running on http://localhost:${config.port} (${config.env})`);
      if (config.env === 'development') {
        console.log(`[server] Run "npm run seed" in a new terminal to create the default admin user.`);
      }
    });

    // ── Graceful shutdown ──────────────────────────────────────────────────
    async function shutdown(signal) {
      console.log(`[server] ${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();
        console.log('[server] Shut down complete');
        process.exit(0);
      });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('[server] Unhandled Promise Rejection:', reason);
      server.close(async () => {
        await disconnectDB();
        process.exit(1);
      });
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
