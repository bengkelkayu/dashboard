# Migration System

## Overview

The database migration system has been enhanced to track which migrations have been applied, preventing the "trigger already exists" error and allowing migrations to be run multiple times safely.

## How It Works

### Migration Tracking Table

A new table `schema_migrations` is automatically created to track applied migrations:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Execution Flow

1. **Check Tracking Table**: The migration runner first checks which migrations have already been applied
2. **Skip Applied**: Migrations that are already recorded in `schema_migrations` are skipped
3. **Run New**: Only new/unapplied migrations are executed
4. **Record Success**: After successful execution, the migration name is recorded in the tracking table

### Idempotent SQL

The `001_initial_schema.sql` migration file has been updated to be idempotent by using `DROP TRIGGER IF EXISTS` before creating triggers:

```sql
-- Old (error-prone)
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- New (idempotent)
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Benefits

✅ **No More "Already Exists" Errors**: Migrations can be run multiple times without errors  
✅ **Safe Re-runs**: Running `npm run migrate` multiple times is now safe  
✅ **Clear Feedback**: Shows which migrations are skipped vs. applied  
✅ **Production-Ready**: Works in both fresh and existing databases  

## Usage

### Running Migrations

```bash
npm run migrate
```

### Expected Output (First Run)

```
Starting database migrations...
✓ Migration tracking table ready
Running migration: 001_initial_schema.sql
✓ Migration 001_initial_schema.sql completed successfully
Running migration: 002_add_qr_code_columns.sql
✓ Migration 002_add_qr_code_columns.sql completed successfully
Running migration: 003_add_invitation_link.sql
✓ Migration 003_add_invitation_link.sql completed successfully
Running migration: 004_add_invitation_templates.sql
✓ Migration 004_add_invitation_templates.sql completed successfully
✓ Successfully applied 4 migration(s)
```

### Expected Output (Subsequent Runs)

```
Starting database migrations...
✓ Migration tracking table ready
⊘ Skipping 001_initial_schema.sql (already applied)
⊘ Skipping 002_add_qr_code_columns.sql (already applied)
⊘ Skipping 003_add_invitation_link.sql (already applied)
⊘ Skipping 004_add_invitation_templates.sql (already applied)
✓ All migrations already applied - database is up to date
```

## Migration Files

Migration files should follow these naming conventions:
- `001_initial_schema.sql` - Initial database schema
- `002_add_qr_code_columns.sql` - Add QR code columns
- `003_add_invitation_link.sql` - Add invitation link column
- `004_add_invitation_templates.sql` - Add invitation templates table
- `XXX_description.sql` - Future migrations

**Note**: Files containing `seed` in their name are excluded from migrations.

## Checking Applied Migrations

You can query which migrations have been applied:

```sql
SELECT * FROM schema_migrations ORDER BY applied_at;
```

## Creating New Migrations

When creating new migration files:

1. Use sequential numbering (e.g., `004_`, `005_`, etc.)
2. Use descriptive names
3. Make SQL statements idempotent when possible:
   - Use `CREATE TABLE IF NOT EXISTS`
   - Use `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
   - Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
   - Use `CREATE INDEX IF NOT EXISTS`

## Troubleshooting

### If a Migration Fails Mid-Execution

If a migration fails partway through:

1. Fix the issue in the migration file
2. Remove the failed migration from tracking:
   ```sql
   DELETE FROM schema_migrations WHERE migration_name = 'XXX_migration_name.sql';
   ```
3. Run migrations again: `npm run migrate`

### Reset All Migrations (Development Only)

⚠️ **WARNING**: This will drop all tables and data!

```bash
# Drop all tables
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations from scratch
npm run migrate
```

## Changes Made

### Modified Files

1. **`backend/migrations/run-migrations.js`**
   - Added migration tracking table creation
   - Added logic to check and skip applied migrations
   - Added better output messages
   - Excludes seed files from migration runs

2. **`backend/migrations/001_initial_schema.sql`**
   - Added `DROP TRIGGER IF EXISTS` before each `CREATE TRIGGER`
   - Makes the migration idempotent

## GitHub Actions Integration

The migration system works seamlessly with GitHub Actions workflows:

```yaml
- name: Run migrations
  run: |
    npm run verify-schema
    npm run migrate
    npm run verify-schema
```

This ensures:
1. Schema is verified before migrations
2. Migrations run only if needed
3. Schema is verified after migrations
