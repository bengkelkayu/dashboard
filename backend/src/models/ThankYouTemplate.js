import { query } from '../config/database.js';

class ThankYouTemplate {
  static async findAll() {
    const result = await query(
      'SELECT * FROM thank_you_templates ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM thank_you_templates WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findEnabled() {
    const result = await query(
      'SELECT * FROM thank_you_templates WHERE is_enabled = true ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async create(templateData) {
    const { name, message_template, is_enabled } = templateData;
    const result = await query(
      'INSERT INTO thank_you_templates (name, message_template, is_enabled) VALUES ($1, $2, $3) RETURNING *',
      [name, message_template, is_enabled ?? true]
    );
    return result.rows[0];
  }

  static async update(id, templateData) {
    const { name, message_template, is_enabled } = templateData;
    const result = await query(
      'UPDATE thank_you_templates SET name = $1, message_template = $2, is_enabled = $3 WHERE id = $4 RETURNING *',
      [name, message_template, is_enabled, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM thank_you_templates WHERE id = $1', [id]);
  }

  static async toggleEnabled(id, isEnabled) {
    const result = await query(
      'UPDATE thank_you_templates SET is_enabled = $1 WHERE id = $2 RETURNING *',
      [isEnabled, id]
    );
    return result.rows[0];
  }

  static renderMessage(template, data) {
    let message = template;
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    return message;
  }
}

export default ThankYouTemplate;
