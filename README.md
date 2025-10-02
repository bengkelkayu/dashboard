# Wedding Guest Dashboard

Full-stack monolithic dashboard untuk mengelola daftar tamu undangan pernikahan dengan sistem kategorisasi VVIP, VIP, dan Regular, dilengkapi dengan tracking kehadiran dan auto thank you message.

## 🚀 Cara Penggunaan

### Prasyarat
- Node.js (v14 atau lebih tinggi)
- PostgreSQL (v12 atau lebih tinggi)
- Redis (opsional, untuk queue worker)

### Quick Start

```bash
# Clone repository
git clone https://github.com/bengkelkayu/dashboard.git
cd dashboard

# Run setup script (Linux/Mac)
chmod +x setup.sh
./setup.sh

# Or manually install
npm install
cp .env.example .env
# Edit .env with your database configuration
npm run migrate
npm run seed  # Optional: seed sample data
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Instalasi Manual

Untuk instruksi instalasi lengkap, lihat [DEVELOPMENT.md](DEVELOPMENT.md)

### Dokumentasi API

Untuk dokumentasi lengkap API endpoints, lihat [API.md](API.md)

## ✨ Fitur

### 1. Tabel Daftar Tamu
- Menampilkan daftar lengkap tamu dengan nomor urut
- Badge kategori dengan icon:
  - 👑 **VVIP** - Badge emas
  - ⭐ **VIP** - Badge perak
  - 👤 **Regular** - Badge perunggu
- Tombol Edit dan Hapus untuk setiap tamu

### 2. Form Modal Tambah/Edit Tamu
- Modal form untuk menambah tamu baru
- Edit tamu yang sudah ada dengan data yang terisi otomatis
- Field form:
  - **Nama Tamu** (wajib, minimal 3 karakter)
  - **Nomor WhatsApp** (wajib, harus dimulai dengan 62, 11-15 digit)
  - **Kategori** (dropdown: VVIP/VIP/Regular)
- Validasi real-time dengan pesan error
- Tombol Simpan dan Batal

### 3. Pencarian & Filter
- Cari berdasarkan nama atau nomor WhatsApp
- Filter berdasarkan kategori (VVIP/VIP/Regular)
- Bisa menggunakan pencarian dan filter secara bersamaan

### 4. Dashboard Statistik
- Total jumlah tamu
- Jumlah tamu VVIP
- Jumlah tamu VIP
- Jumlah tamu Regular
- Otomatis update saat tambah/edit/hapus

### 5. Penyimpanan Data
- Data tersimpan di PostgreSQL database
- Persistent dan scalable
- Support untuk concurrent access

### 6. Attendance Tracking
- Badge status kehadiran (Presence/Not Presence) otomatis
- Riwayat check-in untuk setiap tamu
- Webhook integration dengan Digital Guestbook
- Summary kehadiran real-time

### 7. Auto Thank You Message
- Template pesan terima kasih dengan placeholder {nama}, {waktu_checkin}
- Enable/disable template
- Queue system untuk pengiriman
- Retry mechanism untuk failed messages
- Preview template sebelum digunakan

### 8. Observability & Logging
- Audit log untuk semua perubahan data penting
- HTTP request logging
- Error tracking
- Metrics kehadiran dan pengiriman pesan

## 📋 Validasi Form

- **Nama**: Wajib diisi, minimal 3 karakter
- **Nomor WhatsApp**: 
  - Wajib diisi
  - Harus dimulai dengan "62" (kode negara Indonesia)
  - Hanya berisi angka
  - Panjang 11-15 digit
  - Contoh: 628123456789
- **Kategori**: Wajib dipilih (VVIP/VIP/Regular)

## 🎨 Teknologi

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Bull** - Queue management untuk async tasks
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend
- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan gradient dan animasi
- **JavaScript (ES6+ Modules)** - Logika aplikasi dan API integration

### Database Schema
- **guests** - Data tamu (nama, nomor WhatsApp, kategori)
- **guest_attendance** - Record kehadiran tamu
- **thank_you_templates** - Template pesan terima kasih
- **thank_you_outbox** - Queue pengiriman pesan
- **audit_logs** - Log untuk audit dan observability

## 📱 Responsive Design

Dashboard responsive dan dapat diakses dari berbagai ukuran layar:
- Desktop
- Tablet
- Mobile

## 🔧 Struktur File

```
dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi database dan environment
│   │   ├── controllers/     # Business logic untuk setiap endpoint
│   │   ├── middleware/      # Express middleware (validasi, error handling)
│   │   ├── models/          # Database models dan query functions
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic services
│   │   ├── workers/         # Background workers (thank you worker)
│   │   └── server.js        # Entry point aplikasi
│   └── migrations/          # Database migration scripts
├── public/                  # Static frontend files
│   ├── index.html          # Struktur HTML utama
│   ├── styles.css          # Styling dan animasi
│   ├── app.js              # Logika aplikasi frontend
│   └── api-client.js       # API client untuk komunikasi dengan backend
├── package.json
├── .env.example
└── README.md
```

## 💡 Tips Penggunaan

1. **Menambah Tamu**: Klik tombol "+ Tambah Tamu" di pojok kanan atas
2. **Edit Tamu**: Klik tombol "Edit" pada baris tamu yang ingin diubah
3. **Hapus Tamu**: Klik tombol "Hapus" (akan muncul konfirmasi)
4. **Filter**: Gunakan dropdown "Semua Kategori" untuk filter berdasarkan kategori
5. **Cari**: Ketik nama atau nomor WhatsApp di kotak pencarian

## 📞 Format Nomor WhatsApp

Nomor WhatsApp harus dalam format internasional Indonesia:
- Dimulai dengan `62` (tanpa +)
- Contoh: `628123456789` untuk nomor 0812-3456-789

## 🎯 Fitur Keamanan

- XSS Protection: Input di-escape untuk mencegah XSS attack
- Validasi input yang ketat dengan express-validator
- Helmet.js untuk security headers
- CORS configuration
- Webhook signature verification
- SQL injection protection dengan parameterized queries

## 📡 API Endpoints

### Guests API
- `GET /api/guests` - Ambil semua data tamu (support filter & search)
- `GET /api/guests/:id` - Ambil detail tamu termasuk riwayat kehadiran
- `GET /api/guests/stats` - Statistik jumlah tamu per kategori
- `POST /api/guests` - Tambah tamu baru
- `PATCH /api/guests/:id` - Update data tamu
- `DELETE /api/guests/:id` - Hapus tamu

### Attendance API
- `GET /api/attendance` - Ambil semua record kehadiran
- `GET /api/attendance/summary` - Summary kehadiran
- `POST /api/attendance` - Record check-in baru
- `PATCH /api/attendance/:id/status` - Update status kehadiran

### Thank You Templates API
- `GET /api/thank-you` - Ambil semua template
- `GET /api/thank-you/:id` - Ambil detail template
- `POST /api/thank-you` - Buat template baru
- `PATCH /api/thank-you/:id` - Update template
- `DELETE /api/thank-you/:id` - Hapus template
- `PATCH /api/thank-you/:id/toggle` - Enable/disable template
- `POST /api/thank-you/preview` - Preview template dengan sample data

### Webhook API
- `POST /api/webhook/checkin` - Receive check-in event dari Digital Guestbook