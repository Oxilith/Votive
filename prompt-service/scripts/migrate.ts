/**
 * @file prompt-service/scripts/migrate.ts
 * @purpose Custom migration runner that works with libsql encrypted SQLite
 * @functionality
 * - Creates encrypted database using libsql if DATABASE_KEY is set
 * - Reads SQL from Prisma migration files
 * - Applies migrations in order, tracking applied migrations
 * - Falls back to regular Prisma migrate if no encryption key
 * @dependencies
 * - @libsql/client for encrypted SQLite
 * - fs/path for reading migration files
 */

import { createClient } from '@libsql/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

const MIGRATIONS_DIR = join(process.cwd(), 'prisma', 'migrations');
const MIGRATIONS_TABLE = '_prisma_migrations';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:/app/data/prompts.db';
  const encryptionKey = process.env.DATABASE_KEY;

  if (!encryptionKey) {
    console.log('No DATABASE_KEY set, using standard Prisma migrate...');
    execFileSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' });
    return;
  }

  console.log('Using libsql with encryption for migrations...');
  console.log(`Database URL: ${databaseUrl}`);

  const client = createClient({
    url: databaseUrl,
    encryptionKey,
  });

  try {
    // Create migrations tracking table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        finished_at TEXT,
        migration_name TEXT NOT NULL,
        logs TEXT,
        rolled_back_at TEXT,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Get list of applied migrations
    const appliedResult = await client.execute(`SELECT migration_name FROM ${MIGRATIONS_TABLE} WHERE finished_at IS NOT NULL`);
    const appliedMigrations = new Set(appliedResult.rows.map((row) => row.migration_name as string));

    // Get list of migration directories
    if (!existsSync(MIGRATIONS_DIR)) {
      console.log('No migrations directory found');
      return;
    }

    const migrationDirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map((dirent) => dirent.name)
      .sort();

    console.log(`Found ${migrationDirs.length} migrations`);

    for (const migrationName of migrationDirs) {
      if (appliedMigrations.has(migrationName)) {
        console.log(`  ✓ ${migrationName} (already applied)`);
        continue;
      }

      const sqlPath = join(MIGRATIONS_DIR, migrationName, 'migration.sql');
      if (!existsSync(sqlPath)) {
        console.log(`  ⚠ ${migrationName} (no migration.sql found)`);
        continue;
      }

      console.log(`  → Applying ${migrationName}...`);

      const sql = readFileSync(sqlPath, 'utf-8');
      const id = crypto.randomUUID();
      const checksum = Buffer.from(sql).toString('base64').slice(0, 64);

      // Record migration start
      await client.execute({
        sql: `INSERT INTO ${MIGRATIONS_TABLE} (id, checksum, migration_name, started_at, applied_steps_count) VALUES (?, ?, ?, datetime('now'), 0)`,
        args: [id, checksum, migrationName],
      });

      try {
        // Split and execute statements (SQLite doesn't support multi-statement execute)
        // Remove SQL comments first, then split by semicolons
        const cleanedSql = sql
          .split('\n')
          .filter((line) => !line.trim().startsWith('--'))
          .join('\n');

        const statements = cleanedSql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          await client.execute(statement);
        }

        // Mark migration as complete
        await client.execute({
          sql: `UPDATE ${MIGRATIONS_TABLE} SET finished_at = datetime('now'), applied_steps_count = ? WHERE id = ?`,
          args: [statements.length, id],
        });

        console.log(`    ✓ Applied ${statements.length} statements`);
      } catch (error) {
        console.error(`    ✗ Migration failed:`, error);
        throw error;
      }
    }

    console.log('All migrations applied successfully');
  } finally {
    client.close();
  }
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
