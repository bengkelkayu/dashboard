import InvitationTemplate from '../models/InvitationTemplate.js';

// Get all invitation templates
export async function getAll(req, res) {
  try {
    const templates = await InvitationTemplate.findAll();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting invitation templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get single invitation template by ID
export async function getById(req, res) {
  try {
    const { id } = req.params;
    const template = await InvitationTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error getting invitation template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Create new invitation template
export async function create(req, res) {
  try {
    const { name, message_template, is_enabled } = req.body;
    
    const template = await InvitationTemplate.create({
      name,
      message_template,
      is_enabled
    });
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating invitation template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update invitation template
export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, message_template, is_enabled } = req.body;
    
    const template = await InvitationTemplate.update(id, {
      name,
      message_template,
      is_enabled
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error updating invitation template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Delete invitation template
export async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    await InvitationTemplate.delete(id);
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invitation template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Toggle template enabled status
export async function toggleEnabled(req, res) {
  try {
    const { id } = req.params;
    const { is_enabled } = req.body;
    
    const template = await InvitationTemplate.toggleEnabled(id, is_enabled);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error toggling invitation template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Preview invitation template with sample data
export async function preview(req, res) {
  try {
    const { message_template, sample_data } = req.body;
    
    const preview = InvitationTemplate.renderMessage(message_template, sample_data);
    
    res.json({
      success: true,
      data: { preview }
    });
  } catch (error) {
    console.error('Error previewing invitation template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
