/**
 * Shared MongoDB connect for Atlas: applies DNS_SERVERS from .env, optional MONGODB_URI_FALLBACK
 * when SRV lookups fail (common on restricted networks).
 *
 * Connection string: set MONGODB_URI, or MongoDB_URI (docker-compose / legacy), or mongodb_uri.
 */
const dns = require('dns');
const mongoose = require('mongoose');

function applyMongoDnsFromEnv() {
  const raw = process.env.DNS_SERVERS;
  if (!raw) return;
  const servers = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
    console.log(`Using custom DNS servers: ${servers.join(', ')}`);
  }
}

function isSrvDnsFailure(err) {
  return (
    err &&
    (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') &&
    typeof err.hostname === 'string' &&
    err.hostname.includes('_mongodb._tcp')
  );
}

function resolveMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MongoDB_URI ||
    process.env.mongodb_uri ||
    ''
  ).trim();
}

async function connectMongoose(options = {}) {
  applyMongoDnsFromEnv();
  const primary = resolveMongoUri();
  const fallback = process.env.MONGODB_URI_FALLBACK;
  if (!primary) {
    throw new Error(
      'MongoDB URI is not set. Define MONGODB_URI (or MongoDB_URI) in Coolify / Docker env — not only in a local .env file.'
    );
  }
  try {
    return await mongoose.connect(primary, options);
  } catch (err) {
    if (isSrvDnsFailure(err) && fallback) {
      console.warn('SRV DNS lookup failed. Retrying with MONGODB_URI_FALLBACK...');
      return mongoose.connect(fallback, options);
    }
    throw err;
  }
}

module.exports = {
  applyMongoDnsFromEnv,
  connectMongoose,
  isSrvDnsFailure,
};
