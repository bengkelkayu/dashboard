# VPS Deployment Guide

Panduan lengkap untuk deployment Wedding Guest Dashboard ke VPS Ubuntu/Debian.

## 📋 Prerequisites

- VPS dengan Ubuntu 20.04 atau lebih baru (atau Debian 10+)
- Akses SSH ke VPS
- User dengan sudo privileges
- Minimal 1GB RAM, 1 CPU Core, 10GB Storage

## 🚀 Quick Deployment

### 1. Login ke VPS

```bash
ssh root@43.134.97.90
```

Password: `23042015Ok$$`

### 2. Buat User Non-Root (Recommended)

```bash
# Buat user baru
adduser wedding

# Tambahkan ke sudo group
usermod -aG sudo wedding

# Switch ke user baru
su - wedding
```

### 3. Clone Repository

```bash
# Install git jika belum ada
sudo apt-get update
sudo apt-get install -y git

# Clone repository
git clone https://github.com/bengkelkayu/dashboard.git
cd dashboard
```

### 4. Run Deployment Script

```bash
# Buat script executable
chmod +x deploy-vps.sh

# Jalankan deployment script
./deploy-vps.sh
```

Script akan otomatis menginstall:
- ✅ Node.js v18 LTS
- ✅ PostgreSQL 12+
- ✅ Redis
- ✅ Nginx (reverse proxy)
- ✅ PM2 (process manager)
- ✅ Setup database dan migrasi
- ✅ Konfigurasi firewall

**Deployment memakan waktu 5-10 menit.**

## 🔒 Credentials & Security

### Database Credentials

Script akan generate password otomatis dan menampilkannya di akhir deployment.

**PENTING**: Simpan credentials ini dengan aman!

```
Database Name: wedding_dashboard
Database User: wedding_user
Database Password: [auto-generated - lihat output script]
Webhook Secret: [auto-generated - lihat output script]
```

### File .env

Credentials tersimpan di file `.env`:

```bash
cat .env
```

## 🌐 Akses Aplikasi

Setelah deployment selesai, aplikasi dapat diakses di:

```
http://43.134.97.90
```

## 🔧 Management dengan PM2

### View Status
```bash
pm2 status
```

### View Logs
```bash
# Semua logs
pm2 logs

# Log API server
pm2 logs wedding-api

# Log worker
pm2 logs wedding-worker
```

### Restart Services
```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart wedding-api
pm2 restart wedding-worker
```

### Stop Services
```bash
pm2 stop all
```

### Monitor Real-time
```bash
pm2 monit
```

## 🗄️ Database Management

### Connect to Database
```bash
psql -U wedding_user -d wedding_dashboard
```

### Common SQL Queries
```sql
-- View all guests
SELECT * FROM guests;

-- View attendance summary
SELECT status, COUNT(*) FROM guest_attendance GROUP BY status;

-- View pending messages
SELECT * FROM thank_you_outbox WHERE status = 'pending';

-- View recent audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Backup Database
```bash
# Create backup
pg_dump -U wedding_user wedding_dashboard > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U wedding_user wedding_dashboard < backup_20240101.sql
```

## 🔄 Update & Redeploy

### Update Application Code
```bash
cd ~/dashboard

# Pull latest changes
git pull origin main

# Install new dependencies if any
npm install --production

# Run migrations if any
npm run migrate

# Restart services
pm2 restart all
```

## 🌐 Setup Domain & SSL (Optional)

### 1. Point Domain to VPS

Di DNS provider Anda, tambahkan A record:
```
Type: A
Name: @ atau subdomain (misal: wedding)
Value: 43.134.97.90
```

### 2. Install Certbot for SSL

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 3. Update Nginx Configuration

Edit `/etc/nginx/sites-available/wedding-dashboard`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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
```

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring & Logs

### Application Logs
```bash
# PM2 logs
pm2 logs

# System logs
sudo journalctl -u nginx
sudo journalctl -u postgresql
sudo journalctl -u redis-server
```

### Resource Monitoring
```bash
# CPU & Memory
pm2 monit

# System resources
htop

# Disk usage
df -h
```

### Database Performance
```bash
# Connect to postgres
sudo -u postgres psql

# Check active connections
SELECT * FROM pg_stat_activity;

# Check database size
SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) 
FROM pg_database;
```

## 🛠️ Troubleshooting

### Application Won't Start

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs wedding-api --lines 100

# Check database connection
psql -U wedding_user -d wedding_dashboard -c "SELECT 1;"
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>

# Restart PM2
pm2 restart all
```

### Redis Not Working

```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis connection
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

## 🔐 Security Recommendations

### 1. Change Root Password
```bash
passwd
```

### 2. Disable Root SSH Login
Edit `/etc/ssh/sshd_config`:
```
PermitRootLogin no
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 3. Setup Firewall
```bash
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Regular Updates
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 5. Setup Automated Backups

Create backup script `/home/wedding/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/wedding/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U wedding_user wedding_dashboard > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
chmod +x /home/wedding/backup.sh
crontab -e

# Add this line (daily at 2 AM)
0 2 * * * /home/wedding/backup.sh
```

## 📞 Support

Jika mengalami masalah:

1. Check logs: `pm2 logs`
2. Check status: `pm2 status`
3. Check database: `psql -U wedding_user -d wedding_dashboard`
4. Restart services: `pm2 restart all`
5. Check system resources: `htop` atau `pm2 monit`

## 📚 Additional Resources

- [API Documentation](API.md)
- [Development Guide](DEVELOPMENT.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## ⚠️ Important Notes

- Default port adalah 3000 (di-proxy oleh Nginx ke port 80)
- PM2 akan auto-restart aplikasi jika crash
- PM2 akan auto-start saat VPS reboot
- Database password ter-generate secara otomatis saat deployment
- Simpan credentials dengan aman
- Setup SSL certificate untuk production
