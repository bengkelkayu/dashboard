# 🚀 Setup Lengkap untuk Domain lovejourney.cloud

## 📝 Panduan Setup One-Click

Workflow ini sudah dikonfigurasi khusus untuk domain **lovejourney.cloud** dengan email **rahul.ok63@gmail.com**.

### ✨ Apa yang Akan Di-setup Otomatis?

Workflow ini akan menginstall dan mengkonfigurasi **SEMUA** yang diperlukan:

1. ✅ **System Dependencies**
   - Node.js v20
   - PostgreSQL (database)
   - Redis (cache/queue)
   - Nginx (web server)
   - PM2 (process manager)
   - Git

2. ✅ **Database Configuration**
   - Membuat database `wedding_dashboard`
   - Membuat user dengan password aman
   - Menjalankan migrations

3. ✅ **Application Deployment**
   - Clone repository dari GitHub
   - Install dependencies
   - Setup environment variables
   - Start aplikasi dengan PM2

4. ✅ **Nginx Web Server**
   - Configure reverse proxy
   - Setup untuk domain lovejourney.cloud
   - Configure security headers

5. ✅ **SSL/HTTPS Certificate**
   - Install Let's Encrypt certificate
   - Configure HTTPS dengan security terbaik
   - Setup auto-renewal (certificate valid 90 hari, auto-renew setiap 60 hari)

6. ✅ **Firewall Configuration**
   - Allow port 22 (SSH)
   - Allow port 80 (HTTP)
   - Allow port 443 (HTTPS)

---

## 📋 Prerequisites (Yang Harus Disiapkan Dulu)

### 1. GitHub Secrets

Anda harus setup GitHub Secrets terlebih dahulu:

**Cara setup GitHub Secrets:**
1. Buka: https://github.com/bengkelkayu/dashboard/settings/secrets/actions
2. Klik: **New repository secret**
3. Tambahkan secrets berikut:

| Secret Name | Value | Deskripsi |
|------------|-------|-----------|
| `VPS_HOST` | `43.134.97.90` (atau IP VPS Anda) | IP address VPS |
| `VPS_PASSWORD` | Password root VPS Anda | Password untuk login ke VPS |

### 2. DNS Configuration

**PENTING:** Domain harus sudah pointing ke VPS sebelum menjalankan workflow!

**Langkah-langkah setup DNS:**

1. **Login ke provider domain Anda** (tempat Anda beli domain lovejourney.cloud)
   - Contoh: Namecheap, GoDaddy, Cloudflare, dll

2. **Masuk ke DNS Management / DNS Settings**

3. **Tambahkan A Record untuk root domain:**
   ```
   Type: A
   Name: @
   Value: 43.134.97.90 (IP VPS Anda)
   TTL: Auto atau 3600
   ```

4. **Tambahkan A Record untuk www subdomain:**
   ```
   Type: A
   Name: www
   Value: 43.134.97.90 (IP VPS Anda)
   TTL: Auto atau 3600
   ```

5. **Simpan perubahan**

6. **Tunggu DNS propagation** (5-10 menit, kadang bisa sampai 1 jam)

7. **Verifikasi DNS sudah pointing:**
   ```bash
   # Di terminal/command prompt
   ping lovejourney.cloud
   # Harusnya muncul IP: 43.134.97.90
   
   # Atau pakai nslookup
   nslookup lovejourney.cloud
   ```

---

## 🚀 Cara Menjalankan Workflow

Setelah GitHub Secrets dan DNS sudah di-setup:

### Step 1: Buka GitHub Actions

1. Buka: https://github.com/bengkelkayu/dashboard/actions
2. Di sidebar kiri, pilih: **Setup lovejourney.cloud Domain (One-Click)**

### Step 2: Run Workflow

1. Klik tombol: **Run workflow** (button hijau di kanan atas)
2. Pastikan branch: **main** terpilih
3. Pada field "confirm_setup", ketik: **yes**
4. Klik: **Run workflow**

### Step 3: Tunggu Proses Selesai

Workflow akan berjalan sekitar **5-10 menit**.

Anda bisa melihat progress di halaman GitHub Actions:
- ✅ Green checkmark = Success
- 🔴 Red X = Failed (cek logs untuk detail error)

### Step 4: Verifikasi

Setelah workflow selesai dengan sukses:

1. **Akses domain Anda:**
   ```
   https://lovejourney.cloud
   ```

2. **Cek SSL Certificate:**
   - Harus ada ikon gembok 🔒 di address bar browser
   - Klik gembok untuk lihat detail certificate
   - Certificate dari: Let's Encrypt

3. **Test QR Scanner:**
   - Buka: https://lovejourney.cloud/scanner.html
   - Klik "Mulai Scan"
   - Browser akan minta izin akses kamera
   - Izinkan akses kamera
   - QR Scanner harus berfungsi! ✅

---

## 📊 Apa yang Terjadi di Setiap Step?

### Step 1: System Setup & Dependencies ⏱️ ~2-3 menit
- Update system packages
- Install Node.js v20
- Install PostgreSQL database
- Install Redis
- Install Nginx web server
- Install PM2 process manager
- Install Git

### Step 2: Deploy Application ⏱️ ~1-2 menit
- Clone repository dari GitHub
- Install npm dependencies
- Setup database dan user
- Create environment configuration
- Run database migrations

### Step 3: Configure Nginx ⏱️ ~30 detik
- Create Nginx config untuk domain
- Enable site configuration
- Reload Nginx

### Step 4: Start Application ⏱️ ~30 detik
- Start API server dengan PM2
- Start background worker dengan PM2
- Enable PM2 startup on boot

### Step 5: Configure Firewall ⏱️ ~30 detik
- Allow SSH (port 22)
- Allow HTTP (port 80)
- Allow HTTPS (port 443)

### Step 6: Verify DNS Configuration ⏱️ ~10 detik
- Check apakah domain sudah pointing ke VPS
- Jika belum, workflow akan stop dengan pesan error

### Step 7: Setup SSL/HTTPS ⏱️ ~2-3 menit
- Install Certbot
- Request SSL certificate dari Let's Encrypt
- Update Nginx configuration untuk HTTPS
- Setup HTTP to HTTPS redirect
- Configure SSL auto-renewal
- Restart application

### Step 8: Final Verification ⏱️ ~15 detik
- Test HTTPS connection
- Verify SSL certificate
- Display certificate details

---

## ❌ Troubleshooting

### Error: "Domain does not point to VPS"

**Penyebab:** DNS belum di-setup atau belum propagate.

**Solusi:**
1. Cek DNS configuration di domain provider Anda
2. Pastikan A record sudah benar: `@ → 43.134.97.90`
3. Tunggu 5-10 menit untuk DNS propagation
4. Cek dengan `ping lovejourney.cloud`
5. Jalankan workflow lagi setelah DNS propagate

---

### Error: "Failed to obtain SSL certificate"

**Kemungkinan penyebab:**

1. **Port 80/443 tidak terbuka:**
   ```bash
   # SSH ke VPS
   ssh root@43.134.97.90
   
   # Check firewall
   ufw status
   
   # Allow ports jika belum
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

2. **Rate limit Let's Encrypt:**
   - Let's Encrypt memiliki limit: 5 certificate/minggu per domain
   - Jika sudah hit limit, tunggu 1 minggu
   - Atau gunakan domain berbeda untuk test

3. **Domain DNS belum propagate penuh:**
   - Tunggu lebih lama (bisa sampai 1-2 jam)
   - Test dengan: `dig lovejourney.cloud`

---

### Error: "Connection timed out" saat SSH

**Penyebab:** VPS tidak accessible atau credentials salah.

**Solusi:**
1. Cek VPS bisa diakses:
   ```bash
   ping 43.134.97.90
   ```

2. Cek GitHub Secret `VPS_HOST` dan `VPS_PASSWORD` sudah benar

3. Test SSH manual:
   ```bash
   ssh root@43.134.97.90
   ```

---

### Website tidak bisa diakses setelah setup

**Langkah troubleshooting:**

1. **Cek PM2 process running:**
   ```bash
   ssh root@43.134.97.90
   pm2 status
   
   # Harus ada 2 process:
   # - wedding-api (online)
   # - wedding-worker (online)
   ```

2. **Cek Nginx status:**
   ```bash
   systemctl status nginx
   # Harus: active (running)
   ```

3. **Cek application logs:**
   ```bash
   pm2 logs wedding-api
   ```

4. **Cek Nginx logs:**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

5. **Restart jika perlu:**
   ```bash
   pm2 restart all
   systemctl restart nginx
   ```

---

## 🔄 Menjalankan Ulang Workflow

Jika workflow gagal atau ada masalah, Anda bisa **jalankan ulang** workflow:

1. Buka GitHub Actions
2. Pilih workflow yang gagal
3. Klik **Re-run failed jobs** atau **Re-run all jobs**

Workflow dirancang **idempotent**, artinya aman dijalankan berkali-kali. Tidak akan duplicate data atau configuration.

---

## 📝 Manual Commands (Jika Diperlukan)

### Check Status Aplikasi
```bash
ssh root@43.134.97.90

# PM2 status
pm2 status

# PM2 logs
pm2 logs

# Nginx status
systemctl status nginx

# Database status
systemctl status postgresql

# Redis status
systemctl status redis-server
```

### Check SSL Certificate
```bash
ssh root@43.134.97.90

# List certificates
certbot certificates

# Test renewal
certbot renew --dry-run
```

### Restart Services
```bash
ssh root@43.134.97.90

# Restart aplikasi
pm2 restart all

# Restart Nginx
systemctl restart nginx

# Restart database (hati-hati!)
systemctl restart postgresql
```

---

## 🔐 Security Best Practices

Workflow ini sudah include security best practices:

1. ✅ **HTTPS Only** - HTTP auto-redirect ke HTTPS
2. ✅ **Strong SSL** - TLS 1.2 dan 1.3 only
3. ✅ **Security Headers:**
   - HSTS (Strict-Transport-Security)
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection
4. ✅ **Firewall** - Only allow necessary ports
5. ✅ **SSL Auto-Renewal** - Certificate tidak akan expire
6. ✅ **Database Password** - Random generated 32-char password

---

## 📞 Support

Jika ada masalah atau pertanyaan:

1. **Check workflow logs** di GitHub Actions untuk detail error
2. **SSH ke VPS** untuk check status services
3. **Open issue** di GitHub repository
4. **Contact support** untuk bantuan lebih lanjut

---

## 🎯 Next Steps Setelah Setup

1. ✅ **Akses dashboard:** https://lovejourney.cloud
2. ✅ **Setup admin account** (jika belum)
3. ✅ **Upload foto-foto wedding**
4. ✅ **Configure WhatsApp integration** (optional)
5. ✅ **Test QR Scanner** di berbagai device
6. ✅ **Share link ke guests!** 🎉

---

## 🔄 Update Aplikasi

Untuk update aplikasi di masa depan:

**Option 1: Auto-deploy on push (sudah enabled)**
- Push code ke branch `main`
- Workflow "Deploy to VPS" akan auto-run
- Aplikasi akan auto-update

**Option 2: Manual deploy**
```bash
ssh root@43.134.97.90
cd /root/dashboard
git pull origin main
npm install --production
npm run migrate
pm2 restart all
```

---

## 🎉 Selamat!

Setup lovejourney.cloud sudah complete! 🎊

Website Anda sekarang:
- ✅ Live di https://lovejourney.cloud
- ✅ SSL/HTTPS enabled dengan security terbaik
- ✅ QR Scanner berfungsi dengan camera access
- ✅ Auto-renewal SSL certificate
- ✅ Production-ready!

**Enjoy your wedding dashboard!** 💒💕

---

Made with ❤️ for Bengali Wedding Dashboard
