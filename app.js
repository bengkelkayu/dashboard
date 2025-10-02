// Guest data storage
let guests = [];
let editingId = null;

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadGuestsFromStorage();
    renderGuestTable();
    updateStats();
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
function handleFormSubmit(e) {
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

    if (editingId) {
        // Update existing guest
        const guestIndex = guests.findIndex(g => g.id === editingId);
        if (guestIndex !== -1) {
            guests[guestIndex] = {
                ...guests[guestIndex],
                name,
                phone,
                category
            };
        }
    } else {
        // Add new guest
        const newGuest = {
            id: Date.now(),
            name,
            phone,
            category
        };
        guests.push(newGuest);
    }

    saveGuestsToStorage();
    renderGuestTable();
    updateStats();
    closeModal();
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
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-state-icon">👥</div>
                        <div class="empty-state-text">Belum ada data tamu. Klik "Tambah Tamu" untuk menambahkan.</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = guestsToRender.map((guest, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(guest.name)}</td>
            <td>${escapeHtml(guest.phone)}</td>
            <td>${getCategoryBadge(guest.category)}</td>
            <td>
                <button class="btn btn-edit" onclick="openEditModal(${guest.id})">Edit</button>
                <button class="btn btn-delete" onclick="deleteGuest(${guest.id})">Hapus</button>
            </td>
        </tr>
    `).join('');
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

// Update statistics
function updateStats() {
    document.getElementById('totalGuests').textContent = guests.length;
    document.getElementById('vvipCount').textContent = guests.filter(g => g.category === 'VVIP').length;
    document.getElementById('vipCount').textContent = guests.filter(g => g.category === 'VIP').length;
    document.getElementById('regularCount').textContent = guests.filter(g => g.category === 'Regular').length;
}

// Filter guests
function filterGuests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('filterCategory').value;

    let filtered = guests;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(guest => 
            guest.name.toLowerCase().includes(searchTerm) ||
            guest.phone.includes(searchTerm)
        );
    }

    // Apply category filter
    if (categoryFilter) {
        filtered = filtered.filter(guest => guest.category === categoryFilter);
    }

    renderGuestTable(filtered);
}

// Delete guest
function deleteGuest(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tamu ini?')) {
        guests = guests.filter(g => g.id !== id);
        saveGuestsToStorage();
        renderGuestTable();
        updateStats();
        
        // If currently filtering, reapply filters
        const searchTerm = document.getElementById('searchInput').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        if (searchTerm || categoryFilter) {
            filterGuests();
        }
    }
}

// LocalStorage functions
function saveGuestsToStorage() {
    localStorage.setItem('weddingGuests', JSON.stringify(guests));
}

function loadGuestsFromStorage() {
    const stored = localStorage.getItem('weddingGuests');
    if (stored) {
        guests = JSON.parse(stored);
    } else {
        // Add sample data for demonstration
        guests = [
            {
                id: 1,
                name: 'Budi Santoso',
                phone: '6281234567890',
                category: 'VVIP'
            },
            {
                id: 2,
                name: 'Siti Nurhaliza',
                phone: '6282345678901',
                category: 'VIP'
            },
            {
                id: 3,
                name: 'Ahmad Rizki',
                phone: '6283456789012',
                category: 'Regular'
            }
        ];
        saveGuestsToStorage();
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
