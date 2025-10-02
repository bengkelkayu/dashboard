# 🚀 Quick Setup Guide - GitHub Actions Deployment

Panduan singkat setup GitHub Actions untuk auto-deploy ke VPS.

## ⚡ Setup Cepat (5 Menit)

### Step 1: Tambahkan Secrets di GitHub

1. Buka: https://github.com/bengkelkayu/dashboard/settings/secrets/actions
2. Klik **New repository secret**
3. Tambahkan 2 secrets berikut:

#### Secret 1: VPS_HOST
```
Name: VPS_HOST
Value: 43.134.97.90
```

#### Secret 2: VPS_PASSWORD
```
Name: VPS_PASSWORD
Value: 23042015Ok$$
```

### Step 2: Trigger Deployment

1. Buka: https://github.com/bengkelkayu/dashboard/actions
2. Pilih workflow: **Deploy to VPS (Password Auth)**
3. Klik **Run workflow**
4. Pilih **full** untuk deployment pertama kali
5. Klik **Run workflow**
6. Tunggu 5-10 menit

### Step 3: Akses Aplikasi

Buka browser:
```
http://43.134.97.90
```

## ✅ Done!

Aplikasi sudah live dan running!

---

## 📋 Deployment Options

### First Time / Fresh Install
- Pilih: **full**
- Akan install semua (Node.js, PostgreSQL, Redis, Nginx, PM2) + deploy aplikasi

### Update Aplikasi
- Pilih: **app-only**
- Hanya update kode aplikasi, restart services

### Install Dependencies Only
- Pilih: **setup-only**
- Install/update system dependencies saja

---

## 🔍 Monitoring

### Via GitHub
- Buka tab Actions
- Lihat logs real-time

### Via VPS
```bash
ssh root@43.134.97.90

# Check status
pm2 status

# View logs
pm2 logs

# Check services
systemctl status nginx
systemctl status postgresql
systemctl status redis-server
```

---

## 🆘 Troubleshooting

### Jika Workflow Gagal

1. **Pastikan secrets sudah benar:**
   - VPS_HOST = 43.134.97.90
   - VPS_PASSWORD = 23042015Ok$$

2. **Pastikan VPS bisa diakses:**
   ```bash
   ssh root@43.134.97.90
   # Masukkan password: 23042015Ok$$
   ```

3. **Cek logs di GitHub Actions** untuk error details

### Jika Aplikasi Tidak Bisa Diakses

```bash
# SSH ke VPS
ssh root@43.134.97.90

# Check PM2
pm2 status
pm2 logs

# Restart if needed
pm2 restart all

# Check Nginx
systemctl status nginx
nginx -t
```

---

## 🔐 Security Recommendations

**PENTING:** Setelah deployment berhasil, untuk keamanan lebih baik:

### 1. Ganti Password Root
```bash
ssh root@43.134.97.90
passwd  # Set password baru yang lebih kuat
```

### 2. Update Secret di GitHub
Setelah ganti password, update secret `VPS_PASSWORD` di GitHub dengan password baru.

### 3. (Optional) Setup SSH Key
Untuk keamanan maksimal, gunakan SSH key authentication:
```bash
# Generate SSH key di komputer lokal
ssh-keygen -t rsa -b 4096 -f ~/.ssh/vps_deploy_key

# Copy ke VPS
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub root@43.134.97.90

# Update GitHub secret VPS_SSH_KEY dengan isi file private key
cat ~/.ssh/vps_deploy_key
```

Kemudian gunakan workflow: **Deploy to VPS** (bukan yang Password Auth)

---

## 📞 Need Help?

1. Check workflow logs di GitHub Actions
2. SSH ke VPS dan check logs: `pm2 logs`
3. Run validation: `cd /root/dashboard && ./validate-deployment.sh`

---

## 🎯 What Gets Installed?

Workflow akan install:
- ✅ Node.js v18 LTS
- ✅ PostgreSQL (database)
- ✅ Redis (queue/cache)
- ✅ Nginx (web server)
- ✅ PM2 (process manager)
- ✅ Wedding Dashboard aplikasi

Dan akan configure:
- ✅ Database setup
- ✅ Nginx reverse proxy
- ✅ PM2 auto-start on boot
- ✅ Firewall (UFW)

---

## 📝 Next Steps After Deployment

### 1. Configure WhatsApp API (Optional)
```bash
ssh root@43.134.97.90
cd /root/dashboard
nano .env
# Update WHATSAPP_API_KEY dengan key Anda
pm2 restart all
```

### 2. Setup Domain & SSL (Optional)
```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Update .env
nano /root/dashboard/.env
# Update CORS_ORIGIN dengan domain Anda
pm2 restart all
```

### 3. Setup Backup (Recommended)
```bash
# Create backup script
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U wedding_user wedding_dashboard > $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup.sh
```

---

## 🎉 Success!

Sekarang Anda bisa:
- ✅ Deploy dengan 1 klik di GitHub
- ✅ Update aplikasi otomatis
- ✅ Monitor via PM2
- ✅ Scale dengan mudah

**Happy coding! 🚀**
