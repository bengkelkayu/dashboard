# GitHub Actions VPS Deployment

Workflow otomatis untuk deploy aplikasi Wedding Guest Dashboard ke VPS.

## 🔧 Setup GitHub Secrets

Sebelum menggunakan workflow ini, Anda perlu menambahkan secrets di GitHub repository:

### 1. Buka Repository Settings
1. Pergi ke repository: https://github.com/bengkelkayu/dashboard
2. Klik **Settings** > **Secrets and variables** > **Actions**
3. Klik **New repository secret**

### 2. Tambahkan Secrets Berikut

#### VPS_HOST
- **Name:** `VPS_HOST`
- **Value:** `43.134.97.90`

#### VPS_SSH_KEY (Recommended)
Untuk keamanan yang lebih baik, gunakan SSH key authentication:

**Cara generate SSH key:**
```bash
# Di komputer lokal Anda
ssh-keygen -t rsa -b 4096 -f ~/.ssh/vps_deploy_key -N ""

# Copy public key ke VPS
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub root@43.134.97.90
```

Kemudian di GitHub Secrets:
- **Name:** `VPS_SSH_KEY`
- **Value:** Isi file `~/.ssh/vps_deploy_key` (private key)

**ATAU**

Jika ingin menggunakan password (kurang aman):
Anda bisa memodifikasi workflow untuk menggunakan `sshpass` dengan password secret, tapi ini tidak direkomendasikan untuk production.

## 🚀 Cara Menggunakan Workflow

### Metode 1: Via GitHub Web Interface

1. Buka repository: https://github.com/bengkelkayu/dashboard
2. Klik tab **Actions**
3. Pilih workflow **Deploy to VPS**
4. Klik **Run workflow**
5. Pilih deployment type:
   - **full**: Install semua dependencies + deploy aplikasi
   - **app-only**: Deploy aplikasi saja (dependencies sudah terinstall)
   - **setup-only**: Install dependencies saja (tidak deploy aplikasi)
6. Klik **Run workflow**

### Metode 2: Via GitHub CLI

```bash
# Install GitHub CLI jika belum
# https://cli.github.com/

# Login
gh auth login

# Trigger deployment
gh workflow run "Deploy to VPS" \
  --repo bengkelkayu/dashboard \
  --ref main \
  -f deploy_type=full
```

## 📋 Deployment Types

### Full Deployment (`full`)
Deploy lengkap dari awal. Workflow akan:
- ✅ Update sistem
- ✅ Install Node.js v18
- ✅ Install PostgreSQL
- ✅ Install Redis
- ✅ Install Nginx
- ✅ Install PM2
- ✅ Clone/update aplikasi
- ✅ Setup database
- ✅ Run migrations
- ✅ Configure Nginx
- ✅ Start aplikasi dengan PM2

**Kapan digunakan:** 
- First-time deployment
- Setelah VPS direstart/rebuild
- Ada perubahan di system dependencies

### App Only Deployment (`app-only`)
Deploy aplikasi saja. Workflow akan:
- ✅ Clone/update aplikasi
- ✅ Install npm dependencies
- ✅ Run migrations
- ✅ Restart PM2 processes

**Kapan digunakan:**
- Update kode aplikasi
- Bug fixes
- Feature updates
- Dependencies sudah terinstall

### Setup Only (`setup-only`)
Install dependencies saja, tidak deploy aplikasi.

**Kapan digunakan:**
- Setup fresh VPS
- Update system packages
- Install/update dependencies

## 🔍 Monitoring Deployment

### Via GitHub Actions UI
1. Buka tab **Actions**
2. Klik workflow run yang sedang berjalan
3. Lihat logs real-time

### Via SSH ke VPS
```bash
ssh root@43.134.97.90

# Check PM2 status
pm2 status

# View logs
pm2 logs

# Check specific service
systemctl status nginx
systemctl status postgresql
systemctl status redis-server
```

## ✅ Verifikasi Deployment

Setelah workflow selesai:

1. **Cek aplikasi di browser:**
   ```
   http://43.134.97.90
   ```

2. **Cek PM2 status:**
   ```bash
   ssh root@43.134.97.90
   pm2 status
   ```

3. **Cek logs:**
   ```bash
   pm2 logs wedding-api
   pm2 logs wedding-worker
   ```

## 🆘 Troubleshooting

### Workflow Gagal: SSH Connection Error
**Solusi:**
1. Pastikan `VPS_SSH_KEY` secret sudah di-setup dengan benar
2. Pastikan public key sudah ada di VPS (`~/.ssh/authorized_keys`)
3. Coba SSH manual: `ssh -i ~/.ssh/vps_deploy_key root@43.134.97.90`

### Database Already Exists Error
**Normal!** Workflow akan skip database creation jika sudah ada.

### PM2 Process Already Running
**Normal!** Workflow akan restart process yang sudah ada.

### Nginx Configuration Error
**Cek:**
```bash
ssh root@43.134.97.90
nginx -t  # Test configuration
systemctl status nginx
```

## 🔐 Security Best Practices

### 1. Gunakan SSH Key (bukan password)
✅ Sudah di-setup di workflow ini

### 2. Ganti Password Root VPS
```bash
ssh root@43.134.97.90
passwd  # Set password baru
```

### 3. Disable Root Login (Optional)
```bash
# Edit SSH config
nano /etc/ssh/sshd_config
# Ubah: PermitRootLogin no

# Restart SSH
systemctl restart sshd
```

### 4. Setup Firewall
✅ Sudah otomatis di-setup oleh workflow (UFW)

### 5. Regular Backups
Setup automated backup di VPS:
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
# Add line: 0 2 * * * /root/backup.sh
```

## 📊 Workflow Features

### ✅ Automated
- Tidak perlu login manual ke VPS
- Tidak perlu jalankan command satu per satu
- Semua otomatis dengan satu klik

### ✅ Idempotent
- Aman dijalankan berulang kali
- Skip instalasi jika sudah ada
- Update otomatis jika sudah ada

### ✅ Safe
- Menggunakan SSH key authentication
- Credentials tersimpan aman di GitHub Secrets
- Tidak ada credentials di code

### ✅ Flexible
- 3 deployment types (full/app-only/setup-only)
- Bisa pilih sesuai kebutuhan
- Hemat waktu

## 📞 Support

Jika ada masalah:
1. Cek logs di GitHub Actions
2. SSH ke VPS dan cek logs: `pm2 logs`
3. Validasi deployment: `./validate-deployment.sh`
4. Check service status: `systemctl status <service>`

## 🎯 Next Steps

Setelah deployment berhasil:

1. **Configure Domain & SSL** (Optional)
   ```bash
   # Install certbot
   apt-get install -y certbot python3-certbot-nginx
   
   # Get SSL certificate
   certbot --nginx -d yourdomain.com
   ```

2. **Configure WhatsApp API**
   Edit `.env` di VPS:
   ```bash
   nano /root/dashboard/.env
   # Update WHATSAPP_API_KEY
   pm2 restart all
   ```

3. **Setup Monitoring** (Optional)
   - UptimeRobot
   - Pingdom
   - New Relic
   - Datadog

4. **Configure Automated Backups** (Lihat section Security Best Practices)

## 📝 Changelog

### Version 1.0.0
- ✅ Initial workflow
- ✅ Full deployment support
- ✅ App-only deployment
- ✅ Setup-only deployment
- ✅ SSH key authentication
- ✅ Automated verification
- ✅ Complete error handling
