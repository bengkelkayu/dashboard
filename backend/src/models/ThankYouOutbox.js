import { query } from '../config/database.js';

class ThankYouOutbox {
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM thank_you_outbox WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.guest_id) {
      sql += ` AND guest_id = $${paramCount}`;
      params.push(filters.guest_id);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  static async findPending(limit = 10) {
    const result = await query(
      'SELECT * FROM thank_you_outbox WHERE status = $1 ORDER BY created_at ASC LIMIT $2',
      ['pending', limit]
    );
    return result.rows;
  }

  static async create(outboxData) {
    const { guest_id, template_id, message, phone } = outboxData;
    const result = await query(
      'INSERT INTO thank_you_outbox (guest_id, template_id, message, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [guest_id, template_id, message, phone]
    );
    return result.rows[0];
  }

  static async markAsSent(id) {
    const result = await query(
      'UPDATE thank_you_outbox SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['sent', id]
    );
    return result.rows[0];
  }

  static async markAsFailed(id, errorMessage) {
    const result = await query(
      'UPDATE thank_you_outbox SET status = $1, error_message = $2, retry_count = retry_count + 1 WHERE id = $3 RETURNING *',
      ['failed', errorMessage, id]
    );
    return result.rows[0];
  }

  static async retryFailed(id) {
    const result = await query(
      'UPDATE thank_you_outbox SET status = $1, error_message = NULL WHERE id = $2 RETURNING *',
      ['pending', id]
    );
    return result.rows[0];
  }

  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_count
      FROM thank_you_outbox
    `);
    return result.rows[0];
  }
}

export default ThankYouOutbox;
