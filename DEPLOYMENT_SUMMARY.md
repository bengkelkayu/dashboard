# 📦 VPS Deployment Package - Summary

Paket lengkap untuk deployment Wedding Guest Dashboard ke VPS dengan IP: **43.134.97.90**

---

## 🎯 Quick Start (Pilih Salah Satu)

### Option 1: Otomatis - One Command (TERCEPAT ⚡)
```bash
ssh root@43.134.97.90 "cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh"
```

### Option 2: Login Dulu, Lalu Deploy
```bash
# Login
ssh root@43.134.97.90

# Deploy
cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

**Waktu deployment: 5-10 menit**

Setelah selesai, buka browser: **http://43.134.97.90**

---

## 📚 Dokumentasi Lengkap

Kami telah menyiapkan dokumentasi lengkap dalam Bahasa Indonesia dan English:

### 🇮🇩 Bahasa Indonesia
1. **[INSTALL_VPS_ID.md](INSTALL_VPS_ID.md)** - Panduan lengkap step-by-step (MULAI DI SINI)
   - Metode otomatis dan manual
   - Troubleshooting lengkap
   - Command-command penting
   
2. **[ONE_LINER_INSTALL.md](ONE_LINER_INSTALL.md)** - Command cepat copy-paste
   - One-liner installation
   - Quick commands
   - Emergency commands

3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Reference cepat untuk daily management
   - PM2 commands
   - Database commands
   - Troubleshooting commands

### 🇬🇧 English
1. **[DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md)** - Complete VPS deployment guide
   - Prerequisites
   - Deployment process
   - Post-deployment tasks
   - Security recommendations

2. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
   - Pre-deployment checks
   - Deployment steps
   - Validation tests
   - Production readiness

---

## 🛠️ Scripts Yang Tersedia

### 1. `deploy-vps.sh` (Main Deployment Script)
Script utama untuk install semua dependencies dan setup aplikasi otomatis.

**Apa yang diinstall:**
- ✅ Node.js v18 LTS
- ✅ PostgreSQL 12+
- ✅ Redis Server
- ✅ Nginx (reverse proxy)
- ✅ PM2 Process Manager
- ✅ Database setup & migrations
- ✅ Application configuration
- ✅ Firewall configuration

**Cara pakai:**
```bash
cd /root/dashboard
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### 2. `manual-deploy.sh` (Manual Step-by-Step)
Script dengan command manual untuk deployment step-by-step.

**Cara pakai:**
Copy-paste command satu per satu dari file ini.

### 3. `validate-deployment.sh` (Validation Script)
Script untuk validasi deployment setelah selesai.

**Cara pakai:**
```bash
cd /root/dashboard
chmod +x validate-deployment.sh
./validate-deployment.sh
```

**Output:** Report lengkap status deployment (passed/failed)

---

## 🎓 Tutorial Lengkap

### Untuk Pemula (Tidak Familiar dengan Linux)

1. **Download PuTTY** (Windows) atau buka Terminal (Mac/Linux)

2. **Login ke VPS:**
   - Host: 43.134.97.90
   - Username: root
   - Password: 23042015Ok$$

3. **Copy-paste command ini:**
   ```bash
   cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
   ```

4. **Tunggu 5-10 menit** hingga selesai

5. **Simpan credentials** yang ditampilkan di akhir

6. **Buka browser:** http://43.134.97.90

**SELESAI!** 🎉

### Untuk Advanced Users

Lihat dokumentasi lengkap di:
- [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) - Technical guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Complete checklist

---

## ✅ Apa Yang Akan Terjadi

### Saat Deployment (5-10 menit)
1. ⏳ Update system packages
2. ⏳ Install Node.js v18
3. ⏳ Install PostgreSQL database
4. ⏳ Install Redis cache
5. ⏳ Install Nginx web server
6. ⏳ Install PM2 process manager
7. ⏳ Setup database & user
8. ⏳ Install application dependencies
9. ⏳ Run database migrations
10. ⏳ Configure Nginx reverse proxy
11. ⏳ Start application dengan PM2
12. ⏳ Configure firewall
13. ✅ **SELESAI!**

### Setelah Deployment
- ✅ Aplikasi running di port 3000
- ✅ Nginx reverse proxy di port 80
- ✅ Database PostgreSQL ready
- ✅ Redis ready
- ✅ PM2 auto-restart jika crash
- ✅ Auto-start saat VPS reboot
- ✅ Firewall configured

### Akses Aplikasi
- 🌐 Browser: **http://43.134.97.90**
- 📡 API: **http://43.134.97.90/api**
- 🔍 Health: **http://43.134.97.90/health**

---

## 🔐 Credentials & Security

### Yang Akan Digenerate Otomatis
1. **Database Password** - Password random untuk user database
2. **Webhook Secret** - Secret key untuk webhook verification

**PENTING:** Script akan menampilkan credentials ini di akhir. **SIMPAN DENGAN BAIK!**

### Lokasi File .env
```bash
/root/dashboard/.env
```

### Cara Lihat Credentials
```bash
cat /root/dashboard/.env
```

---

## 📊 Management Commands

### Daily Operations

**Cek Status:**
```bash
pm2 status
```

**Lihat Logs:**
```bash
pm2 logs
```

**Restart:**
```bash
pm2 restart all
```

**Monitor:**
```bash
pm2 monit
```

### Database

**Connect:**
```bash
psql -U wedding_user -d wedding_dashboard
```

**Backup:**
```bash
pg_dump -U wedding_user wedding_dashboard > backup.sql
```

### Update Application

**Pull update dari GitHub:**
```bash
cd /root/dashboard
git pull origin main
npm install --production
npm run migrate
pm2 restart all
```

---

## 🆘 Troubleshooting

### Aplikasi Tidak Bisa Diakses

```bash
# Cek status
pm2 status

# Cek logs
pm2 logs --err

# Restart
pm2 restart all
systemctl restart nginx
```

### Database Error

```bash
# Cek PostgreSQL
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Test koneksi
psql -U wedding_user -d wedding_dashboard -c "SELECT 1;"
```

### Validation

```bash
# Run validation script
cd /root/dashboard
./validate-deployment.sh
```

**Lihat:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md) untuk lebih banyak troubleshooting commands.

---

## 🚀 Next Steps (Opsional)

### 1. Setup Domain Name
- Point domain A record ke: 43.134.97.90
- Update `CORS_ORIGIN` di `.env`
- Restart: `pm2 restart all`

### 2. Install SSL Certificate (HTTPS)
```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Auto-renewal sudah configured otomatis
```

### 3. Configure WhatsApp API
Edit `.env`:
```bash
WHATSAPP_API_URL=https://your-whatsapp-api.com
WHATSAPP_API_KEY=your_actual_api_key
```

Restart:
```bash
pm2 restart all
```

---

## 📞 Support & Help

### Dokumentasi
- 📖 [README.md](README.md) - Overview aplikasi
- 🔧 [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- 📡 [API.md](API.md) - API documentation
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

### Quick Reference
- ⚡ [ONE_LINER_INSTALL.md](ONE_LINER_INSTALL.md) - One-liner commands
- 📝 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Daily commands
- ✅ [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment checklist

### Repository
- 🔗 GitHub: https://github.com/bengkelkayu/dashboard
- 🐛 Issues: https://github.com/bengkelkayu/dashboard/issues

---

## 📋 File Structure

```
dashboard/
├── deploy-vps.sh              # 🔧 Main deployment script
├── manual-deploy.sh           # 📝 Manual deployment commands
├── validate-deployment.sh     # ✅ Validation script
├── INSTALL_VPS_ID.md         # 🇮🇩 Panduan Lengkap (Indonesia)
├── DEPLOYMENT_VPS.md         # 🇬🇧 Deployment Guide (English)
├── ONE_LINER_INSTALL.md      # ⚡ Quick install commands
├── QUICK_REFERENCE.md        # 📚 Command reference
├── DEPLOYMENT_CHECKLIST.md   # ✅ Deployment checklist
├── DEPLOYMENT_SUMMARY.md     # 📦 This file
├── README.md                 # 📖 Application overview
├── DEVELOPMENT.md            # 🔧 Development guide
├── API.md                    # 📡 API documentation
├── backend/                  # 💻 Backend code
│   ├── src/                  # Source code
│   └── migrations/           # Database migrations
└── public/                   # 🎨 Frontend files
```

---

## ✨ Features

### Dashboard Features
- 📊 Daftar tamu dengan kategori (VVIP, VIP, Regular)
- ✅ Tracking kehadiran real-time
- 💌 Auto thank you message via WhatsApp
- 📱 Template pesan yang customizable
- 📈 Statistik kehadiran
- 🔍 Search & filter tamu
- 📝 Audit logs untuk semua aktivitas

### Technical Features
- 🚀 Node.js + Express backend
- 🗄️ PostgreSQL database
- 📦 Redis cache (optional)
- 🔄 Background worker untuk async tasks
- 🔒 Security dengan Helmet
- 📊 Request logging dengan Morgan
- ✅ Input validation
- 🔐 CORS configured
- 📱 Responsive design

---

## 🎯 Deployment Summary

| Item | Status | Details |
|------|--------|---------|
| **VPS IP** | ✅ Ready | 43.134.97.90 |
| **Scripts** | ✅ Ready | deploy-vps.sh, manual-deploy.sh, validate-deployment.sh |
| **Docs (ID)** | ✅ Ready | INSTALL_VPS_ID.md, ONE_LINER_INSTALL.md, QUICK_REFERENCE.md |
| **Docs (EN)** | ✅ Ready | DEPLOYMENT_VPS.md, DEPLOYMENT_CHECKLIST.md |
| **Automation** | ✅ Full | One-command deployment |
| **Validation** | ✅ Included | validate-deployment.sh |
| **Time** | ⏱️ 5-10 min | Automated installation |

---

## 🎉 Ready to Deploy!

Semua files dan documentation sudah ready untuk deployment ke VPS Anda.

**Next step:** Jalankan command deployment di VPS Anda!

```bash
ssh root@43.134.97.90
cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

**Good luck! 🚀**

---

**Package Version:** 1.0.0  
**Created:** 2024  
**Repository:** https://github.com/bengkelkayu/dashboard  
**VPS IP:** 43.134.97.90  
