# 🚀 Workflow Auto Deploy - Panduan Lengkap

Workflow ini akan **otomatis mengkonfigurasi semua** yang dibutuhkan untuk expose API dan web aplikasi secara public via VPS host.

## 🎯 Yang Akan Dikonfigurasi Otomatis

Ketika workflow dijalankan, semua ini akan otomatis ter-setup:

### 1️⃣ **System Dependencies**
- ✅ Node.js v20 (runtime aplikasi)
- ✅ PostgreSQL (database)
- ✅ Redis (queue/cache)
- ✅ Nginx (web server & reverse proxy)
- ✅ PM2 (process manager)
- ✅ Git (version control)

### 2️⃣ **Database Configuration**
- ✅ Membuat database `wedding_dashboard`
- ✅ Membuat user `wedding_user` dengan password random yang aman
- ✅ Setup permissions database
- ✅ Membuat file `.env` dengan konfigurasi lengkap

### 3️⃣ **Nginx Configuration**
- ✅ Setup reverse proxy untuk expose aplikasi di port 80
- ✅ Konfigurasi proxy headers yang benar
- ✅ Upload file size limit 10MB
- ✅ WebSocket support untuk real-time features

### 4️⃣ **Firewall Configuration**
- ✅ Allow port 22 (SSH)
- ✅ Allow port 80 (HTTP)
- ✅ Allow port 443 (HTTPS untuk SSL nanti)
- ✅ Enable UFW firewall

### 5️⃣ **Application Deployment**
- ✅ Clone/update repository dari GitHub
- ✅ Install dependencies
- ✅ Run database migrations
- ✅ Start aplikasi dengan PM2
- ✅ Setup auto-restart saat VPS reboot

### 6️⃣ **Public Access**
- ✅ Aplikasi bisa diakses public via: `http://[VPS_IP]`
- ✅ API endpoints tersedia public
- ✅ Web dashboard bisa diakses dari browser

## 🚀 Cara Menjalankan Workflow

### Option 1: Via GitHub Web Interface (Recommended)

1. **Buka GitHub Actions**
   ```
   https://github.com/bengkelkayu/dashboard/actions
   ```

2. **Pilih Workflow**
   - Klik workflow: **"Deploy to VPS (Password Auth)"**

3. **Run Workflow**
   - Klik tombol **"Run workflow"**
   - Pilih deployment type:
     - **full** - Deploy lengkap (pertama kali atau fresh install)
     - **app-only** - Update aplikasi saja (sudah pernah deploy sebelumnya)
     - **setup-only** - Install system dependencies saja
   - Klik **"Run workflow"** lagi

4. **Tunggu Proses Selesai**
   - Workflow akan berjalan sekitar 5-10 menit
   - Bisa lihat progress real-time di tab Actions
   - Status akan berubah hijau ✅ jika berhasil

### Option 2: Otomatis Saat Push ke Main Branch

Workflow akan otomatis berjalan setiap kali ada push ke branch `main`:

```bash
git push origin main
```

Workflow akan auto-trigger dengan mode **full deployment**.

## 📊 Hasil Deployment

Setelah workflow selesai, berikut yang sudah ready:

### ✅ Aplikasi Public & Accessible

**URL Aplikasi:**
```
http://43.134.97.90
```

**API Endpoints:**
```
http://43.134.97.90/api/guests
http://43.134.97.90/api/attendance
http://43.134.97.90/api/templates
http://43.134.97.90/api/whatsapp
```

### ✅ Services Running

- **wedding-api** - Backend API server (port 3000)
- **wedding-worker** - Background worker untuk WhatsApp
- **Nginx** - Web server reverse proxy (port 80)
- **PostgreSQL** - Database server
- **Redis** - Queue & cache server

### ✅ Auto Configuration

- Database credentials tersimpan di `/root/dashboard/.env`
- PM2 auto-start saat VPS reboot
- Nginx sudah dikonfigurasi sebagai reverse proxy
- Firewall sudah allow traffic HTTP/HTTPS

## 🔧 Monitoring & Troubleshooting

### Check Status

SSH ke VPS:
```bash
ssh root@43.134.97.90
```

Check PM2 status:
```bash
pm2 status
```

View logs:
```bash
pm2 logs
```

Check Nginx:
```bash
systemctl status nginx
nginx -t
```

### Restart Services

Restart aplikasi:
```bash
pm2 restart all
```

Restart Nginx:
```bash
systemctl restart nginx
```

## 🔐 Security Notes

### Database Password

Database password di-generate secara random dan aman. Bisa dilihat di workflow logs atau di file `.env`:

```bash
ssh root@43.134.97.90
cat /root/dashboard/.env | grep DB_PASSWORD
```

### Webhook Secret

Webhook secret juga di-generate random untuk keamanan:

```bash
cat /root/dashboard/.env | grep WEBHOOK_SECRET
```

### Firewall

Firewall sudah dikonfigurasi otomatis hanya allow:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

## 📝 Next Steps

### 1. Test Aplikasi

Buka browser dan akses:
```
http://43.134.97.90
```

### 2. Test API

Test dengan curl:
```bash
curl http://43.134.97.90/api/guests
```

### 3. Configure WhatsApp (Optional)

Edit `.env` dan update WhatsApp API key:
```bash
ssh root@43.134.97.90
cd /root/dashboard
nano .env
# Update WHATSAPP_API_KEY
pm2 restart all
```

### 4. Setup Domain & SSL (Optional)

Jika ingin pakai domain sendiri dan HTTPS:

1. Point domain ke IP VPS: `43.134.97.90`

2. Install SSL certificate:
   ```bash
   ssh root@43.134.97.90
   apt-get install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```

3. Update Nginx config dengan domain

## ✨ Kesimpulan

Dengan workflow ini, **semua konfigurasi sudah otomatis**:

✅ Tidak perlu install dependencies manual  
✅ Tidak perlu konfigurasi Nginx manual  
✅ Tidak perlu setup database manual  
✅ Tidak perlu konfigurasi firewall manual  
✅ Langsung bisa diakses public via HTTP  

**Tinggal run workflow, tunggu selesai, aplikasi langsung live!** 🚀
