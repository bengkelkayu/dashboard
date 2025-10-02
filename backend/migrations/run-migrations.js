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
    
    // Read all SQL files in migrations directory
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      console.log(`✓ Migration ${file} completed successfully`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
