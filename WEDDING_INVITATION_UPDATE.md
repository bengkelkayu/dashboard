# Fix Summary: Wedding Invitation with QR Code Enhancement

## 🎯 Problem Statement

The user reported several issues:
1. **QR Code Generation Error**: `column "qr_code_token" of relation "guests" does not exist`
2. **API Endpoint Confusion**: Using `/api/whatsapp/send/:guestId` which was sending thank you messages instead of wedding invitations
3. **Message Type Issue**: Need wedding invitation messages with QR code, not thank you messages

## ✅ Solutions Implemented

### 1. Changed `/api/whatsapp/send/:guestId` Behavior

**Before**: Sent thank you messages using templates
**After**: Sends wedding invitation with QR code

The endpoint now:
- ✅ Generates QR code automatically if not exists
- ✅ Sends wedding invitation message (not thank you)
- ✅ Includes digital invitation link if available
- ✅ Attaches QR code as image

**API Endpoint**:
```
POST /api/whatsapp/send/:guestId
Content-Type: application/json

{
  "customMessage": "Optional custom wedding invitation message"
}
```

**Default Message Format**:
```
Halo {Name}! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Undangan digital: {invitation_link}

Terlampir QR Code untuk absensi. Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏
```

### 2. Enhanced Error Messages

Added detailed error messages for database issues:
- ✅ Clear message when QR columns are missing
- ✅ Instructions on how to fix: "Please run migrations: npm run migrate"
- ✅ PostgreSQL error code detection (42703 for missing columns)

### 3. Added Database Schema Verification

New script to verify database schema:
```bash
npm run verify-schema
```

This will check:
- ✅ All required QR code columns exist
- ✅ invitation_link column exists  
- ✅ All required tables exist
- ✅ Provides fix instructions if issues found

### 4. Updated Frontend

- ✅ Button text changed from "📤 WA" to "📤 Undangan" (Invitation)
- ✅ Confirmation dialog now says "Kirim undangan pernikahan dengan QR Code"
- ✅ Success message clarifies "Undangan pernikahan dan QR Code berhasil dikirim"
- ✅ Button tooltip explains it sends wedding invitation with QR code

## 🚀 How to Use

### Send Wedding Invitation to Single Guest

**Method 1: Via API**
```bash
POST http://43.134.97.90/api/whatsapp/send/1
Content-Type: application/json

{}
```

**Method 2: Via Dashboard**
1. Open the dashboard
2. Find the guest in the table
3. Click "📤 Undangan" button
4. Confirm the dialog

**Success Response**:
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

### Verify Database Schema

Before using the application, verify your database schema:

```bash
npm run verify-schema
```

If you see errors, run migrations:

```bash
npm run migrate
```

## 📝 What Each Endpoint Does Now

### `/api/whatsapp/send/:guestId` (Updated ✨)
- **Purpose**: Send wedding invitation with QR code
- **Includes**: Wedding message, invitation link, QR code image
- **QR Code**: Auto-generated if not exists

### `/api/whatsapp/send-invitation/:guestId` (Same)
- **Purpose**: Send wedding invitation with QR code
- **Same as**: `/send/:guestId` (they're now identical)
- **Note**: Kept for backward compatibility

### `/api/whatsapp/send-all`
- **Purpose**: Bulk send messages
- **Supports**: Templates or custom messages
- **Use Case**: Thank you messages after event

## 🔍 Troubleshooting

### Error: "column qr_code_token does not exist"

**Cause**: Database migration not run

**Fix**:
```bash
# 1. Verify schema
npm run verify-schema

# 2. Run migrations
npm run migrate

# 3. Restart server
npm start
```

### Error: "Failed to generate QR code"

**Possible Causes**:
1. Database columns missing → Run migrations
2. Database connection issue → Check .env configuration
3. Guest not found → Verify guest ID

**Check**:
```bash
# Verify database connection and schema
npm run verify-schema
```

## 🎯 Key Changes Summary

| Component | Before | After |
|-----------|--------|-------|
| `/api/whatsapp/send/:guestId` | Thank you message | **Wedding invitation + QR** |
| Message tone | "Terima kasih!" | "Ditunggu kehadirannya!" |
| QR Code | Not included | **Auto-generated & included** |
| Invitation link | Not supported | **Included if available** |
| Button label | "📤 WA" | "📤 Undangan" |
| Error messages | Generic | **Detailed with fix instructions** |

## 📚 Documentation

For more details, see:
- `API.md` - Complete API documentation
- `FEATURE_QR_INVITATION.md` - Feature documentation
- `MESSAGE_COMPARISON.md` - Message format comparison

## 💡 Tips

1. **Set Invitation Link**: Add `invitation_link` when creating/editing guests for personalized invitations
2. **Test First**: Use `/api/whatsapp/send/:guestId` with one guest before bulk sending
3. **Verify Schema**: Always run `npm run verify-schema` after deployment
4. **Monitor Logs**: Check console for detailed error messages and sending status

## ✨ Benefits

✅ **Simple API**: Just call `/api/whatsapp/send/:guestId` to send complete wedding invitation
✅ **Automatic QR**: No need to generate QR separately
✅ **Personalized**: Each guest gets their own QR code and invitation link
✅ **Clear Messages**: Wedding invitation tone, not thank you
✅ **Better Errors**: Detailed error messages with fix instructions
✅ **Easy Verification**: Quick schema check with `npm run verify-schema`
