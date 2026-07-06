'use strict';

/**
 * Seed script — creates a default admin user if none exists.
 * Run once: node src/utils/seed.js
 *
 * Credentials are read from env so they're never hardcoded.
 * Defaults for local dev: admin@threatlens.local / Admin123!
 */

require('../config/env'); // ensure .env is loaded
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User.model');

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@threatlens.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     || 'Platform Admin';

async function seed() {
  await mongoose.connect(config.db.uri);
  console.log('[seed] Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`[seed] Admin user already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, passwordHash, role: 'admin' });

  console.log(`[seed] ✅ Admin user created:`);
  console.log(`       Email:    ${ADMIN_EMAIL}`);
  console.log(`       Password: ${ADMIN_PASSWORD}`);
  console.log('[seed] Change this password immediately in production!');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Error:', err.message);
  process.exit(1);
});
