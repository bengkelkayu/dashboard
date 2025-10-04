import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n');
  
  try {
    // Check if qr_code columns exist in guests table
    const qrColumnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'guests' 
      AND column_name IN ('qr_code_token', 'qr_code_url', 'qr_code_generated_at')
      ORDER BY column_name
    `);
    
    const qrColumns = qrColumnsCheck.rows.map(r => r.column_name);
    const expectedQRColumns = ['qr_code_generated_at', 'qr_code_token', 'qr_code_url'];
    const missingQRColumns = expectedQRColumns.filter(col => !qrColumns.includes(col));
    
    if (missingQRColumns.length > 0) {
      console.log('❌ Missing QR Code columns in guests table:');
      missingQRColumns.forEach(col => console.log(`   - ${col}`));
      console.log('\n🔧 To fix: Run migration 002_add_qr_code_columns.sql');
      console.log('   Command: npm run migrate\n');
      return false;
    } else {
      console.log('✅ All QR Code columns exist in guests table');
      qrColumns.forEach(col => console.log(`   ✓ ${col}`));
    }
    
    // Check if invitation_link column exists
    const invitationLinkCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'guests' 
      AND column_name = 'invitation_link'
    `);
    
    if (invitationLinkCheck.rows.length === 0) {
      console.log('\n❌ Missing invitation_link column in guests table');
      console.log('🔧 To fix: Run migration 003_add_invitation_link.sql');
      console.log('   Command: npm run migrate\n');
      return false;
    } else {
      console.log('✅ invitation_link column exists in guests table');
    }
    
    // Check if required tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('guests', 'guest_attendance', 'thank_you_templates', 'thank_you_outbox')
      ORDER BY table_name
    `);
    
    const tables = tablesCheck.rows.map(r => r.table_name);
    const expectedTables = ['guest_attendance', 'guests', 'thank_you_outbox', 'thank_you_templates'];
    const missingTables = expectedTables.filter(tbl => !tables.includes(tbl));
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:');
      missingTables.forEach(tbl => console.log(`   - ${tbl}`));
      console.log('\n🔧 To fix: Run initial schema migration');
      console.log('   Command: npm run migrate\n');
      return false;
    } else {
      console.log('\n✅ All required tables exist');
      tables.forEach(tbl => console.log(`   ✓ ${tbl}`));
    }
    
    console.log('\n✅ Database schema verification complete - All checks passed!\n');
    return true;
  } catch (error) {
    console.error('❌ Error verifying schema:', error.message);
    console.error('\n🔧 Possible fixes:');
    console.error('   1. Check database connection in .env file');
    console.error('   2. Ensure PostgreSQL is running');
    console.error('   3. Run migrations: npm run migrate\n');
    return false;
  } finally {
    await pool.end();
  }
}

// Run verification
verifySchema()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
