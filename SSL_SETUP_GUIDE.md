# 🔐 SSL/HTTPS Setup Guide

## Mengapa SSL/HTTPS Diperlukan?

**PENTING untuk QR Scanner!** 📱

Browser modern (Chrome, Firefox, Safari, Edge) **memerlukan HTTPS** untuk mengakses kamera perangkat. Tanpa HTTPS:
- ❌ Kamera tidak akan bisa dibuka
- ❌ QR Scanner tidak akan berfungsi
- ❌ User akan mendapat error "secure context required"

Dengan HTTPS:
- ✅ Kamera dapat diakses dengan aman
- ✅ QR Scanner berfungsi normal
- ✅ Data terenkripsi dan aman
- ✅ User percaya dengan website Anda

---

## 📋 Prerequisites

Sebelum setup SSL, Anda perlu:

1. **Domain Name** - Anda harus punya domain (beli dari:)
   - Namecheap: https://www.namecheap.com
   - GoDaddy: https://www.godaddy.com
   - Cloudflare: https://www.cloudflare.com
   - Atau provider lainnya

2. **Domain sudah pointing ke VPS**
   ```
   DNS Record:
   Type: A
   Name: @ (or subdomain like 'wedding')
   Value: 43.134.97.90  (IP VPS Anda)
   TTL: Auto
   ```

3. **VPS sudah terinstall aplikasi** (sudah deploy dengan workflow)

---

## 🚀 Cara Setup SSL (3 Pilihan)

### Pilihan 1: Automated Setup via GitHub Actions (PALING MUDAH) ⭐

1. **Pastikan domain sudah pointing ke VPS:**
   ```bash
   # Test apakah domain sudah pointing
   ping yourdomain.com
   # Harusnya muncul IP: 43.134.97.90
   ```

2. **Jalankan Workflow:**
   - Buka: https://github.com/bengkelkayu/dashboard/actions
   - Pilih: **Setup SSL/HTTPS Certificate**
   - Klik: **Run workflow**
   - Isi:
     - `domain`: yourdomain.com (atau wedding.yourdomain.com)
     - `email`: your-email@example.com
   - Klik: **Run workflow**
   - Tunggu 3-5 menit

3. **Done!** 🎉
   - Akses: https://yourdomain.com
   - QR Scanner akan berfungsi!

---

### Pilihan 2: Via Main Deployment Workflow

Saat deploy aplikasi, tambahkan SSL setup:

1. **Buka GitHub Actions:**
   - https://github.com/bengkelkayu/dashboard/actions
   - Pilih: **Deploy to VPS (Password Auth)**
   - Klik: **Run workflow**

2. **Isi Form:**
   - `deploy_type`: full (atau app-only)
   - `setup_ssl`: yes
   - `ssl_domain`: yourdomain.com
   - `ssl_email`: your-email@example.com

3. **Klik Run workflow**

SSL akan di-setup otomatis setelah deployment!

---

### Pilihan 3: Manual Setup via SSH

Jika Anda prefer manual setup:

```bash
# 1. Login ke VPS
ssh root@43.134.97.90

# 2. Install Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# 3. Stop Nginx sementara
systemctl stop nginx

# 4. Dapatkan SSL Certificate
certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com \
  -d yourdomain.com

# 5. Update Nginx Config
nano /etc/nginx/sites-available/wedding-dashboard
```

Ganti isi file dengan:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main application
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;

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
```

```bash
# 6. Test & Start Nginx
nginx -t
systemctl start nginx

# 7. Setup Auto-renewal
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
echo "#!/bin/bash" > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
echo "systemctl reload nginx" >> /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# 8. Test renewal
certbot renew --dry-run

# 9. Update .env
cd /root/dashboard
nano .env
# Ubah: CORS_ORIGIN=https://yourdomain.com

# 10. Restart aplikasi
pm2 restart all
```

---

## ✅ Verifikasi SSL Berhasil

### Test 1: Akses via Browser
```
Buka: https://yourdomain.com
```
- ✅ Harus ada ikon gembok di address bar
- ✅ Tidak ada warning "Not Secure"

### Test 2: Test SSL Rating
```
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```
Target: Grade A atau A+

### Test 3: Test QR Scanner
```
https://yourdomain.com/scanner.html
```
- ✅ Klik "Mulai Scan"
- ✅ Browser harus minta izin akses kamera
- ✅ Kamera harus bisa terbuka
- ✅ QR Scanner harus berfungsi

---

## 🔄 SSL Certificate Auto-Renewal

Certificate dari Let's Encrypt valid **90 hari**.

Auto-renewal sudah di-setup dan akan:
- ✅ Cek setiap hari apakah certificate perlu di-renew
- ✅ Auto-renew 30 hari sebelum expire
- ✅ Auto-reload Nginx setelah renewal

### Manual Renewal (jika diperlukan)
```bash
ssh root@43.134.97.90
certbot renew
systemctl reload nginx
```

### Check Status Certificate
```bash
ssh root@43.134.97.90
certbot certificates
```

---

## 🐛 Troubleshooting

### Error: "Domain does not point to VPS"

**Solusi:**
1. Check DNS:
   ```bash
   dig yourdomain.com
   nslookup yourdomain.com
   ```
2. Pastikan A record pointing ke `43.134.97.90`
3. Tunggu DNS propagation (5-10 menit)
4. Coba lagi

---

### Error: "Failed to obtain SSL certificate"

**Kemungkinan penyebab:**
1. Port 80 tidak terbuka
   ```bash
   ssh root@43.134.97.90
   ufw status
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

2. Nginx masih running
   ```bash
   systemctl stop nginx
   # Lalu coba lagi certbot
   ```

3. Rate limit Let's Encrypt (max 5 kali/minggu per domain)
   - Tunggu 1 minggu
   - Atau gunakan staging mode dulu untuk test

---

### Error: "Kamera masih tidak bisa dibuka"

**Check:**
1. Pastikan akses via HTTPS (bukan HTTP)
2. Clear browser cache
3. Check browser console (F12)
4. Test dengan browser berbeda
5. Pastikan izin kamera enabled di browser

**Browser Permission:**
- Chrome: Klik ikon 🔒 di address bar > Site Settings > Camera > Allow
- Firefox: Klik ikon 🔒 > Permissions > Camera > Allow
- Safari: Safari > Preferences > Websites > Camera > Allow

---

### Error: "Certificate expired"

Auto-renewal gagal. Manual renewal:
```bash
ssh root@43.134.97.90
certbot renew --force-renewal
systemctl reload nginx
```

---

## 📊 SSL Security Best Practices

### 1. Force HTTPS
✅ Sudah di-configure - semua HTTP redirect ke HTTPS

### 2. Security Headers
✅ HSTS (HTTP Strict Transport Security) enabled
✅ X-Frame-Options enabled
✅ X-Content-Type-Options enabled

### 3. Strong Ciphers
✅ TLS 1.2 dan 1.3 only
✅ Strong cipher suites

### 4. Certificate Monitoring
- Check expiry: https://www.sslshopper.com/ssl-checker.html
- Email notifications from Let's Encrypt

---

## 🔗 Links & Resources

### Domain Registrars (Beli Domain)
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com  
- Cloudflare: https://www.cloudflare.com
- Niagahoster: https://www.niagahoster.co.id (Indonesia)
- Rumahweb: https://www.rumahweb.com (Indonesia)

### SSL Testing Tools
- SSL Labs: https://www.ssllabs.com/ssltest/
- SSL Checker: https://www.sslshopper.com/ssl-checker.html
- Why No Padlock: https://www.whynopadlock.com/

### Let's Encrypt
- Website: https://letsencrypt.org/
- Documentation: https://letsencrypt.org/docs/
- Rate Limits: https://letsencrypt.org/docs/rate-limits/

---

## ❓ FAQ

### Q: Berapa lama SSL setup?
A: 3-5 menit jika domain sudah pointing ke VPS.

### Q: Apakah SSL gratis?
A: Ya! Let's Encrypt 100% gratis, selamanya.

### Q: Berapa lama certificate valid?
A: 90 hari, tapi auto-renew 30 hari sebelum expire.

### Q: Apakah harus punya domain?
A: Ya, SSL certificate butuh domain. Tidak bisa pakai IP address saja.

### Q: Bisa pakai subdomain?
A: Ya! Misal: wedding.example.com

### Q: Wildcard certificate (*.example.com)?
A: Ya, tapi butuh DNS validation. Gunakan:
```bash
certbot certonly --manual --preferred-challenges dns -d "*.example.com"
```

### Q: Bisakah tanpa domain?
A: Tidak untuk production. Browser butuh domain untuk SSL. Tapi untuk development di localhost tidak perlu SSL.

---

## 📱 Camera/QR Scanner Issues

Setelah SSL di-setup, jika kamera masih tidak bisa:

### 1. Check Protocol
- ❌ http://yourdomain.com/scanner.html
- ✅ https://yourdomain.com/scanner.html

### 2. Check Browser Console
F12 > Console tab, look for errors

### 3. Check Browser Settings
Pastikan permission camera enabled

### 4. Test dengan Device Berbeda
- Desktop: Chrome, Firefox, Edge
- Mobile: Chrome Android, Safari iOS

### 5. Check Camera Hardware
Pastikan kamera tidak digunakan aplikasi lain

---

## 🎯 Summary

Setup SSL/HTTPS adalah **WAJIB** untuk QR Scanner!

**Cara tercepat:**
1. Beli domain (Rp 100.000/tahun)
2. Pointing ke VPS (A record ke 43.134.97.90)
3. Run GitHub Actions: "Setup SSL/HTTPS Certificate"
4. Done! QR Scanner siap digunakan ✅

**Pertanyaan?** Buka issue di GitHub atau contact support.

---

Made with ❤️ for Bengali Wedding Dashboard
