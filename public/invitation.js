// Import API client
import { invitationTemplateAPI } from './api-client.js';

// Template data storage
let templates = [];
let editingId = null;

// Load data from API on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadTemplates();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add template button
    document.getElementById('addTemplateBtn').addEventListener('click', openAddModal);

    // Close modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('templateModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form submit
    document.getElementById('templateForm').addEventListener('submit', handleFormSubmit);

    // Preview button
    document.getElementById('previewBtn').addEventListener('click', updatePreview);

    // Auto-update preview on message change
    document.getElementById('messageTemplate').addEventListener('input', updatePreview);
}

// Open modal for adding template
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Tambah Template';
    document.getElementById('templateForm').reset();
    document.getElementById('isEnabled').checked = true;
    clearErrors();
    updatePreview();
    document.getElementById('templateModal').style.display = 'block';
}

// Open modal for editing template
function openEditModal(id) {
    editingId = id;
    const template = templates.find(t => t.id === id);
    
    if (template) {
        document.getElementById('modalTitle').textContent = 'Edit Template';
        document.getElementById('templateName').value = template.name;
        document.getElementById('messageTemplate').value = template.message_template;
        document.getElementById('isEnabled').checked = template.is_enabled;
        clearErrors();
        updatePreview();
        document.getElementById('templateModal').style.display = 'block';
    }
}

// Close modal
function closeModal() {
    document.getElementById('templateModal').style.display = 'none';
    document.getElementById('templateForm').reset();
    clearErrors();
    editingId = null;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('templateName').value.trim();
    const message_template = document.getElementById('messageTemplate').value.trim();
    const is_enabled = document.getElementById('isEnabled').checked;

    if (!name) {
        document.getElementById('nameError').textContent = 'Nama template wajib diisi';
        return;
    }

    if (!message_template) {
        document.getElementById('messageError').textContent = 'Pesan template wajib diisi';
        return;
    }

    try {
        const templateData = { name, message_template, is_enabled };
        
        if (editingId) {
            await invitationTemplateAPI.update(editingId, templateData);
        } else {
            await invitationTemplateAPI.create(templateData);
        }

        await loadTemplates();
        closeModal();
    } catch (error) {
        console.error('Error saving template:', error);
        alert('Gagal menyimpan template: ' + error.message);
    }
}

// Update preview
async function updatePreview() {
    const messageTemplate = document.getElementById('messageTemplate').value.trim();
    const previewBox = document.getElementById('previewMessage');

    if (!messageTemplate) {
        previewBox.textContent = 'Ketik pesan untuk melihat preview...';
        return;
    }

    try {
        const response = await invitationTemplateAPI.preview(messageTemplate, {
            Name: 'Budi Santoso',
            name: 'Budi Santoso',
            phone: '628123456789',
            category: 'VVIP',
            invitation_link: 'https://example.com/invitation/123'
        });
        previewBox.textContent = response.data.preview;
    } catch (error) {
        console.error('Error previewing template:', error);
        previewBox.textContent = 'Error generating preview';
    }
}

// Load templates from API
async function loadTemplates() {
    try {
        const response = await invitationTemplateAPI.getAll();
        templates = response.data;
        renderTemplates();
    } catch (error) {
        console.error('Error loading templates:', error);
        templates = [];
        renderTemplates();
    }
}

// Render templates
function renderTemplates() {
    const container = document.getElementById('templatesContainer');
    
    if (templates.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Belum ada template undangan.</p>
                <p>Klik tombol "+ Tambah Template" untuk membuat template baru.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = templates.map(template => `
        <div class="template-card ${!template.is_enabled ? 'disabled' : ''}">
            <div class="template-header">
                <h3>${escapeHtml(template.name)}</h3>
                <div class="template-actions">
                    <label class="toggle-switch">
                        <input type="checkbox" ${template.is_enabled ? 'checked' : ''} 
                               onchange="window.toggleTemplate(${template.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            <div class="template-message">
                <pre>${escapeHtml(template.message_template)}</pre>
            </div>
            <div class="template-footer">
                <span class="template-date">
                    📅 Dibuat: ${new Date(template.created_at).toLocaleDateString('id-ID')}
                </span>
                <div class="template-buttons">
                    <button class="btn btn-secondary btn-sm" onclick="window.openEditModal(${template.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.deleteTemplate(${template.id})">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle template enabled status
async function toggleTemplate(id, isEnabled) {
    try {
        await invitationTemplateAPI.toggle(id, isEnabled);
        await loadTemplates();
    } catch (error) {
        console.error('Error toggling template:', error);
        alert('Gagal mengubah status template: ' + error.message);
        await loadTemplates(); // Reload to revert the toggle
    }
}

// Delete template
async function deleteTemplate(id) {
    if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
        try {
            await invitationTemplateAPI.delete(id);
            await loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Gagal menghapus template: ' + error.message);
        }
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear error messages
function clearErrors() {
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
}

// Make functions globally accessible
window.openEditModal = openEditModal;
window.toggleTemplate = toggleTemplate;
window.deleteTemplate = deleteTemplate;
