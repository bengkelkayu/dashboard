# Wedding Guest Dashboard

Full-stack monolithic dashboard untuk mengelola daftar tamu undangan pernikahan dengan sistem kategorisasi VVIP, VIP, dan Regular, dilengkapi dengan tracking kehadiran dan auto thank you message.

## 🚀 Cara Penggunaan

### 🌐 Deploy ke VPS (Production)

#### Option 1: GitHub Actions (RECOMMENDED ⚡)

Deploy otomatis dengan 1 klik via GitHub Actions dengan **schema verification** otomatis:

1. Setup GitHub Secrets (sekali saja):
   - `VPS_HOST`: IP server VPS Anda
   - `VPS_PASSWORD`: Password VPS Anda
   
2. Buka tab **Actions** di GitHub
3. Pilih workflow **Deploy to VPS (Password Auth)**
4. Klik **Run workflow** > pilih **full** > klik **Run workflow**
5. Tunggu 5-10 menit, aplikasi langsung live! 🎉

**✨ NEW: Workflow Enhancement v2.0**
- ✅ Automatic database schema verification
- ✅ QR code functionality testing
- ✅ Migration error detection
- ✅ Detailed deployment status
- ✅ Idempotent migrations (can run multiple times safely)

**🔐 IMPORTANT: SSL/HTTPS for QR Scanner**
- ⚠️ **QR Scanner requires HTTPS** to access camera (browser security requirement)
- ✅ **Two Options for SSL:**
  - **Let's Encrypt** (with domain - recommended for production) - automated via GitHub Actions
  - **Self-Signed** (with IP address - for testing/development) - 5 minute setup
- 📖 **Setup Guides**: 
  - [SSL_SETUP_GUIDE.md](SSL_SETUP_GUIDE.md) - Complete SSL guide (both options)
  - [SSL_IP_QUICK_GUIDE.md](SSL_IP_QUICK_GUIDE.md) - Quick guide for IP-based SSL
- 🎯 **Why needed**: Modern browsers block camera access on non-HTTPS sites

**📖 Panduan lengkap:** 
- [WORKFLOW_QUICK_START.md](WORKFLOW_QUICK_START.md) - **Quick start guide** ⚡
- [SSL_SETUP_GUIDE.md](SSL_SETUP_GUIDE.md) - **Complete SSL/HTTPS setup guide** 🔐
- [SSL_IP_QUICK_GUIDE.md](SSL_IP_QUICK_GUIDE.md) - **SSL untuk IP address (tanpa domain)** 🚀
- [WORKFLOW_ENHANCEMENTS.md](WORKFLOW_ENHANCEMENTS.md) - Technical details
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - Initial setup

#### Option 2: Manual SSH Deployment

**PANDUAN LENGKAP BAHASA INDONESIA**: Lihat [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md)

Deploy otomatis ke VPS Ubuntu/Debian dengan satu command:

```bash
# Login ke VPS
ssh root@your-vps-ip

# Clone dan deploy
cd /root && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

Script akan otomatis install:
- ✅ Node.js v18 LTS
- ✅ PostgreSQL 12+
- ✅ Redis
- ✅ Nginx (reverse proxy)
- ✅ PM2 (process manager)

Dokumentasi deployment:
- 🚀 [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - **GitHub Actions deployment (RECOMMENDED)**
- 📖 [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) - Panduan lengkap Bahasa Indonesia
- 📖 [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) - VPS deployment guide
- 📖 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference

### 💻 Development Setup (Local)

#### Prasyarat
- Node.js (v14 atau lebih tinggi)
- PostgreSQL (v12 atau lebih tinggi)
- Redis (opsional, untuk queue worker)

#### Quick Start

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

### 📚 Dokumentasi

- 🚀 [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - **GitHub Actions deployment (RECOMMENDED)**
- 🔐 [SSL_SETUP_GUIDE.md](SSL_SETUP_GUIDE.md) - **Complete SSL/HTTPS setup guide**
- 🚀 [SSL_IP_QUICK_GUIDE.md](SSL_IP_QUICK_GUIDE.md) - **SSL untuk IP address (tanpa domain)**
- 🚀 [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) - Panduan install VPS (Bahasa Indonesia)
- 📖 [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) - VPS deployment guide
- 🔧 [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- 🗄️ [MIGRATION_SYSTEM.md](MIGRATION_SYSTEM.md) - Database migration system
- 📡 [API.md](API.md) - API documentation
- ⚡ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick command reference

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
- Queue system untuk pengiriman via Baileys.js WhatsApp
- Retry mechanism untuk failed messages
- Preview template sebelum digunakan
- Improved modal UI dengan dokumentasi placeholder yang jelas

### 8. WhatsApp Integration (Baileys.js)
- **QR Code Authentication** - Scan QR code untuk menghubungkan WhatsApp
- **Connection Status** - Real-time status koneksi WhatsApp di dashboard
- **Send to Individual Guest** - Tombol "📤 WA" di setiap baris tamu
- **Bulk Send** - Kirim pesan WhatsApp ke semua tamu sekaligus
- **Category Filter** - Filter tamu berdasarkan kategori saat bulk send
- **Template Selection** - Pilih template pesan yang akan dikirim
- **Auto Thank You** - Otomatis kirim pesan terima kasih saat tamu check-in

### 9. QR Code Scanner 📱
- **Camera Access** - Akses kamera device untuk scan QR code
- **Real-time Scanning** - Deteksi QR code secara real-time
- **Auto Check-in** - Otomatis check-in tamu saat QR code di-scan
- **Success/Error Feedback** - Visual feedback dengan animasi
- **Statistics** - Tracking jumlah scan berhasil dan error
- **⚠️ HTTPS Required** - Camera access memerlukan HTTPS/SSL untuk security

### 10. SSL/HTTPS Support 🔐
- **Automated SSL Setup** - Setup Let's Encrypt certificate via GitHub Actions
- **Auto Renewal** - Certificate auto-renew sebelum expired
- **Secure Context** - Enable camera access untuk QR scanner
- **Production Ready** - Best practices SSL configuration
- **📖 Setup Guide** - See [SSL_SETUP_GUIDE.md](SSL_SETUP_GUIDE.md)

### 11. Observability & Logging
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
- **Baileys.js** (@whiskeysockets/baileys) - WhatsApp Web API untuk mengirim pesan

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
- **schema_migrations** - Migration tracking (auto-managed)

### Database Migrations

The project uses an idempotent migration system that tracks applied migrations:

```bash
npm run migrate        # Apply pending migrations
npm run verify-schema  # Verify database schema
```

**Key Features:**
- ✅ Safe to run multiple times - skips already applied migrations
- ✅ Automatic tracking via `schema_migrations` table
- ✅ No "trigger already exists" errors
- ✅ Works with both fresh and existing databases

See [MIGRATION_SYSTEM.md](MIGRATION_SYSTEM.md) for detailed documentation.

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

### WhatsApp API (Baileys.js)
- `GET /api/whatsapp/status` - Get WhatsApp connection status
- `GET /api/whatsapp/qr` - Get QR code for authentication
- `POST /api/whatsapp/initialize` - Initialize WhatsApp connection
- `POST /api/whatsapp/send/:guestId` - Send message to a single guest
- `POST /api/whatsapp/send-all` - Send message to all guests (bulk)
- `POST /api/whatsapp/disconnect` - Disconnect WhatsApp

### Webhook API
- `POST /api/webhook/checkin` - Receive check-in event dari Digital Guestbook