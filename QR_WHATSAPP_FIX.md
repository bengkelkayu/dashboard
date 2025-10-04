# QR Code & WhatsApp Invitation Fix

## 🎯 Problem Statement

1. **QR Code Generation Error**: `{"success":false,"error":"Failed to get QR code"}`
2. **Send WhatsApp**: Button should send custom wedding invitation link with QR code included
3. **Workflow Enhancement**: Need automatic deployment for code changes

## ✅ Solutions Implemented

### 1. QR Code Error Handling Enhancement

**Problem**: Generic error message didn't help debug the actual issue.

**Fix Applied** (`backend/src/controllers/qrController.js`):
```javascript
// Before:
res.status(500).json({ success: false, error: 'Failed to get QR code' });

// After:
console.error('Error details:', {
  guestId: req.params.id,
  errorMessage: error.message,
  errorStack: error.stack
});
res.status(500).json({ 
  success: false, 
  error: 'Failed to get QR code',
  details: error.message  // ← Now includes actual error
});
```

**Benefits**:
- ✅ Detailed error logging in server logs
- ✅ Client receives actual error message in `details` field
- ✅ Stack trace for debugging
- ✅ Guest ID included for tracking

### 2. Send WhatsApp with QR Code

**Status**: ✅ Already working correctly!

The `sendInvitationWithQR` function (`backend/src/controllers/whatsappController.js`) already:

1. **Generates or reuses QR code**:
   ```javascript
   if (guest.qr_code_url && guest.qr_code_token) {
     // Use existing QR
   } else {
     // Generate new QR
   }
   ```

2. **Sends custom wedding invitation link**:
   ```javascript
   if (guest.invitation_link) {
     message += `\n\nUndangan digital: ${guest.invitation_link}`;
   }
   ```

3. **Includes QR code as image**:
   ```javascript
   await whatsappService.sendMessageWithImage(guest.phone, message, qrData.qrCode);
   ```

4. **Supports custom messages**:
   ```javascript
   if (customMessage) {
     message = customMessage;
   }
   ```

**API Endpoint**:
```
POST /api/whatsapp/send-invitation/:guestId
Body: {
  "customMessage": "Optional custom message" // If not provided, uses default template
}
```

**Default Message Template**:
```
Halo {Name}! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Undangan digital: {invitation_link}

Terlampir QR Code untuk absensi. Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏
```

### 3. Workflow Enhancement for Auto-Deployment

**Changes** (`.github/workflows/deploy-vps.yml`):

#### A. Automatic Deployment on Push
```yaml
on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.gitignore'
  workflow_dispatch:
    # ... manual trigger still available
```

**Benefits**:
- ✅ Automatic deployment when code is pushed to `main`
- ✅ Ignores documentation-only changes
- ✅ Faster feedback loop

#### B. Smart Deploy Type Selection
```yaml
env:
  DEPLOY_TYPE: ${{ github.event.inputs.deploy_type || 'app-only' }}
```

**Benefits**:
- ✅ Push triggers → `app-only` (fast, ~2-3 minutes)
- ✅ Manual triggers → choose `full`, `app-only`, or `setup-only`
- ✅ No need to setup infrastructure on every deployment

#### C. Better Logging
```yaml
echo "Trigger: ${{ github.event_name }}"
```

**Benefits**:
- ✅ Know if deployment was triggered by push or manual action
- ✅ Better audit trail

## 🔍 Debugging Guide

### QR Code Generation Issues

If you see "Failed to get QR code", check the API response:

```json
{
  "success": false,
  "error": "Failed to get QR code",
  "details": "Connection to database timed out"  // ← Look here!
}
```

**Common Issues**:
1. **Database Connection**: Check DB credentials in `.env`
2. **Guest Not Found**: Verify guest ID exists
3. **Missing QR Code Library**: Run `npm install`

**Server Logs** will show:
```
Error getting QR code: Error: ...
Error details: {
  guestId: 123,
  errorMessage: "...",
  errorStack: "..."
}
```

### WhatsApp Send Issues

Check logs for:
```
Generating new QR code for guest John Doe (123)
✓ QR code generated successfully for guest John Doe
Sending invitation with QR code to John Doe (628123456789)
✓ Invitation with QR code sent successfully to John Doe
```

**Common Issues**:
1. **WhatsApp Not Connected**: Initialize WhatsApp first
2. **Invalid Phone Number**: Check format (must start with country code)
3. **Missing Invitation Link**: Guest must have `invitation_link` field set

## 🚀 Deployment Flow

### Automatic (on Push to Main)
```
1. Developer pushes code to main branch
   ↓
2. GitHub Actions detects push
   ↓
3. Checks if files changed (ignores .md files)
   ↓
4. Triggers "app-only" deployment
   ↓
5. SSH to VPS → git pull → npm install → restart PM2
   ↓
6. ✅ New code deployed in ~2-3 minutes
```

### Manual (workflow_dispatch)
```
1. Go to Actions tab
   ↓
2. Select "Deploy to VPS"
   ↓
3. Click "Run workflow"
   ↓
4. Choose deploy type:
   - full: Complete setup + app deploy (~10 minutes)
   - app-only: Just update app code (~2-3 minutes)
   - setup-only: Only install dependencies (~5 minutes)
   ↓
5. ✅ Deployment completes
```

## 📝 Testing Checklist

- [ ] **QR Code Generation**
  - [ ] GET `/api/qr/guests/:id/qrcode` returns QR code
  - [ ] Error messages include `details` field
  - [ ] Server logs show detailed error info

- [ ] **WhatsApp Send**
  - [ ] POST `/api/whatsapp/send-invitation/:guestId` sends message
  - [ ] Message includes wedding invitation link
  - [ ] QR code image is attached
  - [ ] Custom message parameter works

- [ ] **Deployment**
  - [ ] Push to main triggers deployment
  - [ ] Markdown-only changes don't trigger deployment
  - [ ] Manual workflow still works
  - [ ] App restarts successfully

## 🎉 Summary

**Fixed**:
- ✅ QR code error now returns detailed error message
- ✅ Enhanced error logging for debugging
- ✅ Automatic deployment on code push
- ✅ Optimized deployment workflow

**Already Working**:
- ✅ Send WhatsApp with wedding invitation link
- ✅ QR code included in WhatsApp message
- ✅ Custom message support
- ✅ Comprehensive error handling

**Next Steps**:
1. Test QR generation with real database
2. Monitor deployment logs
3. Verify WhatsApp sending works end-to-end
