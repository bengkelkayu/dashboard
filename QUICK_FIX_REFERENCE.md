# Quick Fix Reference Card

## 🎯 Problem
- Error: `column "qr_code_token" of relation "guests" does not exist`
- Wrong endpoint behavior: `/api/whatsapp/send/1` was sending thank you messages
- Need wedding invitation with QR code, not thank you message

## ✅ Solution Applied

### Changed API Endpoint: `/api/whatsapp/send/:guestId`

**Now sends**: Wedding invitation + QR code (auto-generated)

```bash
# Just call this endpoint - QR code is automatic!
POST http://43.134.97.90/api/whatsapp/send/1

# Response includes QR code status
{
  "success": true,
  "message": "Wedding invitation and QR Code sent to John Doe",
  "data": {
    "hasQRCode": true,
    "hasInvitationLink": true
  }
}
```

## 🚀 To Deploy (3 Steps)

```bash
# 1. Pull code
git pull origin main

# 2. Fix database (CRITICAL!)
npm run verify-schema
npm run migrate

# 3. Restart
pm2 restart wedding-api
```

## 📋 What You Get

✅ **Automatic QR Code Generation**
- No need to call separate QR endpoint
- QR code generated and saved per guest
- Reused if already exists

✅ **Wedding Invitation Message**
```
Halo {nama}! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Undangan digital: {link}

Terlampir QR Code untuk absensi.
Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏

[QR Code Image Attached]
```

✅ **Updated Dashboard**
- Button: "📤 Undangan" (was "📤 WA")
- Confirms: "Kirim undangan pernikahan dengan QR Code?"
- Success: "Undangan pernikahan dan QR Code berhasil dikirim"

## 🔍 Quick Test

```bash
# After deployment, test immediately:
curl -X POST http://43.134.97.90/api/whatsapp/send/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: ✅ Success response + WhatsApp message sent + QR code attached

## 🐛 If Error Occurs

### "column qr_code_token does not exist"
```bash
npm run migrate
pm2 restart wedding-api
```

### "Failed to generate QR code"
```bash
npm run verify-schema  # See what's missing
npm run migrate         # Fix it
```

### "WhatsApp not connected"
```bash
# Get QR to connect WhatsApp
curl http://43.134.97.90/api/whatsapp/qr
# Scan with WhatsApp app
```

## 📞 Support Commands

```bash
# Check if database is OK
npm run verify-schema

# View logs
pm2 logs wedding-api

# Restart everything
pm2 restart all

# Check status
pm2 status
```

## 🎨 Visual Changes

**Dashboard Button Before**: 
`📤 WA`

**Dashboard Button After**: 
`📤 Undangan` (with tooltip: "Kirim undangan pernikahan dengan QR Code")

## 📊 Payload Structure

### Request (Simple!)
```json
POST /api/whatsapp/send/:guestId
{}
```

### Response (Detailed)
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

## 🎯 Key Improvements

| Feature | Before | After |
|---------|--------|-------|
| Message type | Thank you | Wedding invitation |
| QR code | Manual generation | **Automatic** |
| Invitation link | Not included | **Included** |
| API call needed | 2 (QR + Send) | **1 (All-in-one)** |
| Error messages | Generic | **Detailed + fix instructions** |

## ⚡ Performance

- QR code cached per guest (generated once, reused)
- No multiple API calls needed
- WhatsApp message + image sent together

## 🎉 Result

One API call = Complete wedding invitation package:
1. ✅ Personalized greeting
2. ✅ Wedding invitation message
3. ✅ Digital invitation link (if set)
4. ✅ QR code for attendance
5. ✅ Clear instructions
6. ✅ Proper closing

---

**Need detailed docs?** See `WEDDING_INVITATION_UPDATE.md` or `DEPLOYMENT_GUIDE_FIX.md`
