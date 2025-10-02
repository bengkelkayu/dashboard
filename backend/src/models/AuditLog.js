import { query } from '../config/database.js';

class AuditLog {
  static async create(logData) {
    const { entity_type, entity_id, action, old_values, new_values, user_info, ip_address } = logData;
    const result = await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, old_values, new_values, user_info, ip_address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [entity_type, entity_id, action, old_values, new_values, user_info, ip_address]
    );
    return result.rows[0];
  }

  static async findByEntity(entityType, entityId) {
    const result = await query(
      'SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );
    return result.rows;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.entity_type) {
      sql += ` AND entity_type = $${paramCount}`;
      params.push(filters.entity_type);
      paramCount++;
    }

    if (filters.action) {
      sql += ` AND action = $${paramCount}`;
      params.push(filters.action);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const result = await query(sql, params);
    return result.rows;
  }
}

export default AuditLog;
