import ThankYouTemplate from '../models/ThankYouTemplate.js';
import AuditLog from '../models/AuditLog.js';

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await ThankYouTemplate.findAll();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await ThankYouTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    res.json({ success: true, data: template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch template' });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, message_template, is_enabled } = req.body;
    
    const template = await ThankYouTemplate.create({ name, message_template, is_enabled });
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'thank_you_template',
      entity_id: template.id,
      action: 'create',
      old_values: null,
      new_values: template,
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, error: 'Failed to create template' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message_template, is_enabled } = req.body;
    
    const oldTemplate = await ThankYouTemplate.findById(id);
    if (!oldTemplate) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    const template = await ThankYouTemplate.update(id, { name, message_template, is_enabled });
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'thank_you_template',
      entity_id: template.id,
      action: 'update',
      old_values: oldTemplate,
      new_values: template,
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.json({ success: true, data: template });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await ThankYouTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    await ThankYouTemplate.delete(id);
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'thank_you_template',
      entity_id: parseInt(id),
      action: 'delete',
      old_values: template,
      new_values: null,
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: 'Failed to delete template' });
  }
};

export const toggleTemplateEnabled = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_enabled } = req.body;
    
    const oldTemplate = await ThankYouTemplate.findById(id);
    if (!oldTemplate) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    const template = await ThankYouTemplate.toggleEnabled(id, is_enabled);
    
    // Create audit log
    await AuditLog.create({
      entity_type: 'thank_you_template',
      entity_id: template.id,
      action: 'toggle_enabled',
      old_values: { is_enabled: oldTemplate.is_enabled },
      new_values: { is_enabled: template.is_enabled },
      user_info: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    res.json({ success: true, data: template });
  } catch (error) {
    console.error('Error toggling template:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle template' });
  }
};

export const previewTemplate = async (req, res) => {
  try {
    const { message_template, sample_data } = req.body;
    
    const defaultData = {
      nama: sample_data?.nama || 'Budi Santoso',
      waktu_checkin: sample_data?.waktu_checkin || new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'short'
      })
    };
    
    const preview = ThankYouTemplate.renderMessage(message_template, defaultData);
    
    res.json({ success: true, data: { preview, sample_data: defaultData } });
  } catch (error) {
    console.error('Error previewing template:', error);
    res.status(500).json({ success: false, error: 'Failed to preview template' });
  }
};
