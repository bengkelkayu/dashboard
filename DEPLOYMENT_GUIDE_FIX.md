# Deployment Guide: Wedding Invitation Fix

## 🚀 Quick Deployment Steps

Follow these steps to deploy the wedding invitation fix to your production server.

### Step 1: Pull Latest Changes

```bash
# SSH to your server
ssh user@43.134.97.90

# Navigate to project directory
cd /path/to/dashboard

# Pull latest changes
git pull origin main
```

### Step 2: Verify Database Schema

**IMPORTANT**: This is the critical step to fix the QR code error!

```bash
# Run schema verification
npm run verify-schema
```

**Expected Output** (if migrations needed):
```
🔍 Verifying database schema...

❌ Missing QR Code columns in guests table:
   - qr_code_token
   - qr_code_url
   - qr_code_generated_at

🔧 To fix: Run migration 002_add_qr_code_columns.sql
   Command: npm run migrate
```

### Step 3: Run Migrations (if needed)

If Step 2 showed missing columns:

```bash
# Run database migrations
npm run migrate
```

**Expected Output**:
```
✓ Migration 001_initial_schema.sql applied successfully
✓ Migration 002_add_qr_code_columns.sql applied successfully
✓ Migration 003_add_invitation_link.sql applied successfully
```

**Verify again**:
```bash
npm run verify-schema
```

Should now show:
```
✅ All QR Code columns exist in guests table
   ✓ qr_code_generated_at
   ✓ qr_code_token
   ✓ qr_code_url
✅ invitation_link column exists in guests table
✅ All required tables exist
   ✓ guest_attendance
   ✓ guests
   ✓ thank_you_outbox
   ✓ thank_you_templates

✅ Database schema verification complete - All checks passed!
```

### Step 4: Restart Application

```bash
# If using PM2
pm2 restart wedding-api
pm2 restart wedding-worker

# If using systemd
sudo systemctl restart wedding-dashboard

# If using docker
docker-compose restart

# If using node directly
# Stop: Ctrl+C
# Start: npm start
```

### Step 5: Test the API

```bash
# Test with a guest ID (replace 1 with actual guest ID)
curl -X POST http://43.134.97.90/api/whatsapp/send/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Success Response**:
```json
{
  "success": true,
  "message": "Wedding invitation and QR Code sent to John Doe",
  "data": {
    "guest": "John Doe",
    "phone": "628123456789",
    "hasInvitationLink": true,
    "hasQRCode": true
  }
}
```

**Previous Error** (now fixed):
```json
{
  "success": false,
  "error": "Failed to get QR code",
  "details": "column \"qr_code_token\" of relation \"guests\" does not exist"
}
```

## 🔍 Verification Checklist

- [ ] Pulled latest code from git
- [ ] Ran `npm run verify-schema` successfully
- [ ] Ran `npm run migrate` if needed
- [ ] Verified schema again (all checks passed)
- [ ] Restarted application
- [ ] Tested `/api/whatsapp/send/:guestId` endpoint
- [ ] Received success response
- [ ] Guest received WhatsApp message with QR code

## 📱 Testing via Dashboard

1. Open http://43.134.97.90 in browser
2. Find a guest in the list
3. Click "📤 Undangan" button (was "📤 WA")
4. Confirm dialog: "Kirim undangan pernikahan dengan QR Code ke {name}?"
5. Check guest's WhatsApp for:
   - Wedding invitation message (not thank you)
   - Digital invitation link (if set)
   - QR code image attachment

## 🐛 Troubleshooting

### Error: "column qr_code_token does not exist"

**Cause**: Migrations not applied

**Fix**:
```bash
npm run migrate
npm run verify-schema
pm2 restart wedding-api
```

### Error: "Failed to connect to database"

**Cause**: Database connection issue

**Check**:
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Error: "Cannot find module"

**Cause**: Dependencies not installed

**Fix**:
```bash
npm install
pm2 restart wedding-api
```

### Error: "WhatsApp not connected"

**Cause**: WhatsApp service not authenticated

**Fix**:
1. Open http://43.134.97.90/api/whatsapp/qr
2. Scan QR code with WhatsApp
3. Wait for connection
4. Try sending again

## 🎯 What Changed

### API Endpoint Behavior

**Before**:
- `/api/whatsapp/send/1` → Sent thank you message with template
- Required `templateId` parameter
- No QR code included

**After**:
- `/api/whatsapp/send/1` → Sends wedding invitation with QR code
- No parameters required (customMessage optional)
- QR code auto-generated and included
- Invitation link included if available

### Message Content

**Before**:
```
Terima kasih {nama} telah hadir di acara kami! 
Anda check-in pada {waktu_checkin}. 
Semoga hari Anda menyenangkan!
```

**After**:
```
Halo {nama}! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Undangan digital: {link}

Terlampir QR Code untuk absensi. 
Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏
```

## 📊 Monitoring

After deployment, monitor:

```bash
# Check application logs
pm2 logs wedding-api

# Check for errors
pm2 logs wedding-api --err

# Monitor status
pm2 status
```

Look for these success indicators:
```
✓ QR code generated successfully for guest {name}
✓ Wedding invitation with QR code sent successfully to {name}
```

## 🆘 Need Help?

If you encounter issues:

1. **Check logs**: `pm2 logs wedding-api`
2. **Verify schema**: `npm run verify-schema`
3. **Check database**: `psql $DATABASE_URL -c "SELECT * FROM guests LIMIT 1;"`
4. **Restart services**: `pm2 restart all`

## 📚 Related Documentation

- `WEDDING_INVITATION_UPDATE.md` - Detailed changes documentation
- `API.md` - Complete API reference
- `FEATURE_QR_INVITATION.md` - Feature documentation
- `MESSAGE_COMPARISON.md` - Message format comparison

## ✅ Success Criteria

Deployment is successful when:

1. ✅ `npm run verify-schema` shows all checks passed
2. ✅ API returns success response
3. ✅ Guest receives WhatsApp message with:
   - Wedding invitation text (not thank you)
   - Digital invitation link (if configured)
   - QR code image
4. ✅ Dashboard button shows "📤 Undangan"
5. ✅ No errors in application logs

---

**Deployment completed successfully!** 🎉

Your dashboard now sends proper wedding invitations with QR codes to guests via `/api/whatsapp/send/:guestId`.
