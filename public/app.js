// Import API client
import { guestAPI, attendanceAPI } from './api-client.js';

// Guest data storage
let guests = [];
let editingId = null;

// Load data from API on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadGuests();
    await updateStats();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add guest button
    document.getElementById('addGuestBtn').addEventListener('click', openAddModal);

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
                <td colspan="6">
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
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(guest.name)}</td>
                <td>${escapeHtml(guest.phone)}</td>
                <td>${getCategoryBadge(guest.category)}</td>
                <td>${attendanceBadge}</td>
                <td>
                    <button class="btn btn-edit" onclick="openEditModal(${guest.id})">Edit</button>
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

// Make functions globally accessible
window.openEditModal = openEditModal;
window.deleteGuest = deleteGuest;
