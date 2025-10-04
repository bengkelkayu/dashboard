# GitHub Actions Workflow Enhancements

## 🎯 Overview

Enhanced the GitHub Actions deployment workflows (`deploy-vps.yml` and `deploy-vps-password.yml`) to include comprehensive database schema verification and QR code functionality testing, following the best practices outlined in `DEPLOYMENT_GUIDE_FIX.md`.

## ✨ What's New

### 1. Database Schema Verification Before Migrations

**Location**: Both workflow files - During application deployment

**What it does**:
- Runs `npm run verify-schema` before attempting migrations
- Only runs migrations if schema verification detects missing columns/tables
- Provides clear feedback about schema status

**Benefits**:
- ✅ Prevents unnecessary migration runs
- ✅ Detects schema issues early in deployment
- ✅ Follows deployment guide best practices

**Implementation** (deploy-vps.yml):
```yaml
# Verify database schema before migrations
echo "🔍 Verifying database schema..."
if npm run verify-schema; then
  echo "✓ Schema verification passed - no migrations needed"
else
  echo "⚠️  Schema verification found issues - running migrations..."
  # ... run migrations ...
fi
```

### 2. Post-Migration Schema Verification

**Location**: Both workflow files - After migrations complete

**What it does**:
- Runs `npm run verify-schema` again after migrations
- Confirms all required columns and tables exist
- Fails deployment if verification fails

**Benefits**:
- ✅ Ensures migrations completed successfully
- ✅ Catches migration errors before app starts
- ✅ Prevents "column does not exist" runtime errors

**Implementation**:
```yaml
# Verify schema again after migrations
echo "🔍 Re-verifying database schema..."
if npm run verify-schema; then
  echo "✅ Schema verification passed after migrations!"
else
  echo "❌ Schema verification failed after migrations - please check manually"
  exit 1
fi
```

### 3. Enhanced Migration Error Handling

**Location**: deploy-vps.yml

**What it does**:
- Exits with error code if migrations fail
- Shows database table status on failure
- Prevents app startup with broken schema

**Previous behavior**:
```yaml
if npm run migrate; then
  echo "✓ Migrations completed successfully"
else
  echo "⚠️  Migrations failed or already applied"
  # Continued anyway
fi
```

**New behavior**:
```yaml
if npm run migrate; then
  echo "✓ Migrations completed successfully"
  # Verify schema after
else
  echo "❌ Migrations failed"
  echo "Checking migration status..."
  psql -U wedding_user -d wedding_dashboard -c "\dt"
  exit 1  # Stop deployment
fi
```

### 4. Final Schema Verification in Deployment

**Location**: Both workflow files - End of deployment

**What it does**:
- Runs final schema verification after app starts
- Provides confidence that schema is correct
- Logged for audit trail

**Benefits**:
- ✅ Final safety check before marking deployment complete
- ✅ Easy to spot schema issues in workflow logs
- ✅ Helps with troubleshooting

### 5. QR Code Functionality Testing (deploy-vps.yml)

**Location**: New step "Test QR Code Functionality"

**What it does**:
- Tests health endpoint (`/health`)
- Checks WhatsApp API endpoint (`/api/whatsapp/status`)
- Verifies QR code columns exist in database
- Checks invitation_link column exists
- Shows PM2 process status

**Benefits**:
- ✅ Confirms QR code feature is properly deployed
- ✅ Detects missing database columns
- ✅ Validates critical API endpoints
- ✅ Provides detailed deployment status

**Implementation**:
```yaml
- name: Test QR Code Functionality
  run: |
    echo "🔍 Testing QR Code and WhatsApp API functionality..."
    
    # Test health endpoint
    curl -f http://${{ secrets.VPS_HOST }}/health
    
    # Check WhatsApp API
    curl -f http://${{ secrets.VPS_HOST }}/api/whatsapp/status
    
    # Verify QR code columns in database
    ssh root@${{ secrets.VPS_HOST }} << 'ENDSSH'
      QR_COLUMNS=$(psql ... check qr_code_* columns ...)
      if [ -n "$QR_COLUMNS" ]; then
        echo "✅ QR Code columns found"
      fi
    ENDSSH
```

### 6. Enhanced Password Workflow Testing

**Location**: deploy-vps-password.yml - Enhanced Verify Deployment step

**What it does**:
- Checks QR code columns count in database
- Shows PM2 process status with jq formatting
- Provides clear pass/fail indicators

**Benefits**:
- ✅ Quick validation of QR code feature deployment
- ✅ Consistent with SSH key workflow testing
- ✅ Easy to read status output

## 📋 Workflow Execution Flow

### deploy-vps.yml (SSH Key Auth)

```
1. Checkout repository
2. Setup SSH
3. Deploy to VPS (Full Setup) - if full or setup-only
   └─ Install system dependencies
4. Deploy Application - if full or app-only
   ├─ Clone/update repository
   ├─ Install npm dependencies
   ├─ Setup database (if new)
   ├─ 🆕 Verify schema (pre-migration)
   ├─ Run migrations (if needed)
   ├─ 🆕 Verify schema (post-migration)
   ├─ Configure Nginx
   ├─ Start PM2 processes
   └─ 🆕 Final schema verification
5. Verify Deployment
   ├─ Check HTTP response
   ├─ Check PM2 processes
   ├─ Show API logs
   └─ 🆕 Verify schema (final check)
6. 🆕 Test QR Code Functionality
   ├─ Test health endpoint
   ├─ Test WhatsApp API endpoint
   ├─ Verify QR code columns in DB
   └─ Check invitation_link column
7. Post-Deployment Summary
```

### deploy-vps-password.yml (Password Auth)

```
1. Checkout repository
2. Setup Node.js 20
3. Install sshpass
4. Deploy to VPS (Full Setup) - if triggered
   └─ Install system dependencies
5. Deploy Application
   ├─ Clone/update repository
   ├─ Install npm dependencies
   ├─ Setup database (if new)
   ├─ 🆕 Verify schema before migrations
   ├─ Run migrations if needed
   ├─ 🆕 Verify schema after migrations
   ├─ Configure Nginx
   ├─ Start PM2 processes
   └─ 🆕 Final schema verification
6. Verify Deployment
   ├─ Check HTTP response
   ├─ 🆕 Test QR code functionality
   └─ 🆕 Show PM2 process status
```

## 🔧 Migration Verification Commands Used

### npm run verify-schema

Checks:
- ✅ QR code columns (`qr_code_token`, `qr_code_url`, `qr_code_generated_at`)
- ✅ invitation_link column
- ✅ All required tables (`guests`, `guest_attendance`, `thank_you_templates`, `thank_you_outbox`, `invitation_templates`)

Expected output on success:
```
✅ All QR Code columns exist in guests table
   ✓ qr_code_generated_at
   ✓ qr_code_token
   ✓ qr_code_url
✅ invitation_link column exists in guests table
✅ All required tables exist
   ✓ guest_attendance
   ✓ guests
   ✓ invitation_templates
   ✓ thank_you_outbox
   ✓ thank_you_templates
✅ Database schema verification complete - All checks passed!
```

### npm run migrate

Applies migrations:
- `001_initial_schema.sql` - Creates initial tables
- `002_add_qr_code_columns.sql` - Adds QR code columns
- `003_add_invitation_link.sql` - Adds invitation_link column
- `004_add_invitation_templates.sql` - Adds invitation_templates table

Expected output:
```
✓ Migration 001_initial_schema.sql applied successfully
✓ Migration 002_add_qr_code_columns.sql applied successfully
✓ Migration 003_add_invitation_link.sql applied successfully
✓ Migration 004_add_invitation_templates.sql applied successfully
```

## 🎯 Success Criteria

Deployment is considered successful when:

1. ✅ Pre-migration schema verification runs
2. ✅ Migrations complete (if needed)
3. ✅ Post-migration schema verification passes
4. ✅ Application starts successfully
5. ✅ Final schema verification passes
6. ✅ QR code columns exist in database
7. ✅ Health endpoint responds
8. ✅ PM2 processes are online
9. ✅ No errors in workflow logs

## 🐛 Troubleshooting

### Schema Verification Fails

**Symptom**: `npm run verify-schema` shows missing columns

**Solution**: The workflow will automatically run migrations and verify again

**Manual fix** (if workflow fails):
```bash
ssh root@43.134.97.90
cd /root/dashboard
npm run migrate
npm run verify-schema
pm2 restart wedding-api
```

### Migration Fails

**Symptom**: `npm run migrate` exits with error

**Possible causes**:
- Database connection issues
- Migration already applied
- SQL syntax error

**Check**:
```bash
ssh root@43.134.97.90
cd /root/dashboard
cat .env | grep DATABASE_URL
psql $DATABASE_URL -c "\dt"
```

### QR Code Test Fails

**Symptom**: QR code columns count is not 3

**Solution**:
```bash
ssh root@43.134.97.90
cd /root/dashboard
npm run migrate
npm run verify-schema
```

## 📊 Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Schema Check** | ❌ Not done | ✅ Done 3 times (pre, post, final) |
| **Migration Logic** | Always runs, ignores errors | ✅ Conditional, fails on error |
| **QR Code Test** | ❌ Not tested | ✅ Comprehensive testing |
| **Error Handling** | Warnings only | ✅ Fails deployment on critical errors |
| **Visibility** | Basic logs | ✅ Detailed status at each step |

## 🚀 Deployment Time Impact

**Expected additional time**: +30-60 seconds per deployment

**Breakdown**:
- Schema verification (pre): ~5-10s
- Schema verification (post): ~5-10s
- Schema verification (final): ~5-10s
- QR code testing: ~10-20s

**Worth it?** ✅ YES! The additional time prevents:
- Runtime errors from missing columns
- Failed deployments requiring rollback
- Manual debugging and fixes

## 📚 Related Files

- `.github/workflows/deploy-vps.yml` - Main deployment workflow (SSH key)
- `.github/workflows/deploy-vps-password.yml` - Password-based workflow
- `backend/migrations/verify-schema.js` - Schema verification script
- `backend/migrations/run-migrations.js` - Migration runner
- `DEPLOYMENT_GUIDE_FIX.md` - Deployment guide this is based on
- `package.json` - Contains npm scripts for verify-schema and migrate

## ✅ Testing Recommendations

Before merging, test the enhanced workflows:

1. **Test app-only deployment** (default on push):
   ```
   git push origin main
   ```
   - Should verify schema 3 times
   - Should skip migrations if schema is good
   - Should run QR code tests

2. **Test full deployment** (manual trigger):
   ```
   Workflow: Deploy to VPS
   Deploy type: full
   ```
   - Should install all dependencies
   - Should run migrations
   - Should verify schema multiple times

3. **Test with missing schema** (simulate issue):
   - Manually drop a QR code column
   - Trigger deployment
   - Verify it detects issue and runs migration

## 🎉 Summary

These enhancements make the deployment workflow more robust and aligned with the deployment guide. They ensure:

1. ✅ Database schema is always verified before and after migrations
2. ✅ QR code functionality is tested as part of deployment
3. ✅ Critical errors fail the deployment (not just warnings)
4. ✅ Better visibility into deployment status
5. ✅ Follows DEPLOYMENT_GUIDE_FIX.md best practices

---

**Last Updated**: 2024
**Version**: 2.0
**Author**: GitHub Copilot
