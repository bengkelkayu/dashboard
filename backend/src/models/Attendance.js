import { query } from '../config/database.js';

class Attendance {
  static async findAll(filters = {}) {
    let sql = `
      SELECT a.*, g.name, g.phone, g.category 
      FROM guest_attendance a
      JOIN guests g ON a.guest_id = g.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.guest_id) {
      sql += ` AND a.guest_id = $${paramCount}`;
      params.push(filters.guest_id);
      paramCount++;
    }

    sql += ' ORDER BY a.check_in_time DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findByGuestId(guestId) {
    const result = await query(
      `SELECT a.*, g.name, g.phone, g.category 
       FROM guest_attendance a
       JOIN guests g ON a.guest_id = g.id
       WHERE a.guest_id = $1 
       ORDER BY a.check_in_time DESC`,
      [guestId]
    );
    return result.rows;
  }

  static async create(attendanceData) {
    const { guest_id, status, check_in_source, notes } = attendanceData;
    const result = await query(
      `INSERT INTO guest_attendance (guest_id, status, check_in_source, notes) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [guest_id, status || 'Presence', check_in_source, notes]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await query(
      'UPDATE guest_attendance SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async getSummary() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_check_ins,
        COUNT(DISTINCT guest_id) as unique_guests,
        COUNT(*) FILTER (WHERE status = 'Presence') as presence_count,
        COUNT(*) FILTER (WHERE status = 'Not Presence') as not_presence_count
      FROM guest_attendance
    `);
    return result.rows[0];
  }

  static async getGuestAttendanceStatus(guestId) {
    const result = await query(
      `SELECT 
        CASE 
          WHEN COUNT(*) > 0 AND MAX(status) = 'Presence' THEN 'Presence'
          ELSE 'Not Presence'
        END as attendance_status,
        MAX(check_in_time) as last_check_in
       FROM guest_attendance 
       WHERE guest_id = $1`,
      [guestId]
    );
    return result.rows[0];
  }
}

export default Attendance;
