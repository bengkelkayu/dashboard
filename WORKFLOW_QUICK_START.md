# 🚀 Quick Start Guide: Enhanced GitHub Actions Workflows

## What's New? 

Your GitHub Actions workflows now automatically:
1. ✅ Verify database schema before and after migrations
2. ✅ Test QR code functionality after deployment
3. ✅ Fail deployment on critical errors (instead of just warnings)
4. ✅ Provide detailed status reports

## How to Use

### Automatic Deployment (Recommended)

Just push to main branch:
```bash
git push origin main
```

The workflow will:
- ✅ Pull latest code to server
- ✅ Check database schema
- ✅ Run migrations only if needed
- ✅ Verify migrations succeeded
- ✅ Restart application
- ✅ Test QR code functionality
- ✅ Report results

### Manual Deployment

Go to GitHub Actions: `https://github.com/bengkelkayu/dashboard/actions`

**Choose workflow**: "Deploy to VPS" or "Deploy to VPS (Password Auth)"

**Select deploy type**:
- `app-only` - Just update app code (fast, 2-3 min) ⚡
- `full` - Install everything + deploy (first time, 10 min)
- `setup-only` - Only install system dependencies

## What to Expect

### ✅ Successful Deployment

You'll see these in the workflow logs:

```
🔍 Verifying database schema...
✓ Schema verification passed - no migrations needed
```

Or if migrations are needed:

```
🔍 Verifying database schema...
⚠️  Schema verification found issues - running migrations...
🗄️  Running database migrations...
✓ Migrations completed successfully
🔍 Re-verifying database schema...
✅ Schema verification passed after migrations!
```

Then at the end:

```
🔍 Testing QR Code and WhatsApp API functionality...
✓ Health check passed
✅ QR Code columns found in database:
   ✓ qr_code_generated_at
   ✓ qr_code_token
   ✓ qr_code_url
✅ invitation_link column found

✅ Deployment verification completed successfully!
```

### ❌ Failed Deployment

If something goes wrong, the workflow will STOP and show:

```
❌ Schema verification failed after migrations - please check manually
```

Or:

```
❌ Migrations failed
Checking migration status...
```

**What to do**: Check the logs above the error for details, then:

1. SSH to server:
   ```bash
   ssh root@43.134.97.90
   cd /root/dashboard
   ```

2. Check schema:
   ```bash
   npm run verify-schema
   ```

3. If needed, run migrations manually:
   ```bash
   npm run migrate
   ```

4. Restart app:
   ```bash
   pm2 restart wedding-api
   ```

5. Retry deployment

## Troubleshooting

### "Schema verification found issues"

**This is normal!** The workflow will automatically run migrations.

### "Migrations failed"

**Possible causes**:
- Database connection issue
- Migration already applied (check logs)
- SQL syntax error

**Fix**:
```bash
ssh root@43.134.97.90
cd /root/dashboard

# Check database connection
cat .env | grep DATABASE_URL

# Try manual migration
npm run migrate

# If successful, restart
pm2 restart wedding-api
```

### "QR code columns missing"

**This means** migrations didn't run or failed.

**Fix**:
```bash
ssh root@43.134.97.90
cd /root/dashboard
npm run migrate
npm run verify-schema
pm2 restart wedding-api
```

### Workflow takes longer than before

**Expected!** The enhanced workflow adds:
- Schema verification (3 times): ~15-30 seconds
- QR code testing: ~10-20 seconds

**Total additional time**: 30-60 seconds

**Worth it?** ✅ YES! You get:
- Fewer failed deployments
- No manual fixes needed
- Confidence that QR code feature works

## Monitoring Your Deployment

### View Workflow Status

1. Go to: `https://github.com/bengkelkayu/dashboard/actions`
2. Click on the latest workflow run
3. Watch the steps execute in real-time

### Key Steps to Watch

- **Deploy Application** - Where schema verification happens
- **Verify Deployment** - Where basic health checks run
- **Test QR Code Functionality** - Where QR feature is tested

### Check Application After Deployment

```bash
# Test the deployed app
curl http://43.134.97.90/health

# Check if QR code API works
curl http://43.134.97.90/api/whatsapp/status

# SSH and check logs
ssh root@43.134.97.90
pm2 logs wedding-api --lines 50
```

## Best Practices

### ✅ DO

- Push to main when you want automatic deployment
- Check workflow logs if deployment fails
- Run migrations manually if workflow fails
- Use `app-only` for regular updates (default)
- Use `full` only for first-time setup

### ❌ DON'T

- Don't skip checking workflow logs
- Don't ignore schema verification warnings
- Don't deploy if workflow shows errors
- Don't run `full` deployment unnecessarily

## Quick Commands Reference

### On Your Machine
```bash
# Trigger automatic deployment
git push origin main

# Check workflow status
# Go to: https://github.com/bengkelkayu/dashboard/actions
```

### On Server (SSH)
```bash
# SSH to server
ssh root@43.134.97.90

# Navigate to app
cd /root/dashboard

# Verify schema
npm run verify-schema

# Run migrations
npm run migrate

# Check PM2 status
pm2 status

# View logs
pm2 logs wedding-api

# Restart app
pm2 restart wedding-api
pm2 restart wedding-worker
```

## Success Checklist

After deployment completes, verify:

- [ ] Workflow shows "✅ Deployment verification completed successfully!"
- [ ] Workflow shows "✅ QR Code columns found in database"
- [ ] App is accessible at http://43.134.97.90
- [ ] Health endpoint works: `curl http://43.134.97.90/health`
- [ ] PM2 shows processes online: `ssh root@43.134.97.90 pm2 status`
- [ ] No errors in logs: `ssh root@43.134.97.90 pm2 logs wedding-api --lines 20`

## Getting Help

If deployment fails and you can't fix it:

1. **Check workflow logs** - Look for red ❌ indicators
2. **Check application logs** - SSH and run `pm2 logs`
3. **Check database** - Run `npm run verify-schema` on server
4. **Check this guide** - Follow troubleshooting steps above
5. **Create an issue** - Include workflow logs and error messages

## Related Documentation

- `WORKFLOW_ENHANCEMENTS.md` - Detailed technical documentation
- `DEPLOYMENT_GUIDE_FIX.md` - Manual deployment steps
- `.github/workflows/deploy-vps.yml` - SSH key workflow
- `.github/workflows/deploy-vps-password.yml` - Password workflow

---

**Version**: 2.0
**Last Updated**: 2024
**Deployment Time**: 2-3 minutes (app-only), 8-10 minutes (full)
**Success Rate**: ⚡ Improved with automatic verification!
