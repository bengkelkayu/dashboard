import whatsappService from '../services/whatsappService.js';
import Guest from '../models/Guest.js';
import ThankYouTemplate from '../models/ThankYouTemplate.js';
import ThankYouOutbox from '../models/ThankYouOutbox.js';
import qrcode from 'qrcode';

// Get WhatsApp connection status
export async function getStatus(req, res) {
  try {
    const status = whatsappService.getConnectionStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get QR code for WhatsApp authentication
export async function getQRCode(req, res) {
  try {
    const qr = whatsappService.getQRCode();
    
    if (!qr) {
      return res.status(404).json({
        success: false,
        error: 'No QR code available. WhatsApp may already be connected.'
      });
    }

    // Generate QR code image as data URL
    const qrDataURL = await qrcode.toDataURL(qr);
    
    res.json({
      success: true,
      data: {
        qr: qrDataURL
      }
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Initialize WhatsApp connection
export async function initialize(req, res) {
  try {
    await whatsappService.initialize();
    res.json({
      success: true,
      message: 'WhatsApp initialization started'
    });
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Send WhatsApp message to a single guest
export async function sendToGuest(req, res) {
  try {
    const { guestId } = req.params;
    const { templateId, customMessage } = req.body;

    // Get guest
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        error: 'Guest not found'
      });
    }

    let message;
    let template = null;

    if (customMessage) {
      // Use custom message
      message = customMessage;
    } else if (templateId) {
      // Use template
      template = await ThankYouTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Render message with guest data
      message = ThankYouTemplate.renderMessage(template.message_template, {
        nama: guest.name,
        waktu_checkin: new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'short'
        })
      });
    } else {
      // Use first enabled template
      const templates = await ThankYouTemplate.findEnabled();
      if (templates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No enabled templates found. Please provide a custom message or enable a template.'
        });
      }

      template = templates[0];
      message = ThankYouTemplate.renderMessage(template.message_template, {
        nama: guest.name,
        waktu_checkin: new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'short'
        })
      });
    }

    // Send message
    await whatsappService.sendMessage(guest.phone, message);

    // Log to outbox
    await ThankYouOutbox.create({
      guest_id: guestId,
      template_id: template?.id || null,
      message,
      phone: guest.phone
    });

    // Mark as sent immediately since Baileys sends synchronously
    const outbox = await ThankYouOutbox.findAll({ guest_id: guestId, status: 'pending' });
    if (outbox.length > 0) {
      await ThankYouOutbox.markAsSent(outbox[outbox.length - 1].id);
    }

    res.json({
      success: true,
      message: `Message sent to ${guest.name}`,
      data: {
        guest: guest.name,
        phone: guest.phone
      }
    });
  } catch (error) {
    console.error('Error sending message to guest:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Send QR Code with invitation link to a guest
export async function sendInvitationWithQR(req, res) {
  try {
    const { guestId } = req.params;
    const { customMessage } = req.body;

    // Get guest
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        error: 'Guest not found'
      });
    }

    // Generate or get QR code
    const { generateQRCodeForGuest } = await import('./qrController.js');
    let qrData;
    
    if (guest.qr_code_url && guest.qr_code_token) {
      qrData = {
        qrCode: guest.qr_code_url,
        token: guest.qr_code_token
      };
    } else {
      qrData = await generateQRCodeForGuest(guestId, guest);
    }

    // Prepare message
    let message = customMessage || `Halo ${guest.name}! 🎉\n\nBerikut adalah QR Code untuk absensi acara kami.`;
    
    if (guest.invitation_link) {
      message += `\n\nUndangan digital: ${guest.invitation_link}`;
    }
    
    message += `\n\nSilakan tunjukkan QR Code ini saat check-in.\nTerima kasih! 🙏`;

    // Send message with QR code image
    await whatsappService.sendMessageWithImage(guest.phone, message, qrData.qrCode);

    // Log to outbox
    await ThankYouOutbox.create({
      guest_id: guestId,
      template_id: null,
      message: message + '\n[QR Code sent]',
      phone: guest.phone
    });

    // Mark as sent immediately
    const outbox = await ThankYouOutbox.findAll({ guest_id: guestId, status: 'pending' });
    if (outbox.length > 0) {
      await ThankYouOutbox.markAsSent(outbox[outbox.length - 1].id);
    }

    res.json({
      success: true,
      message: `QR Code and invitation sent to ${guest.name}`,
      data: {
        guest: guest.name,
        phone: guest.phone,
        hasInvitationLink: !!guest.invitation_link
      }
    });
  } catch (error) {
    console.error('Error sending invitation with QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Send WhatsApp message to all guests (bulk)
export async function sendToAll(req, res) {
  try {
    const { templateId, customMessage, category } = req.body;

    // Get all guests (optionally filtered by category)
    const filters = category ? { category } : {};
    const guests = await Guest.findAll(filters);

    if (guests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No guests found'
      });
    }

    let template = null;
    
    if (templateId) {
      template = await ThankYouTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }
    } else if (!customMessage) {
      // Use first enabled template
      const templates = await ThankYouTemplate.findEnabled();
      if (templates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No enabled templates found. Please provide a custom message or template ID.'
        });
      }
      template = templates[0];
    }

    const results = {
      total: guests.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Send messages to all guests
    for (const guest of guests) {
      try {
        let message;

        if (customMessage) {
          // Use custom message with placeholders
          message = customMessage
            .replace(/\{nama\}/g, guest.name)
            .replace(/\{waktu_checkin\}/g, new Date().toLocaleString('id-ID', {
              timeZone: 'Asia/Jakarta',
              dateStyle: 'full',
              timeStyle: 'short'
            }));
        } else {
          // Use template
          message = ThankYouTemplate.renderMessage(template.message_template, {
            nama: guest.name,
            waktu_checkin: new Date().toLocaleString('id-ID', {
              timeZone: 'Asia/Jakarta',
              dateStyle: 'full',
              timeStyle: 'short'
            })
          });
        }

        // Send message
        await whatsappService.sendMessage(guest.phone, message);

        // Log to outbox
        const outboxRecord = await ThankYouOutbox.create({
          guest_id: guest.id,
          template_id: template?.id || null,
          message,
          phone: guest.phone
        });

        // Mark as sent immediately
        await ThankYouOutbox.markAsSent(outboxRecord.id);

        results.success++;
        
        // Add small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send message to ${guest.name}:`, error);
        results.failed++;
        results.errors.push({
          guest: guest.name,
          phone: guest.phone,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk send completed. Success: ${results.success}, Failed: ${results.failed}`,
      data: results
    });
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Disconnect WhatsApp
export async function disconnect(req, res) {
  try {
    await whatsappService.disconnect();
    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
