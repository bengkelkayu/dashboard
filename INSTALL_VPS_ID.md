# 🚀 Panduan Install di VPS - Langkah demi Langkah

Panduan lengkap untuk install Wedding Guest Dashboard di VPS Anda.

## 📝 Informasi VPS Anda

```
IP: 43.134.97.90
User: root
Password: 23042015Ok$$
```

## 🎯 Metode 1: Otomatis (RECOMMENDED)

### Langkah 1: Login ke VPS

Buka terminal/CMD/PowerShell di komputer Anda, kemudian:

```bash
ssh root@43.134.97.90
```

Masukkan password: `23042015Ok$$`

### Langkah 2: Download dan Jalankan Script Deployment

```bash
# Install git dulu
apt-get update
apt-get install -y git

# Clone repository
cd /root
git clone https://github.com/bengkelkayu/dashboard.git
cd dashboard

# Jalankan script deployment
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Script akan berjalan sekitar **5-10 menit** dan otomatis install:
- ✅ Node.js v18
- ✅ PostgreSQL
- ✅ Redis
- ✅ Nginx
- ✅ PM2
- ✅ Setup database
- ✅ Start aplikasi

### Langkah 3: Selesai!

Setelah script selesai, aplikasi sudah bisa diakses di:

```
http://43.134.97.90
```

**PENTING**: Simpan password database dan webhook secret yang ditampilkan di akhir instalasi!

---

## 🎯 Metode 2: Manual (Step by Step)

Jika metode otomatis gagal, ikuti langkah manual ini:

### 1. Login ke VPS
```bash
ssh root@43.134.97.90
```

### 2. Update System
```bash
apt-get update
apt-get upgrade -y
```

### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
node --version  # Pastikan versi 18 atau lebih tinggi
```

### 4. Install PostgreSQL
```bash
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 5. Install Redis
```bash
apt-get install -y redis-server
systemctl start redis-server
systemctl enable redis-server
```

### 6. Install Nginx
```bash
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 7. Install PM2
```bash
npm install -g pm2
```

### 8. Install Git dan Clone Repository
```bash
apt-get install -y git
cd /root
git clone https://github.com/bengkelkayu/dashboard.git
cd dashboard
```

### 9. Install Dependencies Aplikasi
```bash
npm install --production
```

### 10. Setup Database PostgreSQL
```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Jalankan command ini di PostgreSQL prompt:
CREATE USER wedding_user WITH PASSWORD 'GantiPasswordIni123!@#';
CREATE DATABASE wedding_dashboard OWNER wedding_user;
GRANT ALL PRIVILEGES ON DATABASE wedding_dashboard TO wedding_user;
\q
```

### 11. Buat File .env
```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production

DATABASE_URL=postgresql://wedding_user:GantiPasswordIni123!@#@localhost:5432/wedding_dashboard
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wedding_dashboard
DB_USER=wedding_user
DB_PASSWORD=GantiPasswordIni123!@#

REDIS_URL=redis://localhost:6379
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_KEY=your_api_key_here
WEBHOOK_SECRET=gantiDenganSecretAnda
CORS_ORIGIN=*
EOF
```

**PENTING**: Ganti `GantiPasswordIni123!@#` dengan password yang kuat!

### 12. Jalankan Migrasi Database
```bash
npm run migrate
```

### 13. Konfigurasi Nginx
```bash
cat > /etc/nginx/sites-available/wedding-dashboard << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Aktifkan konfigurasi
ln -sf /etc/nginx/sites-available/wedding-dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 14. Start Aplikasi dengan PM2
```bash
cd /root/dashboard

# Start server
pm2 start backend/src/server.js --name wedding-api

# Start worker
pm2 start backend/src/workers/thankYouWorker.js --name wedding-worker

# Simpan konfigurasi PM2
pm2 save

# Auto-start saat VPS restart
pm2 startup systemd
pm2 save
```

### 15. Konfigurasi Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 16. Cek Status
```bash
pm2 status
```

### 17. Selesai!
Buka browser dan akses: `http://43.134.97.90`

---

## 🔍 Cek Apakah Sudah Jalan

### Cek Status PM2
```bash
pm2 status
```

Harusnya ada 2 process: `wedding-api` dan `wedding-worker` dengan status `online`.

### Cek Logs
```bash
pm2 logs
```

### Test Akses
Buka browser: `http://43.134.97.90`

Atau dari terminal:
```bash
curl http://localhost:3000/health
```

---

## 🛠️ Command Penting

### Lihat Status Aplikasi
```bash
pm2 status
```

### Lihat Log
```bash
# Semua log
pm2 logs

# Log API saja
pm2 logs wedding-api

# Log worker saja
pm2 logs wedding-worker
```

### Restart Aplikasi
```bash
# Restart semua
pm2 restart all

# Restart API saja
pm2 restart wedding-api
```

### Stop Aplikasi
```bash
pm2 stop all
```

### Monitoring Real-time
```bash
pm2 monit
```

---

## 🗄️ Database Management

### Masuk ke Database
```bash
psql -U wedding_user -d wedding_dashboard
```

### Query Database
```sql
-- Lihat semua tamu
SELECT * FROM guests;

-- Lihat statistik kehadiran
SELECT status, COUNT(*) FROM guest_attendance GROUP BY status;

-- Lihat pending messages
SELECT * FROM thank_you_outbox WHERE status = 'pending';
```

Keluar dari psql: ketik `\q`

### Backup Database
```bash
pg_dump -U wedding_user wedding_dashboard > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql -U wedding_user wedding_dashboard < backup_20240101.sql
```

---

## 🔄 Update Aplikasi

Jika ada update dari repository:

```bash
cd /root/dashboard
git pull origin main
npm install --production
npm run migrate
pm2 restart all
```

---

## ❌ Troubleshooting

### Aplikasi tidak bisa diakses

1. Cek status PM2:
   ```bash
   pm2 status
   ```

2. Cek log error:
   ```bash
   pm2 logs --err
   ```

3. Restart aplikasi:
   ```bash
   pm2 restart all
   ```

### Database error

1. Cek PostgreSQL berjalan:
   ```bash
   systemctl status postgresql
   ```

2. Restart PostgreSQL:
   ```bash
   systemctl restart postgresql
   ```

3. Cek koneksi database:
   ```bash
   psql -U wedding_user -d wedding_dashboard -c "SELECT 1;"
   ```

### Nginx error

1. Cek konfigurasi:
   ```bash
   nginx -t
   ```

2. Cek status:
   ```bash
   systemctl status nginx
   ```

3. Restart Nginx:
   ```bash
   systemctl restart nginx
   ```

### Port sudah digunakan

```bash
# Cari process yang pakai port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Restart PM2
pm2 restart all
```

---

## 🔐 Keamanan

### Ganti Password Root
```bash
passwd
```

### Disable Root Login SSH
Edit file: `/etc/ssh/sshd_config`
Ubah: `PermitRootLogin no`

```bash
systemctl restart sshd
```

### Setup Automated Backup

Buat file backup script:
```bash
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U wedding_user wedding_dashboard > $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup.sh
```

Tambah ke crontab (backup otomatis jam 2 pagi):
```bash
crontab -e
# Tambahkan baris ini:
0 2 * * * /root/backup.sh
```

---

## 📞 Butuh Bantuan?

Jika ada masalah:

1. Cek log: `pm2 logs`
2. Cek status: `pm2 status`
3. Restart: `pm2 restart all`
4. Lihat troubleshooting di atas

---

## ✅ Checklist Setelah Install

- [ ] Aplikasi bisa diakses di http://43.134.97.90
- [ ] PM2 status menunjukkan 2 process `online`
- [ ] Database terkoneksi dengan baik
- [ ] Simpan password database dengan aman
- [ ] Setup backup otomatis (opsional)
- [ ] Setup SSL certificate (opsional, recommended untuk production)

---

## 🎉 Selamat!

Dashboard Anda sudah live di: **http://43.134.97.90**

Untuk dokumentasi lengkap, lihat:
- [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) - Panduan deployment lengkap
- [API.md](API.md) - Dokumentasi API
- [README.md](README.md) - Overview aplikasi
