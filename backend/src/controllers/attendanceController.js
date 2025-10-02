import Attendance from '../models/Attendance.js';
import Guest from '../models/Guest.js';
import ThankYouTemplate from '../models/ThankYouTemplate.js';
import ThankYouOutbox from '../models/ThankYouOutbox.js';
import AuditLog from '../models/AuditLog.js';

export const getAllAttendance = async (req, res) => {
  try {
    const { status, guest_id } = req.query;
    const attendance = await Attendance.findAll({ status, guest_id });
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance' });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await Attendance.getSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance summary' });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const { guest_id, status, check_in_source, notes } = req.body;
    
    const guest = await Guest.findById(guest_id);
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    const attendance = await Attendance.create({ 
      guest_id, 
      status: status || 'Presence', 
      check_in_source, 
      notes 
    });
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'attendance',
      entity_id: attendance.id,
      action: 'create',
      old_values: null,
      new_values: attendance,
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    // If status is Presence, trigger thank you message
    if (attendance.status === 'Presence') {
      await triggerThankYouMessage(guest_id, guest);
    }
    
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to create attendance' });
  }
};

async function triggerThankYouMessage(guestId, guest) {
  try {
    // Get enabled template
    const templates = await ThankYouTemplate.findEnabled();
    if (templates.length === 0) {
      console.log('No enabled thank you templates found');
      return;
    }
    
    const template = templates[0]; // Use first enabled template
    const checkInTime = new Date().toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'short'
    });
    
    const message = ThankYouTemplate.renderMessage(template.message_template, {
      nama: guest.name,
      waktu_checkin: checkInTime
    });
    
    // Add to outbox queue
    await ThankYouOutbox.create({
      guest_id: guestId,
      template_id: template.id,
      message,
      phone: guest.phone
    });
    
    console.log(`Thank you message queued for guest ${guest.name}`);
  } catch (error) {
    console.error('Error triggering thank you message:', error);
  }
}

export const updateAttendanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const attendance = await Attendance.updateStatus(id, status);
    
    if (!attendance) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'attendance',
      entity_id: attendance.id,
      action: 'update_status',
      old_values: null,
      new_values: { status },
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error updating attendance status:', error);
    res.status(500).json({ success: false, error: 'Failed to update attendance status' });
  }
};
