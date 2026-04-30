import type { NextConfig } from 'next';
import { initDb } from './lib/db';

// Initialize the SQLite database and run migrations on server start
initDb();

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
