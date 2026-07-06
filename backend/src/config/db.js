'use strict';

/**
 * Database-free mode — no MongoDB, no persistence.
 * All data lives only in process memory for the duration of the server run.
 * connectDB and disconnectDB are no-ops kept for API compatibility with server.js.
 */

async function connectDB() {
  console.log('[db] Running in stateless / database-free mode.');
  console.log('[db] No data is persisted. Auth is disabled — all requests are open.');
}

async function disconnectDB() {
  // Nothing to disconnect
}

module.exports = { connectDB, disconnectDB };
