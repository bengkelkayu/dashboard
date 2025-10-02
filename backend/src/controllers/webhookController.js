import Guest from '../models/Guest.js';
import Attendance from '../models/Attendance.js';
import ThankYouTemplate from '../models/ThankYouTemplate.js';
import ThankYouOutbox from '../models/ThankYouOutbox.js';
import AuditLog from '../models/AuditLog.js';
import crypto from 'crypto';

// Webhook endpoint to receive check-in events from Digital Guestbook
export const handleCheckInWebhook = async (req, res) => {
  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-webhook-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' });
      }
    }
    
    const { phone, name, timestamp } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    
    // Find guest by phone
    let guest = await Guest.findByPhone(phone);
    
    // If guest not found and name is provided, create new guest
    if (!guest && name) {
      guest = await Guest.create({
        name,
        phone,
        category: 'Regular' // Default category for walk-ins
      });
      
      await AuditLog.create({
        entity_type: 'guest',
        entity_id: guest.id,
        action: 'auto_create_from_webhook',
        old_values: null,
        new_values: guest,
        user_info: 'Digital Guestbook Webhook',
        ip_address: req.ip
      });
    }
    
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      guest_id: guest.id,
      status: 'Presence',
      check_in_source: 'Digital Guestbook',
      notes: timestamp ? `Check-in at ${timestamp}` : null
    });
    
    await AuditLog.create({
      entity_type: 'attendance',
      entity_id: attendance.id,
      action: 'webhook_checkin',
      old_values: null,
      new_values: attendance,
      user_info: 'Digital Guestbook Webhook',
      ip_address: req.ip
    });
    
    // Trigger thank you message
    const templates = await ThankYouTemplate.findEnabled();
    if (templates.length > 0) {
      const template = templates[0];
      const checkInTime = new Date(timestamp || Date.now()).toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'short'
      });
      
      const message = ThankYouTemplate.renderMessage(template.message_template, {
        nama: guest.name,
        waktu_checkin: checkInTime
      });
      
      await ThankYouOutbox.create({
        guest_id: guest.id,
        template_id: template.id,
        message,
        phone: guest.phone
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Check-in recorded successfully',
      data: {
        guest,
        attendance
      }
    });
  } catch (error) {
    console.error('Error handling check-in webhook:', error);
    res.status(500).json({ success: false, error: 'Failed to process check-in' });
  }
};
