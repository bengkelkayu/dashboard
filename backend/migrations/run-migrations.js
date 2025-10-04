import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Create schema_migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Migration tracking table ready');
    
    // Get list of already applied migrations
    const appliedResult = await client.query(
      'SELECT migration_name FROM schema_migrations ORDER BY migration_name'
    );
    const appliedMigrations = new Set(appliedResult.rows.map(row => row.migration_name));
    
    // Read all SQL files in migrations directory
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.includes('seed'))
      .sort();
    
    let migrationsRun = 0;
    
    for (const file of files) {
      if (appliedMigrations.has(file)) {
        console.log(`⊘ Skipping ${file} (already applied)`);
        continue;
      }
      
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      
      // Record that this migration has been applied
      await client.query(
        'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
        [file]
      );
      
      console.log(`✓ Migration ${file} completed successfully`);
      migrationsRun++;
    }
    
    if (migrationsRun === 0) {
      console.log('✓ All migrations already applied - database is up to date');
    } else {
      console.log(`✓ Successfully applied ${migrationsRun} migration(s)`);
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
