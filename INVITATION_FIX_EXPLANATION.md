# Penjelasan Perbaikan: Kirim Undangan dengan QR Code

## Masalah yang Dilaporkan
"Saya mau send wa nya ngirim wedding link dan kata katanya dan qr attendance bukan thank you nya, tapi message dan link dan image qr nya tapi gagal generate"

## Masalah yang Ditemukan

### 1. **Pesan Tidak Sesuai untuk Undangan**
Pesan sebelumnya terdengar seperti "terima kasih" bukan undangan:
```
Halo {nama}! 🎉

Berikut adalah QR Code untuk absensi acara kami.

Undangan digital: {link}

Silakan tunjukkan QR Code ini saat check-in.
Terima kasih! 🙏
```

**Masalah**: Diakhiri dengan "Terima kasih!" yang tidak cocok untuk undangan.

### 2. **Error Handling Kurang Lengkap**
Jika terjadi error saat generate QR code atau kirim WhatsApp, pesan error kurang detail untuk debugging.

## Perbaikan yang Dilakukan

### 1. **Pesan Undangan yang Lebih Baik**
```
Halo {nama}! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Undangan digital: {link}

Terlampir QR Code untuk absensi. Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏
```

**Perbaikan**:
- ✅ Dimulai dengan "Kami mengundang Anda" (pesan undangan yang jelas)
- ✅ Link undangan ditampilkan dengan jelas
- ✅ Penjelasan QR Code untuk absensi
- ✅ Diakhiri dengan "Ditunggu kehadirannya!" bukan "Terima kasih!"

### 2. **Error Handling dan Logging yang Lebih Baik**
- ✅ Logging detail di setiap langkah (generate QR, kirim WhatsApp)
- ✅ Error message yang lebih spesifik
- ✅ Try-catch untuk menangkap error di QR generation dan WhatsApp sending
- ✅ Log semua error dengan detail lengkap untuk debugging

## Cara Menggunakan

1. **Pastikan WhatsApp Terhubung**
   - Buka dashboard di browser
   - Cek status WhatsApp (hijau = terhubung)
   - Jika belum terhubung, klik "Scan QR" dan scan dengan WhatsApp

2. **Tambah/Edit Tamu**
   - Isi nama, nomor HP (format: 628xxx)
   - Isi kategori (VVIP/VIP/Regular)
   - **Penting**: Isi "Link Undangan Digital" (contoh: https://yoursite.com/undangan/nama-tamu)
   - Simpan

3. **Kirim Undangan dengan QR Code**
   - Klik nama tamu untuk buka detail
   - Klik tombol "📱 Kirim QR & Link Undangan"
   - Konfirmasi pengiriman
   - Tamu akan menerima:
     * Pesan undangan
     * Link undangan digital
     * QR Code (sebagai gambar)

## Jika Masih Ada Error

Dengan logging yang baru, sekarang akan lebih mudah untuk debug. Error akan terlihat di console dengan detail:
- Guest ID dan nama
- Langkah mana yang error (generate QR / kirim WhatsApp)
- Error message lengkap
- Stack trace

Cek log server untuk melihat detail error yang spesifik.

## Format Pesan

**Jika ada invitation_link:**
```
Halo John Doe! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Undangan digital: https://example.com/invite/john

Terlampir QR Code untuk absensi. Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏
```

**Jika tidak ada invitation_link:**
```
Halo John Doe! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

Terlampir QR Code untuk absensi. Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏
```

## Catatan Penting

1. **QR Code untuk Absensi**: QR Code yang dikirim digunakan untuk check-in/absensi di acara. Saat di-scan, akan otomatis mencatat kehadiran tamu.

2. **Link Undangan Opsional**: Jika tidak ada link undangan digital, pesan tetap akan dikirim dengan QR Code saja.

3. **Pesan Custom**: Bisa menggunakan custom message sendiri dengan mengirim parameter `customMessage` melalui API.

4. **Thank You vs Invitation**: 
   - **Invitation Message** (ini): Dikirim SEBELUM acara, berisi undangan + QR Code
   - **Thank You Message**: Dikirim SETELAH check-in, berisi terima kasih sudah hadir

## File yang Diubah

- `backend/src/controllers/whatsappController.js` - Pesan dan error handling
- `backend/src/controllers/qrController.js` - Logging QR generation
- `.gitignore` - Tambah file test
