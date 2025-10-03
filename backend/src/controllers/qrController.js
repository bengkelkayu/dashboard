import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import Guest from '../models/Guest.js';

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'default-qr-secret-key-change-this';

// Generate HMAC signature for QR code data
function generateSignature(data) {
  const hmac = crypto.createHmac('sha256', QR_SECRET_KEY);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

// Verify HMAC signature
function verifySignature(data, signature) {
  const expectedSignature = generateSignature(data);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Generate QR code for a guest
export async function generateQRCodeForGuest(guestId, guestData) {
  try {
    const token = uuidv4();
    const payload = {
      guest_id: guestId,
      token: token,
      nama: guestData.name,
      category: guestData.category
    };
    
    // Generate signature
    payload.signature = generateSignature({
      guest_id: guestId,
      token: token
    });
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });
    
    // Update guest record with QR code data
    await Guest.updateQRCode(guestId, token, qrCodeUrl);
    
    return {
      qrCode: qrCodeUrl,
      token: token
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Get QR code for a guest (generate if not exists)
export async function getGuestQRCode(req, res) {
  try {
    const { id } = req.params;
    
    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    // If QR code already exists, return it
    if (guest.qr_code_url && guest.qr_code_token) {
      return res.json({ 
        success: true, 
        data: { 
          qrCode: guest.qr_code_url,
          token: guest.qr_code_token,
          generatedAt: guest.qr_code_generated_at
        } 
      });
    }
    
    // Generate new QR code
    const result = await generateQRCodeForGuest(id, guest);
    
    res.json({ 
      success: true, 
      data: { 
        qrCode: result.qrCode,
        token: result.token
      } 
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    res.status(500).json({ success: false, error: 'Failed to get QR code' });
  }
}

// Scan QR code and create attendance
export async function scanQRCode(req, res) {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ success: false, error: 'QR data is required' });
    }
    
    // Parse QR data
    let payload;
    try {
      payload = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid QR code format' });
    }
    
    const { guest_id, token, signature } = payload;
    
    if (!guest_id || !token || !signature) {
      return res.status(400).json({ success: false, error: 'Invalid QR code data' });
    }
    
    // Verify signature
    try {
      const isValid = verifySignature({ guest_id, token }, signature);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid QR code signature' });
      }
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid QR code signature' });
    }
    
    // Verify guest exists and token matches
    const guest = await Guest.findById(guest_id);
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    if (guest.qr_code_token !== token) {
      return res.status(401).json({ success: false, error: 'Invalid or expired QR code' });
    }
    
    // Check for duplicate attendance (already checked in today)
    const Attendance = (await import('../models/Attendance.js')).default;
    const existingAttendance = await Attendance.checkTodayAttendance(guest_id);
    
    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        error: 'Guest already checked in today',
        data: {
          guest: guest.name,
          previousCheckIn: existingAttendance.check_in_time
        }
      });
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      guest_id: guest_id,
      status: 'Presence',
      check_in_source: 'QR Code Scanner',
      notes: 'Checked in via QR code scan'
    });
    
    // Trigger thank you message
    const { triggerThankYouMessage } = await import('./attendanceController.js');
    await triggerThankYouMessage(guest_id, guest);
    
    res.json({
      success: true,
      message: `Successfully checked in: ${guest.name}`,
      data: {
        attendance: attendance,
        guest: {
          id: guest.id,
          name: guest.name,
          category: guest.category
        }
      }
    });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({ success: false, error: 'Failed to process QR code scan' });
  }
}

// Webhook endpoint for external scanner (optional)
export async function webhookQRCheckIn(req, res) {
  try {
    // Verify webhook signature from header
    const webhookSignature = req.headers['x-webhook-signature'];
    const webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    
    if (!webhookSignature) {
      return res.status(401).json({ success: false, error: 'Webhook signature required' });
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
    }
    
    // Use same logic as scanQRCode
    return scanQRCode(req, res);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, error: 'Failed to process webhook' });
  }
}

export { generateSignature, verifySignature };
