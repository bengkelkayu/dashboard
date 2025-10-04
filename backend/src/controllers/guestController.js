import Guest from '../models/Guest.js';
import AuditLog from '../models/AuditLog.js';
import Attendance from '../models/Attendance.js';

export const getAllGuests = async (req, res) => {
  try {
    const { category, search } = req.query;
    const guests = await Guest.findAll({ category, search });
    
    // Get attendance status for each guest
    const guestsWithAttendance = await Promise.all(
      guests.map(async (guest) => {
        const attendanceStatus = await Attendance.getGuestAttendanceStatus(guest.id);
        return {
          ...guest,
          attendance_status: attendanceStatus.attendance_status,
          last_check_in: attendanceStatus.last_check_in
        };
      })
    );
    
    res.json({ success: true, data: guestsWithAttendance });
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guests' });
  }
};

export const getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Guest.findById(id);
    
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    // Get attendance history
    const attendanceHistory = await Attendance.findByGuestId(id);
    const attendanceStatus = await Attendance.getGuestAttendanceStatus(id);
    
    res.json({ 
      success: true, 
      data: {
        ...guest,
        attendance_status: attendanceStatus.attendance_status,
        last_check_in: attendanceStatus.last_check_in,
        attendance_history: attendanceHistory
      }
    });
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch guest' });
  }
};

export const createGuest = async (req, res) => {
  try {
    const { name, phone, category } = req.body;
    
    // Check if phone already exists
    const existing = await Guest.findByPhone(phone);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Phone number already exists' });
    }
    
    const guest = await Guest.create({ name, phone, category });
    
    // Generate QR code for the new guest
    try {
      const { generateQRCodeForGuest } = await import('./qrController.js');
      await generateQRCodeForGuest(guest.id, guest);
    } catch (error) {
      console.error('Error generating QR code for new guest:', error);
      // Don't fail the request if QR generation fails
    }
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'guest',
      entity_id: guest.id,
      action: 'create',
      old_values: null,
      new_values: guest,
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.status(201).json({ success: true, data: guest });
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ success: false, error: 'Failed to create guest' });
  }
};

export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, category } = req.body;
    
    const oldGuest = await Guest.findById(id);
    if (!oldGuest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    // Check if phone already exists for another guest
    if (phone !== oldGuest.phone) {
      const existing = await Guest.findByPhone(phone);
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ success: false, error: 'Phone number already exists' });
      }
    }
    
    const guest = await Guest.update(id, { name, phone, category });
    
    // Create audit log for category change
    if (oldGuest.category !== category) {
      await AuditLog.create({
        entity_type: 'guest',
        entity_id: guest.id,
        action: 'update_category',
        old_values: { category: oldGuest.category },
        new_values: { category: guest.category },
        user_info: req.headers['user-agent'],
        ip_address: req.ip
      });
    }
    
    res.json({ success: true, data: guest });
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ success: false, error: 'Failed to update guest' });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ success: false, error: 'Guest not found' });
    }
    
    await Guest.delete(id);
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'guest',
      entity_id: parseInt(id),
      action: 'delete',
      old_values: guest,
      new_values: null,
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ success: false, error: 'Failed to delete guest' });
  }
};

export const getGuestStats = async (req, res) => {
  try {
    const stats = await Guest.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching guest stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
