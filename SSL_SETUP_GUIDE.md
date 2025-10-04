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

### 🎯 Dua Pilihan SSL:

1. **Let's Encrypt dengan Domain** (Recommended untuk Production)
   - ✅ Gratis dan trusted oleh semua browser
   - ✅ Tidak ada security warning
   - ✅ Professional dan ready untuk production
   - ❌ Memerlukan domain name

2. **Self-Signed dengan IP Address** (Untuk Testing/Development)
   - ✅ Gratis dan mudah setup
   - ✅ Tidak perlu domain
   - ✅ Camera/QR Scanner tetap berfungsi
   - ⚠️ Browser akan menampilkan security warning
   - ❌ Tidak cocok untuk production

**Panduan ini mencakup kedua pilihan!**

---

## 📋 Prerequisites

### Untuk Let's Encrypt SSL (Recommended - Trusted Certificate):

1. **Domain Name** - Anda harus punya domain (beli dari:)
   - Namecheap: https://www.namecheap.com
   - GoDaddy: https://www.godaddy.com
   - Cloudflare: https://www.cloudflare.com
   - Niagahoster: https://www.niagahoster.co.id (Indonesia)
   - Rumahweb: https://www.rumahweb.com (Indonesia)

2. **Domain sudah pointing ke VPS**
   ```
   DNS Record:
   Type: A
   Name: @ (or subdomain like 'wedding')
   Value: 43.134.97.90  (IP VPS Anda)
   TTL: Auto
   ```

3. **VPS sudah terinstall aplikasi** (sudah deploy dengan workflow)

### Untuk Self-Signed SSL (IP Address Only - Testing):

1. **Hanya butuh VPS** - Tidak perlu domain
2. **VPS sudah terinstall aplikasi**
3. **Siap terima browser security warning**

**Rekomendasi:** Gunakan Let's Encrypt dengan domain untuk production. Gunakan self-signed hanya untuk testing/development.

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

## 🔐 SSL untuk IP Address (Self-Signed Certificate)

**PENTING:** Jika Anda belum punya domain atau ingin menggunakan HTTPS dengan IP address saja (misal: https://43.134.97.90), Anda bisa menggunakan **self-signed certificate**.

### ⚠️ Perbedaan Self-Signed vs Let's Encrypt

| Aspek | Let's Encrypt (Domain) | Self-Signed (IP) |
|-------|----------------------|------------------|
| **Biaya** | Gratis ✅ | Gratis ✅ |
| **Trusted Browser** | Ya ✅ (Tidak ada warning) | Tidak ❌ (Ada warning) |
| **Domain Required** | Ya ✅ | Tidak ❌ |
| **Setup Complexity** | Medium | Easy |
| **Camera Access** | Works ✅ | Works ✅ (setelah accept warning) |
| **Production Ready** | Ya ✅ | Tidak (hanya untuk testing) |

### 📋 Kapan Menggunakan Self-Signed?

✅ **Cocok untuk:**
- Testing dan development
- Internal application (tidak public)
- Sementara sampai domain ready
- Demo atau POC (Proof of Concept)
- Mengaktifkan fitur camera/QR scanner untuk testing

❌ **Tidak cocok untuk:**
- Production website public
- E-commerce atau payment
- Website yang butuh user trust
- Professional business application

### 🚀 Cara Setup Self-Signed SSL untuk IP Address

#### Pilihan 1: Via GitHub Actions (MUDAH) ⭐

**Coming Soon** - Workflow untuk auto-setup self-signed certificate sedang dalam development.

#### Pilihan 2: Manual Setup via SSH

```bash
# 1. Login ke VPS
ssh root@43.134.97.90

# 2. Buat direktori untuk SSL certificate
mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

# 3. Generate Self-Signed Certificate untuk IP Address
# Certificate ini valid 365 hari (1 tahun)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out /etc/nginx/ssl/selfsigned.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Wedding Dashboard/OU=IT/CN=43.134.97.90" \
  -addext "subjectAltName=IP:43.134.97.90"

# 4. Set proper permissions
chmod 600 /etc/nginx/ssl/selfsigned.key
chmod 644 /etc/nginx/ssl/selfsigned.crt

echo "✅ Self-signed certificate created!"

# 5. Update Nginx Configuration
cat > /etc/nginx/sites-available/wedding-dashboard << 'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name _;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main application with self-signed certificate
server {
    listen 443 ssl http2;
    server_name _;

    # SSL Configuration - Self-Signed Certificate
    ssl_certificate /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 10M;

    # Proxy to Node.js application
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

# 6. Enable the site
ln -sf /etc/nginx/sites-available/wedding-dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 7. Test nginx configuration
nginx -t

# 8. Restart Nginx
systemctl restart nginx

echo "✅ Nginx configured with self-signed SSL!"
echo ""
echo "================================================"
echo "🌐 Your site is now accessible at:"
echo "   https://43.134.97.90"
echo ""
echo "⚠️  Browser will show security warning"
echo "    Click 'Advanced' > 'Proceed to site'"
echo "================================================"

# 9. Update .env (optional)
cd /root/dashboard
if [ -f .env ]; then
  if grep -q "^CORS_ORIGIN=" .env; then
    sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=https://43.134.97.90|" .env
  else
    echo "CORS_ORIGIN=https://43.134.97.90" >> .env
  fi
  pm2 restart all
  echo "✅ Application restarted with HTTPS configuration"
fi
```

### 🌐 Cara Mengakses Site dengan Self-Signed Certificate

Setelah setup, akses: **https://43.134.97.90**

Browser akan menampilkan **security warning** karena certificate tidak di-trust oleh Certificate Authority.

#### Chrome / Edge:
1. Klik **"Advanced"** atau **"Details"**
2. Klik **"Proceed to 43.134.97.90 (unsafe)"** atau **"Continue to site"**
3. ✅ Site akan terbuka dengan HTTPS

#### Firefox:
1. Klik **"Advanced"**
2. Klik **"Accept the Risk and Continue"**
3. ✅ Site akan terbuka dengan HTTPS

#### Safari (iOS/macOS):
1. Klik **"Show Details"**
2. Klik **"visit this website"**
3. Confirm dengan password/Touch ID
4. ✅ Site akan terbuka dengan HTTPS

### 📱 QR Scanner / Camera dengan Self-Signed SSL

Setelah accept security warning:
- ✅ Kamera akan bisa diakses
- ✅ QR Scanner akan berfungsi normal
- ✅ Semua fitur HTTPS-only akan aktif

**Note:** Anda hanya perlu accept warning **sekali per browser**. Setelah itu, browser akan remember exception.

### 🔄 Renew Self-Signed Certificate

Certificate self-signed perlu di-renew manual sebelum expire (365 hari):

```bash
ssh root@43.134.97.90

# Generate certificate baru (sama seperti step 3 di atas)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out /etc/nginx/ssl/selfsigned.crt \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Wedding Dashboard/OU=IT/CN=43.134.97.90" \
  -addext "subjectAltName=IP:43.134.97.90"

# Restart Nginx
systemctl restart nginx

echo "✅ Certificate renewed for another 365 days"
```

### 🎯 Migration ke Domain + Let's Encrypt (Recommended)

Ketika Anda sudah siap dengan domain, Anda bisa migrate dari self-signed ke Let's Encrypt:

```bash
# 1. Setup domain DNS (A record ke IP VPS)
# 2. Tunggu DNS propagation (5-10 menit)
# 3. Jalankan GitHub Actions: "Setup SSL/HTTPS Certificate"
# 4. Done! Certificate akan otomatis trusted tanpa warning
```

### ⚠️ Important Notes

1. **Browser Warning Normal**: Self-signed certificate akan selalu ada warning - ini expected behavior
2. **Not for Production**: Jangan gunakan self-signed untuk production public website
3. **Camera Still Works**: Meskipun ada warning, camera/QR scanner tetap berfungsi setelah accept warning
4. **One-time Accept**: Setelah accept warning, browser akan remember untuk session selanjutnya
5. **Different per Device**: Setiap device/browser perlu accept warning masing-masing

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

### Error: "Browser tidak accept self-signed certificate"

Jika browser menolak self-signed certificate:

**Chrome/Edge:**
1. Di halaman warning, ketik: `thisisunsafe` (tanpa spasi, langsung ketik)
2. Browser akan bypass warning
3. Atau klik Advanced > Proceed

**Firefox:**
1. Settings > Privacy & Security
2. Scroll ke Certificates
3. View Certificates > Servers > Add Exception
4. Masukkan: `https://43.134.97.90`
5. Confirm Security Exception

**iOS Safari:**
1. Settings > General > About > Certificate Trust Settings
2. Enable certificate untuk IP address

---

### Error: "Mixed Content" setelah SSL setup

Jika ada error mixed content (HTTP di dalam HTTPS):

```bash
ssh root@43.134.97.90
cd /root/dashboard

# Check .env
grep -E "^(CORS_ORIGIN|BASE_URL|API_URL)" .env

# Pastikan semua URL menggunakan https://
# Update jika masih http://
nano .env

# Restart
pm2 restart all
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
A: Untuk SSL certificate dari Let's Encrypt (gratis dan trusted), ya harus punya domain. Tapi ada alternatif untuk IP address - lihat bagian "SSL untuk IP Address" di bawah.

### Q: Bisa pakai subdomain?
A: Ya! Misal: wedding.example.com

### Q: Wildcard certificate (*.example.com)?
A: Ya, tapi butuh DNS validation. Gunakan:
```bash
certbot certonly --manual --preferred-challenges dns -d "*.example.com"
```

### Q: Bisakah tanpa domain / hanya dengan IP?
A: Ya, bisa dengan self-signed certificate! Lihat panduan lengkap di bagian "SSL untuk IP Address (Self-Signed Certificate)" di bawah. Cocok untuk testing atau saat belum punya domain.

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

### Pilihan 1: Let's Encrypt dengan Domain (Recommended)
**Cara tercepat:**
1. Beli domain (Rp 100.000/tahun)
2. Pointing ke VPS (A record ke 43.134.97.90)
3. Run GitHub Actions: "Setup SSL/HTTPS Certificate"
4. Done! QR Scanner siap digunakan ✅

**Keuntungan:**
- ✅ Trusted certificate (no warning)
- ✅ Professional untuk production
- ✅ Auto-renewal setiap 60 hari

### Pilihan 2: Self-Signed dengan IP Address (Testing)
**Cara tercepat:**
1. SSH ke VPS
2. Generate self-signed certificate (5 menit)
3. Update Nginx config
4. Done! QR Scanner siap digunakan ✅

**Keuntungan:**
- ✅ Tidak perlu domain
- ✅ Gratis dan cepat setup
- ✅ Perfect untuk testing

**Kekurangan:**
- ⚠️ Browser security warning (harus di-accept manual)
- ❌ Tidak cocok untuk production

### 🎯 Rekomendasi:
- **Testing/Development**: Gunakan self-signed SSL
- **Production/Public**: Gunakan Let's Encrypt dengan domain

**Pertanyaan?** Buka issue di GitHub atau contact support.

---

Made with ❤️ for Bengali Wedding Dashboard
