# Migration System Flow

This document provides a visual representation of how the improved migration system works.

## Migration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│              npm run migrate                            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│  1. Create schema_migrations table (if not exists)       │
│     CREATE TABLE IF NOT EXISTS schema_migrations (...)   │
└───────────────────┬───────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│  2. Query applied migrations                              │
│     SELECT migration_name FROM schema_migrations          │
└───────────────────┬───────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│  3. Read migration files from directory                   │
│     - 001_initial_schema.sql                              │
│     - 002_add_qr_code_columns.sql                         │
│     - 003_add_invitation_link.sql                         │
└───────────────────┬───────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│  4. For each migration file:                              │
└───────────────────┬───────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ Already applied? │   │ Not applied yet? │
│                  │   │                  │
│ ⊘ Skip           │   │ ▶ Execute SQL    │
└──────────────────┘   └────────┬─────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │ 5. Record in         │
                    │ schema_migrations    │
                    │ table                │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ✓ Migration complete │
                    └──────────────────────┘
```

## Before vs After

### Before (Problem)

```
┌─────────────────┐
│ npm run migrate │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Run ALL migrations every time           │
│ - 001_initial_schema.sql ✗              │
│   ERROR: trigger already exists!        │
│                                         │
│ ❌ Migration fails                      │
└─────────────────────────────────────────┘
```

### After (Solution)

```
┌─────────────────┐
│ npm run migrate │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Check schema_migrations table           │
│ - 001_initial_schema.sql ✓ (skip)      │
│ - 002_add_qr_code_columns.sql ✓ (skip) │
│ - 003_add_invitation_link.sql ✓ (skip) │
│                                         │
│ ✅ All migrations up to date            │
└─────────────────────────────────────────┘
```

## Trigger Idempotency

### Before (Non-Idempotent)

```sql
-- ❌ Fails if trigger already exists
CREATE TRIGGER update_guests_updated_at 
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Error: trigger "update_guests_updated_at" already exists
```

### After (Idempotent)

```sql
-- ✅ Safe to run multiple times
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at 
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success: no error even if trigger exists
```

## Database State

### schema_migrations Table

```
┌────┬──────────────────────────────────┬─────────────────────┐
│ id │ migration_name                   │ applied_at          │
├────┼──────────────────────────────────┼─────────────────────┤
│  1 │ 001_initial_schema.sql           │ 2024-01-01 10:00:00 │
│  2 │ 002_add_qr_code_columns.sql      │ 2024-01-01 10:00:05 │
│  3 │ 003_add_invitation_link.sql      │ 2024-01-01 10:00:10 │
└────┴──────────────────────────────────┴─────────────────────┘
```

## GitHub Actions Integration

```yaml
┌───────────────────────────────────────────────────┐
│ GitHub Actions Workflow                           │
└───────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────┐
│ npm run verify-schema                             │
│ (Check if migrations needed)                      │
└───────────────────┬───────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ Schema OK        │   │ Schema issues    │
│ Skip migrations  │   │ Run migrations   │
└──────────────────┘   └────────┬─────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │ npm run migrate      │
                    │ (Idempotent)         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ npm run verify-schema│
                    │ (Confirm success)    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ✅ Deploy app        │
                    └──────────────────────┘
```

## Key Concepts

### 1. Idempotency
- Operations can be performed multiple times with the same result
- Running migrations 1x or 10x produces the same database state

### 2. Tracking
- Each migration is recorded when successfully applied
- Prevents duplicate execution

### 3. Safety
- Safe to re-run migrations during deployments
- No manual intervention needed for already-applied migrations

### 4. Transparency
- Clear console output shows what's happening
- Easy to debug migration issues

## Example Scenarios

### Scenario 1: Fresh Database
```bash
$ npm run migrate
✓ Migration tracking table ready
Running migration: 001_initial_schema.sql
✓ Migration 001_initial_schema.sql completed successfully
Running migration: 002_add_qr_code_columns.sql
✓ Migration 002_add_qr_code_columns.sql completed successfully
Running migration: 003_add_invitation_link.sql
✓ Migration 003_add_invitation_link.sql completed successfully
✓ Successfully applied 3 migration(s)
```

### Scenario 2: Up-to-Date Database
```bash
$ npm run migrate
✓ Migration tracking table ready
⊘ Skipping 001_initial_schema.sql (already applied)
⊘ Skipping 002_add_qr_code_columns.sql (already applied)
⊘ Skipping 003_add_invitation_link.sql (already applied)
✓ All migrations already applied - database is up to date
```

### Scenario 3: New Migration Added
```bash
$ npm run migrate
✓ Migration tracking table ready
⊘ Skipping 001_initial_schema.sql (already applied)
⊘ Skipping 002_add_qr_code_columns.sql (already applied)
⊘ Skipping 003_add_invitation_link.sql (already applied)
Running migration: 004_new_feature.sql
✓ Migration 004_new_feature.sql completed successfully
✓ Successfully applied 1 migration(s)
```

### Scenario 4: Interrupted Migration (Error Handling)
```bash
$ npm run migrate
✓ Migration tracking table ready
⊘ Skipping 001_initial_schema.sql (already applied)
⊘ Skipping 002_add_qr_code_columns.sql (already applied)
Running migration: 003_add_invitation_link.sql
❌ Error running migrations: error: syntax error in SQL
```

**Recovery:**
1. Fix the SQL in `003_add_invitation_link.sql`
2. The migration wasn't recorded (because it failed)
3. Run `npm run migrate` again - it will retry the failed migration
4. Success! The migration is now recorded

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| Re-run safety | ❌ Fails | ✅ Safe |
| Tracking | ❌ None | ✅ Automatic |
| Error clarity | ❌ Confusing | ✅ Clear |
| CI/CD friendly | ❌ Fragile | ✅ Robust |
| Production ready | ❌ Risky | ✅ Safe |
| Debugging | ❌ Hard | ✅ Easy |
