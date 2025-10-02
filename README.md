# Wedding Guest Dashboard

Dashboard untuk mengelola daftar tamu undangan pernikahan dengan sistem kategorisasi VVIP, VIP, dan Regular.

## 🚀 Cara Penggunaan

1. Buka file `index.html` di browser web Anda
2. Tidak perlu instalasi atau build - menggunakan vanilla JavaScript murni

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
- Data tersimpan di localStorage browser
- Data tidak hilang saat refresh halaman
- Sudah ada contoh data untuk demo

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

- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan gradient dan animasi
- **JavaScript (Vanilla)** - Logika aplikasi dan manipulasi DOM
- **localStorage** - Penyimpanan data lokal

## 📱 Responsive Design

Dashboard responsive dan dapat diakses dari berbagai ukuran layar:
- Desktop
- Tablet
- Mobile

## 🔧 Struktur File

```
dashboard/
├── index.html    # Struktur HTML utama
├── styles.css    # Styling dan animasi
├── app.js        # Logika aplikasi JavaScript
└── README.md     # Dokumentasi
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
- Validasi input yang ketat
- Konfirmasi sebelum menghapus data