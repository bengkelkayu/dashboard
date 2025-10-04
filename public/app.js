// Import API client
import { guestAPI, attendanceAPI, whatsappAPI, thankYouAPI, qrAPI } from './api-client.js';

// Guest data storage
let guests = [];
let editingId = null;
let templates = [];

// Load data from API on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadGuests();
    await updateStats();
    await loadTemplates();
    await checkWhatsAppStatus();
    setupEventListeners();
    
    // Poll WhatsApp status every 10 seconds
    setInterval(checkWhatsAppStatus, 10000);
});

// Setup event listeners
function setupEventListeners() {
    // Add guest button
    document.getElementById('addGuestBtn').addEventListener('click', openAddModal);

    // WhatsApp buttons
    document.getElementById('waQRBtn').addEventListener('click', showQRCode);
    document.getElementById('sendAllWABtn').addEventListener('click', openBulkWAModal);
    
    // Bulk WA form
    document.getElementById('bulkWAForm').addEventListener('submit', handleBulkWASend);
    document.getElementById('bulkTemplate').addEventListener('change', updateBulkPreview);

    // Close modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('guestModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form submit
    document.getElementById('guestForm').addEventListener('submit', handleFormSubmit);

    // Search and filter
    document.getElementById('searchInput').addEventListener('input', filterGuests);
    document.getElementById('filterCategory').addEventListener('change', filterGuests);

    // Real-time validation
    document.getElementById('guestName').addEventListener('input', validateName);
    document.getElementById('guestPhone').addEventListener('input', validatePhone);
    document.getElementById('guestCategory').addEventListener('change', validateCategory);
}

// Open modal for adding guest
function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Tambah Tamu';
    document.getElementById('guestForm').reset();
    clearErrors();
    document.getElementById('guestModal').style.display = 'block';
}

// Open modal for editing guest
function openEditModal(id) {
    editingId = id;
    const guest = guests.find(g => g.id === id);
    
    if (guest) {
        document.getElementById('modalTitle').textContent = 'Edit Tamu';
        document.getElementById('guestName').value = guest.name;
        document.getElementById('guestPhone').value = guest.phone;
        document.getElementById('guestCategory').value = guest.category;
        clearErrors();
        document.getElementById('guestModal').style.display = 'block';
    }
}

// Close modal
function closeModal() {
    document.getElementById('guestModal').style.display = 'none';
    document.getElementById('guestForm').reset();
    clearErrors();
    editingId = null;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const category = document.getElementById('guestCategory').value;

    // Validate all fields
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isCategoryValid = validateCategory();

    if (!isNameValid || !isPhoneValid || !isCategoryValid) {
        return;
    }

    try {
        const guestData = { name, phone, category };
        
        if (editingId) {
            // Update existing guest
            await guestAPI.update(editingId, guestData);
        } else {
            // Add new guest
            await guestAPI.create(guestData);
        }

        await loadGuests();
        await updateStats();
        closeModal();
    } catch (error) {
        console.error('Error saving guest:', error);
        alert('Gagal menyimpan data tamu: ' + error.message);
    }
}

// Validation functions
function validateName() {
    const nameInput = document.getElementById('guestName');
    const nameError = document.getElementById('nameError');
    const name = nameInput.value.trim();

    if (name === '') {
        nameInput.classList.add('invalid');
        nameError.textContent = 'Nama tamu wajib diisi';
        return false;
    } else if (name.length < 3) {
        nameInput.classList.add('invalid');
        nameError.textContent = 'Nama minimal 3 karakter';
        return false;
    } else {
        nameInput.classList.remove('invalid');
        nameError.textContent = '';
        return true;
    }
}

function validatePhone() {
    const phoneInput = document.getElementById('guestPhone');
    const phoneError = document.getElementById('phoneError');
    const phone = phoneInput.value.trim();

    if (phone === '') {
        phoneInput.classList.add('invalid');
        phoneError.textContent = 'Nomor WhatsApp wajib diisi';
        return false;
    }

    // Check if phone starts with 62
    if (!phone.startsWith('62')) {
        phoneInput.classList.add('invalid');
        phoneError.textContent = 'Nomor harus dimulai dengan 62 (contoh: 628123456789)';
        return false;
    }

    // Check if phone contains only numbers
    if (!/^\d+$/.test(phone)) {
        phoneInput.classList.add('invalid');
        phoneError.textContent = 'Nomor hanya boleh berisi angka';
        return false;
    }

    // Check minimum length (62 + 9 digits = 11)
    if (phone.length < 11) {
        phoneInput.classList.add('invalid');
        phoneError.textContent = 'Nomor minimal 11 digit (62 + 9 digit)';
        return false;
    }

    // Check maximum length
    if (phone.length > 15) {
        phoneInput.classList.add('invalid');
        phoneError.textContent = 'Nomor maksimal 15 digit';
        return false;
    }

    phoneInput.classList.remove('invalid');
    phoneError.textContent = '';
    return true;
}

function validateCategory() {
    const categorySelect = document.getElementById('guestCategory');
    const categoryError = document.getElementById('categoryError');
    const category = categorySelect.value;

    if (category === '') {
        categorySelect.classList.add('invalid');
        categoryError.textContent = 'Kategori wajib dipilih';
        return false;
    } else {
        categorySelect.classList.remove('invalid');
        categoryError.textContent = '';
        return true;
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(error => error.textContent = '');
    document.querySelectorAll('.invalid').forEach(input => input.classList.remove('invalid'));
}

// Render guest table
function renderGuestTable(filteredGuests = null) {
    const tbody = document.getElementById('guestTableBody');
    const guestsToRender = filteredGuests || guests;

    if (guestsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <div class="empty-state-text">Belum ada data tamu. Klik "Tambah Tamu" untuk menambahkan.</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = guestsToRender.map((guest, index) => {
        const attendanceBadge = getAttendanceBadge(guest.attendance_status);
        return `
            <tr onclick="window.openGuestDrawer(${guest.id})" style="cursor: pointer;">
                <td>${index + 1}</td>
                <td>${escapeHtml(guest.name)}</td>
                <td>${escapeHtml(guest.phone)}</td>
                <td>${getCategoryBadge(guest.category)}</td>
                <td>${attendanceBadge}</td>
                <td onclick="event.stopPropagation();">
                    <button class="btn btn-qr btn-sm" onclick="viewQRCode(${guest.id})" title="Lihat QR Code">📱 QR</button>
                    <button class="btn btn-edit" onclick="openEditModal(${guest.id})">Edit</button>
                    <button class="btn btn-success btn-sm" onclick="sendWhatsAppToGuest(${guest.id})">📤 WA</button>
                    <button class="btn btn-delete" onclick="deleteGuest(${guest.id})">Hapus</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get category badge HTML
function getCategoryBadge(category) {
    const badges = {
        'VVIP': '<span class="category-badge vvip"><span class="icon">👑</span> VVIP</span>',
        'VIP': '<span class="category-badge vip"><span class="icon">⭐</span> VIP</span>',
        'Regular': '<span class="category-badge regular"><span class="icon">👤</span> Regular</span>'
    };
    return badges[category] || category;
}

// Get attendance badge HTML
function getAttendanceBadge(status) {
    if (status === 'Presence') {
        return '<span class="attendance-badge presence">✓ Presence</span>';
    } else {
        return '<span class="attendance-badge not-presence">✗ Not Presence</span>';
    }
}

// Update statistics
async function updateStats() {
    try {
        const response = await guestAPI.getStats();
        const stats = response.data;
        document.getElementById('totalGuests').textContent = stats.total || 0;
        document.getElementById('vvipCount').textContent = stats.vvip_count || 0;
        document.getElementById('vipCount').textContent = stats.vip_count || 0;
        document.getElementById('regularCount').textContent = stats.regular_count || 0;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Filter guests
async function filterGuests() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const categoryFilter = document.getElementById('filterCategory').value;

    try {
        const filters = {};
        if (searchTerm) filters.search = searchTerm;
        if (categoryFilter) filters.category = categoryFilter;

        const response = await guestAPI.getAll(filters);
        guests = response.data;
        renderGuestTable();
    } catch (error) {
        console.error('Error filtering guests:', error);
    }
}

// Delete guest
async function deleteGuest(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
        try {
            await guestAPI.delete(id);
            await loadGuests();
            await updateStats();
        } catch (error) {
            console.error('Error deleting guest:', error);
            alert('Gagal menghapus tamu: ' + error.message);
        }
    }
}

// Load guests from API
async function loadGuests() {
    try {
        const response = await guestAPI.getAll();
        guests = response.data;
        renderGuestTable();
    } catch (error) {
        console.error('Error loading guests:', error);
        // Show empty state on error
        guests = [];
        renderGuestTable();
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Guest Detail Drawer Functions
let currentDrawerGuest = null;

async function openGuestDrawer(id) {
    try {
        const response = await guestAPI.getById(id);
        const guest = response.data;
        currentDrawerGuest = guest;
        
        // Populate drawer
        document.getElementById('drawerGuestName').textContent = guest.name;
        document.getElementById('drawerGuestPhone').textContent = guest.phone;
        document.getElementById('drawerCategoryDisplay').innerHTML = getCategoryBadge(guest.category);
        document.getElementById('drawerCategorySelect').value = guest.category;
        
        // Attendance status
        const statusHtml = getAttendanceBadge(guest.attendance_status);
        if (guest.last_check_in) {
            const lastCheckIn = new Date(guest.last_check_in).toLocaleString('id-ID');
            document.getElementById('drawerAttendanceStatus').innerHTML = `
                ${statusHtml}
                <p style="margin-top: 10px; color: #6c757d; font-size: 14px;">
                    Terakhir check-in: ${lastCheckIn}
                </p>
            `;
        } else {
            document.getElementById('drawerAttendanceStatus').innerHTML = statusHtml;
        }
        
        // Attendance history
        const historyContainer = document.getElementById('drawerAttendanceHistory');
        if (guest.attendance_history && guest.attendance_history.length > 0) {
            historyContainer.innerHTML = guest.attendance_history.map(item => {
                const date = new Date(item.check_in_time).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                });
                return `
                    <div class="history-item">
                        <div class="history-item-date">${date}</div>
                        <div class="history-item-source">Sumber: ${item.check_in_source || '-'}</div>
                        ${item.notes ? `<div class="history-item-notes">${escapeHtml(item.notes)}</div>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            historyContainer.innerHTML = '<p class="empty-text">Belum ada riwayat check-in</p>';
        }
        
        // Show drawer
        document.getElementById('guestDrawer').classList.add('open');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error opening guest drawer:', error);
        alert('Gagal membuka detail tamu');
    }
}

function closeGuestDrawer() {
    document.getElementById('guestDrawer').classList.remove('open');
    document.body.style.overflow = '';
    currentDrawerGuest = null;
    cancelCategoryEdit();
}

function editCategory() {
    document.getElementById('drawerCategory').style.display = 'none';
    document.getElementById('drawerCategoryEdit').style.display = 'flex';
}

function cancelCategoryEdit() {
    document.getElementById('drawerCategory').style.display = 'flex';
    document.getElementById('drawerCategoryEdit').style.display = 'none';
}

async function saveCategoryEdit() {
    if (!currentDrawerGuest) return;
    
    const newCategory = document.getElementById('drawerCategorySelect').value;
    
    try {
        await guestAPI.update(currentDrawerGuest.id, {
            name: currentDrawerGuest.name,
            phone: currentDrawerGuest.phone,
            category: newCategory
        });
        
        // Reload data
        await loadGuests();
        await updateStats();
        
        // Update drawer
        currentDrawerGuest.category = newCategory;
        document.getElementById('drawerCategoryDisplay').innerHTML = getCategoryBadge(newCategory);
        cancelCategoryEdit();
    } catch (error) {
        console.error('Error updating category:', error);
        alert('Gagal mengubah kategori: ' + error.message);
    }
}

// Setup drawer close handlers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.close-drawer')?.addEventListener('click', closeGuestDrawer);
});

// Make functions globally accessible
window.openEditModal = openEditModal;
window.deleteGuest = deleteGuest;
window.openGuestDrawer = openGuestDrawer;
window.editCategory = editCategory;
window.cancelCategoryEdit = cancelCategoryEdit;
window.saveCategoryEdit = saveCategoryEdit;

// ==================== WhatsApp Functions ====================

// Load templates for bulk send
async function loadTemplates() {
    try {
        const response = await thankYouAPI.getAll();
        templates = response.data;
        updateTemplateSelect();
    } catch (error) {
        console.error('Error loading templates:', error);
        templates = [];
    }
}

// Update template select dropdown
function updateTemplateSelect() {
    const select = document.getElementById('bulkTemplate');
    const enabledTemplates = templates.filter(t => t.is_enabled);
    
    select.innerHTML = '<option value="">-- Pilih Template --</option>' +
        enabledTemplates.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
}

// Check WhatsApp connection status
async function checkWhatsAppStatus() {
    try {
        const response = await whatsappAPI.getStatus();
        const status = response.data;
        
        const indicator = document.getElementById('waStatusIndicator');
        const text = document.getElementById('waStatusText');
        const qrBtn = document.getElementById('waQRBtn');
        
        if (status.isConnected) {
            indicator.className = 'status-indicator status-connected';
            text.textContent = 'WA Terhubung';
            qrBtn.style.display = 'none';
        } else if (status.isConnecting) {
            indicator.className = 'status-indicator status-connecting';
            text.textContent = 'Menghubungkan...';
            if (status.hasQRCode) {
                qrBtn.style.display = 'inline-block';
            }
        } else {
            indicator.className = 'status-indicator status-disconnected';
            text.textContent = 'WA Terputus';
            qrBtn.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error checking WhatsApp status:', error);
    }
}

// Show QR Code modal
async function showQRCode() {
    const modal = document.getElementById('waQRModal');
    const container = document.getElementById('qrCodeContainer');
    
    modal.style.display = 'block';
    container.innerHTML = '<div class="loading">Memuat QR Code...</div>';
    
    try {
        const response = await whatsappAPI.getQRCode();
        container.innerHTML = `<img src="${response.data.qr}" alt="QR Code" style="max-width: 100%; height: auto;">`;
    } catch (error) {
        console.error('Error getting QR code:', error);
        container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Close QR modal
function closeWAQRModal() {
    document.getElementById('waQRModal').style.display = 'none';
}

// Send WhatsApp to single guest
async function sendWhatsAppToGuest(guestId) {
    if (!confirm('Kirim pesan WhatsApp ke tamu ini?')) {
        return;
    }
    
    try {
        const response = await whatsappAPI.sendToGuest(guestId, {});
        alert(`✓ Pesan berhasil dikirim ke ${response.data.guest}`);
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        alert(`✗ Gagal mengirim pesan: ${error.message}`);
    }
}

// Open bulk send modal
function openBulkWAModal() {
    const modal = document.getElementById('bulkWAModal');
    modal.style.display = 'block';
    updateBulkPreview();
}

// Close bulk send modal
function closeBulkWAModal() {
    document.getElementById('bulkWAModal').style.display = 'none';
    document.getElementById('bulkWAForm').reset();
}

// Update bulk send preview
function updateBulkPreview() {
    const templateId = document.getElementById('bulkTemplate').value;
    const previewBox = document.getElementById('bulkPreviewMessage');
    
    if (!templateId) {
        previewBox.textContent = 'Pilih template untuk melihat preview...';
        return;
    }
    
    const template = templates.find(t => t.id == templateId);
    if (template) {
        const preview = template.message_template
            .replace(/\{nama\}/g, 'Budi Santoso')
            .replace(/\{waktu_checkin\}/g, new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'full',
                timeStyle: 'short'
            }));
        previewBox.textContent = preview;
    }
}

// Handle bulk send
async function handleBulkWASend(e) {
    e.preventDefault();
    
    const category = document.getElementById('bulkCategory').value;
    const templateId = document.getElementById('bulkTemplate').value;
    
    if (!templateId) {
        alert('Silakan pilih template terlebih dahulu');
        return;
    }
    
    const categoryText = category || 'semua kategori';
    if (!confirm(`Kirim pesan WhatsApp ke semua tamu ${categoryText}?\n\nProses ini mungkin memakan waktu beberapa menit.`)) {
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
    
    try {
        const response = await whatsappAPI.sendToAll({
            templateId: parseInt(templateId),
            category: category || undefined
        });
        
        const result = response.data;
        alert(`Pengiriman selesai!\n\nTotal: ${result.total}\nBerhasil: ${result.success}\nGagal: ${result.failed}`);
        
        closeBulkWAModal();
    } catch (error) {
        console.error('Error sending bulk WhatsApp:', error);
        alert(`✗ Gagal mengirim pesan: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Make WhatsApp functions globally accessible
window.closeWAQRModal = closeWAQRModal;
window.closeBulkWAModal = closeBulkWAModal;
window.sendWhatsAppToGuest = sendWhatsAppToGuest;

// ==================== QR Code Functions ====================

// View QR code for a guest
async function viewQRCode(guestId) {
    const modal = document.getElementById('qrModal');
    const container = document.getElementById('qrCodeImage');
    const guestInfo = document.getElementById('qrGuestInfo');
    
    modal.style.display = 'block';
    container.innerHTML = '<div class="loading">Memuat QR Code...</div>';
    guestInfo.textContent = 'Loading...';
    
    try {
        const response = await qrAPI.getGuestQRCode(guestId);
        const guest = guests.find(g => g.id === guestId);
        
        container.innerHTML = `<img src="${response.data.qrCode}" alt="QR Code" style="max-width: 100%; height: auto;">`;
        guestInfo.innerHTML = `
            <strong>${escapeHtml(guest.name)}</strong><br>
            <small>${getCategoryBadge(guest.category)}</small>
        `;
        
        // Store QR data for download
        window.currentQRData = {
            qrCode: response.data.qrCode,
            guestName: guest.name
        };
    } catch (error) {
        console.error('Error getting QR code:', error);
        container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        guestInfo.textContent = '';
    }
}

// Download QR code
function downloadQRCode() {
    if (!window.currentQRData) {
        alert('No QR code to download');
        return;
    }
    
    const link = document.createElement('a');
    link.href = window.currentQRData.qrCode;
    link.download = `QR-${window.currentQRData.guestName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Close QR modal
function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
    window.currentQRData = null;
}

// Make QR functions globally accessible
window.viewQRCode = viewQRCode;
window.downloadQRCode = downloadQRCode;
window.closeQRModal = closeQRModal;
