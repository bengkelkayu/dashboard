# Feature: Send QR Code + Invitation Link via WhatsApp

## Overview
This feature allows sending attendance QR codes along with customizable digital invitation links to guests via WhatsApp with a single button click.

## Problem Solved
Previously, there was no easy way to send both the QR code for attendance and a custom digital invitation link to guests. This feature consolidates that into one action.

## What Changed

### Database
- Added `invitation_link` text column to `guests` table
- Field is optional and can be customized per guest

### Backend API
- New endpoint: `POST /api/whatsapp/send-invitation/:guestId`
- New WhatsApp service method: `sendMessageWithImage()` for sending images with captions
- Enhanced WhatsApp controller with `sendInvitationWithQR()` function

### Frontend
- Guest form now includes "Link Undangan Digital" input field
- Guest drawer displays the invitation link
- New button: "📱 Kirim QR & Link Undangan" in guest actions
- Automatic QR code generation if not exists

### DevOps
- Enhanced GitHub Actions deployment workflow with:
  - Better error handling and validation
  - Health check verification after deployment
  - PM2 process status monitoring
  - Detailed deployment summary

## Usage

1. **Add/Edit Guest:**
   - Enter guest details (name, phone, category)
   - Optionally add invitation link (e.g., https://yoursite.com/invite/guestname)
   - Save guest

2. **Send Invitation:**
   - Open guest details by clicking guest name
   - Click "�� Kirim QR & Link Undangan"
   - Confirm to send
   - Guest receives WhatsApp message with QR code image and invitation link

3. **Message Format:**
   ```
   [QR CODE IMAGE]
   
   Halo {Guest Name}! 🎉
   
   Berikut adalah QR Code untuk absensi acara kami.
   
   Undangan digital: {invitation_link}
   
   Silakan tunjukkan QR Code ini saat check-in.
   Terima kasih! 🙏
   ```

## Technical Implementation

### Files Modified
1. `backend/migrations/003_add_invitation_link.sql` - New migration
2. `backend/src/models/Guest.js` - Support invitation_link field
3. `backend/src/services/whatsappService.js` - Add image sending capability
4. `backend/src/controllers/whatsappController.js` - Add sendInvitationWithQR
5. `backend/src/routes/whatsapp.js` - Add new route
6. `public/index.html` - UI updates for form and drawer
7. `public/app.js` - Frontend logic updates
8. `public/api-client.js` - API client updates
9. `.github/workflows/deploy-vps.yml` - Workflow enhancements

### API Specification

**Endpoint:** POST /api/whatsapp/send-invitation/:guestId

**Request:**
```json
{
  "customMessage": "Optional custom message (default message used if not provided)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "QR Code and invitation sent to Guest Name",
  "data": {
    "guest": "Guest Name",
    "phone": "62812345678",
    "hasInvitationLink": true
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Deployment

After pulling these changes:

1. Run database migration:
   ```bash
   npm run migrate
   ```

2. Restart the application:
   ```bash
   pm2 restart wedding-api
   pm2 restart wedding-worker
   ```

3. Or use GitHub Actions workflow for automated deployment

## Benefits

✅ **Single Action** - One button sends both QR and invitation
✅ **Customizable** - Each guest can have unique invitation link
✅ **Optional** - Works with or without invitation link
✅ **Automatic** - QR code generated automatically if needed
✅ **Tracked** - All sends logged to outbox table
✅ **Reliable** - Enhanced deployment with health checks

## Future Enhancements

- Bulk send to multiple guests
- Custom message templates
- Send tracking and analytics
- Resend with rate limiting
- Preview before sending

## Support

For issues or questions, refer to the main README.md or check GitHub issues.
