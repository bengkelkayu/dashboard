import { query } from '../config/database.js';

class Guest {
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM guests WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.category) {
      sql += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (name ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM guests WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const result = await query('SELECT * FROM guests WHERE phone = $1', [phone]);
    return result.rows[0];
  }

  static async create(guestData) {
    const { name, phone, category, invitation_link } = guestData;
    const result = await query(
      'INSERT INTO guests (name, phone, category, invitation_link) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, category, invitation_link || null]
    );
    return result.rows[0];
  }

  static async update(id, guestData) {
    const { name, phone, category, invitation_link } = guestData;
    const result = await query(
      'UPDATE guests SET name = $1, phone = $2, category = $3, invitation_link = $4 WHERE id = $5 RETURNING *',
      [name, phone, category, invitation_link || null, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM guests WHERE id = $1', [id]);
  }

  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE category = 'VVIP') as vvip_count,
        COUNT(*) FILTER (WHERE category = 'VIP') as vip_count,
        COUNT(*) FILTER (WHERE category = 'Regular') as regular_count
      FROM guests
    `);
    return result.rows[0];
  }

  static async updateQRCode(id, token, qrCodeUrl) {
    const result = await query(
      'UPDATE guests SET qr_code_token = $1, qr_code_url = $2, qr_code_generated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [token, qrCodeUrl, id]
    );
    return result.rows[0];
  }

  static async findByQRToken(token) {
    const result = await query('SELECT * FROM guests WHERE qr_code_token = $1', [token]);
    return result.rows[0];
  }
}

export default Guest;
