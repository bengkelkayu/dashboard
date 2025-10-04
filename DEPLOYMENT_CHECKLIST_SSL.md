# ✅ Deployment Checklist - With SSL/HTTPS

## Prerequisites
- [ ] VPS ready and accessible
- [ ] GitHub Secrets configured (`VPS_HOST`, `VPS_PASSWORD`)
- [ ] **Domain purchased (untuk SSL dengan Let's Encrypt)** - ATAU bisa skip jika menggunakan self-signed SSL
- [ ] DNS A record pointing to VPS (jika menggunakan domain)

## Step 1: Initial Deployment (5-10 minutes)

### 1.1 Setup GitHub Secrets
```
Go to: GitHub Repo → Settings → Secrets and variables → Actions
Add:
- VPS_HOST: your_vps_ip
- VPS_PASSWORD: your_vps_password
```

### 1.2 Deploy Application
```
1. Go to: GitHub → Actions
2. Select: "Deploy to VPS (Password Auth)"
3. Click: "Run workflow"
4. Choose: deploy_type = "full"
5. Click: "Run workflow"
6. Wait: 5-10 minutes
```

### 1.3 Verify Deployment
```bash
# Test HTTP access (temporary)
curl http://YOUR_VPS_IP

# Should return HTML of the application
```

- [ ] Application accessible via HTTP
- [ ] Database created and migrated
- [ ] PM2 processes running
- [ ] Nginx configured

## Step 2: SSL/HTTPS Setup (3-5 minutes) - REQUIRED FOR CAMERA!

**Pilih salah satu:**
- **Option A**: Let's Encrypt dengan Domain (Recommended untuk Production)
- **Option B**: Self-Signed dengan IP Address (Untuk Testing)

---

### Option A: Let's Encrypt SSL (dengan Domain)

#### 2.1 Prepare Domain
```
1. Login to your domain registrar
2. Add A record:
   - Type: A
   - Name: @ (or subdomain like "wedding")
   - Value: YOUR_VPS_IP
   - TTL: Auto
3. Wait 5-10 minutes for DNS propagation
```

#### 2.2 Verify DNS
```bash
# Check if domain points to VPS
dig yourdomain.com
nslookup yourdomain.com

# Should return YOUR_VPS_IP
```

#### 2.3 Run SSL Setup Workflow
```
1. Go to: GitHub → Actions
2. Select: "Setup SSL/HTTPS Certificate"
3. Click: "Run workflow"
4. Enter:
   - domain: yourdomain.com (or wedding.yourdomain.com)
   - email: your-email@example.com
5. Click: "Run workflow"
6. Wait: 3-5 minutes
```

#### 2.4 Verify SSL
```bash
# Test HTTPS access
curl https://yourdomain.com

# Check certificate
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

- [ ] HTTPS accessible (https://yourdomain.com)
- [ ] Certificate valid and not expired
- [ ] HTTP redirects to HTTPS
- [ ] Gembok 🔒 icon in browser
- [ ] No SSL warnings

---

### Option B: Self-Signed SSL (dengan IP Address)

**Untuk testing atau jika belum punya domain**

#### 2.1 SSH ke VPS dan Generate Certificate
```bash
ssh root@YOUR_VPS_IP

# Create SSL directory
mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out /etc/nginx/ssl/selfsigned.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Wedding Dashboard/OU=IT/CN=YOUR_VPS_IP" \
  -addext "subjectAltName=IP:YOUR_VPS_IP"

# Set permissions
chmod 600 /etc/nginx/ssl/selfsigned.key
chmod 644 /etc/nginx/ssl/selfsigned.crt
```

#### 2.2 Update Nginx Configuration
```bash
# Update Nginx config for self-signed SSL
cat > /etc/nginx/sites-available/wedding-dashboard << 'EOF'
server {
    listen 80;
    server_name _;
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

# Test and restart Nginx
nginx -t
systemctl restart nginx

echo "✅ Self-signed SSL configured!"
```

#### 2.3 Verify Self-Signed SSL
```bash
# Test HTTPS access (will show certificate error - expected)
curl -k https://YOUR_VPS_IP

# Check if serving HTTPS
netstat -tlnp | grep :443
```

- [ ] HTTPS accessible at https://YOUR_VPS_IP
- [ ] Browser shows security warning (expected for self-signed)
- [ ] Can proceed past warning
- [ ] Application loads correctly

---

## Step 3: Test QR Scanner Camera (Instant)

### 3.1 Access Scanner
```
# For Let's Encrypt (Domain):
URL: https://yourdomain.com/scanner.html

# For Self-Signed (IP):
URL: https://YOUR_VPS_IP/scanner.html
(Accept security warning first)
```

### 3.2 Test Camera Access
```
1. Click "Mulai Scan" button
2. Browser asks for camera permission
3. Click "Allow"
4. Camera should open ✅
5. Point at QR code
6. Scanner detects and checks in guest ✅
```

- [ ] Scanner page loads
- [ ] Camera permission prompt appears
- [ ] Camera opens successfully
- [ ] QR code detection works
- [ ] Check-in successful
- [ ] Statistics update

### 3.3 Check Console (F12)
Expected logs:
```
Requesting camera permissions...
Camera permission granted
Available cameras: [...]
Using back camera: [name]
✓ Scanner started successfully
```

## Step 4: Verify Complete System

### 4.1 Dashboard Access
- [ ] https://yourdomain.com loads
- [ ] Guest list displays
- [ ] Add/edit/delete guests works
- [ ] Statistics accurate

### 4.2 QR Code Features
- [ ] Generate QR codes for guests
- [ ] Download QR codes
- [ ] Send QR via WhatsApp
- [ ] Scanner detects QR codes
- [ ] Check-in successful

### 4.3 WhatsApp Integration (Optional)
- [ ] WhatsApp QR auth works
- [ ] Send invitation messages
- [ ] Send thank you messages
- [ ] Bulk send works

### 4.4 SSL/Certificate
- [ ] HTTPS working
- [ ] Certificate valid
- [ ] Auto-renewal configured
- [ ] No mixed content warnings

### 4.5 System Health
```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Check PM2 processes
pm2 status

# Should show:
# - wedding-api: online
# - wedding-worker: online

# Check Nginx
systemctl status nginx

# Check certificate renewal
systemctl status certbot-renewal.timer
```

## Step 5: Optional Configuration

### 5.1 Configure WhatsApp API
```bash
ssh root@YOUR_VPS_IP
cd /root/dashboard
nano .env

# Update:
WHATSAPP_API_KEY=your_actual_api_key

pm2 restart all
```

### 5.2 Update CORS Origin
```bash
# In .env
CORS_ORIGIN=https://yourdomain.com

pm2 restart all
```

### 5.3 Setup Backups (Recommended)
```bash
# Create backup script
mkdir -p /root/backups
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U wedding_user wedding_dashboard > /root/backups/backup_${DATE}.sql
# Keep only last 7 days
find /root/backups -name "backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/backup-db.sh

# Add to crontab
crontab -e
# Add line:
0 2 * * * /root/backup-db.sh
```

## Troubleshooting

### Camera Issues

#### Camera tidak muncul
1. Check protocol: Harus HTTPS, bukan HTTP
2. Check permission: Settings → Camera → Allow
3. Check console: F12 → Console tab
4. Try different browser

#### Error "Secure context required"
- Pastikan akses via HTTPS
- Certificate harus valid
- Tidak ada mixed content

### SSL Issues

#### Domain tidak pointing
```bash
# Check DNS
dig yourdomain.com
# If wrong, update DNS A record
# Wait 5-10 minutes
```

#### Certificate gagal
```bash
# Check firewall
ufw allow 80,443/tcp

# Manual certificate
systemctl stop nginx
certbot certonly --standalone -d yourdomain.com
systemctl start nginx
```

#### Certificate expired
```bash
# Manual renewal
certbot renew --force-renewal
systemctl reload nginx
```

## Success Criteria

All these must work:
- ✅ Application accessible via HTTPS
- ✅ SSL certificate valid
- ✅ Camera opens in scanner
- ✅ QR code detection works
- ✅ Check-in successful
- ✅ No console errors
- ✅ All PM2 processes online
- ✅ Auto-renewal configured

## Post-Deployment

### Monitor
- Check PM2 status daily: `pm2 status`
- Check certificate expiry: `certbot certificates`
- Check logs: `pm2 logs`

### Maintenance
- Update dependencies: `npm update`
- Backup database: Run backup script
- Monitor disk space: `df -h`

### Support
- Issues: Check console (F12)
- Logs: `pm2 logs wedding-api`
- Documentation: See SSL_SETUP_GUIDE.md

---

## Quick Reference

### Important URLs
- Dashboard: https://yourdomain.com
- Scanner: https://yourdomain.com/scanner.html
- API: https://yourdomain.com/api
- Health: https://yourdomain.com/health

### Important Commands
```bash
# Check status
pm2 status
systemctl status nginx
certbot certificates

# Restart app
pm2 restart all

# View logs
pm2 logs wedding-api
pm2 logs wedding-worker

# Certificate renewal
certbot renew
systemctl reload nginx
```

### GitHub Actions
- Deploy: "Deploy to VPS (Password Auth)"
- SSL: "Setup SSL/HTTPS Certificate"

---

**✅ Checklist Complete = Production Ready! 🚀**

Made with ❤️ for Bengali Wedding Dashboard
