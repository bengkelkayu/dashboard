# 🚀 Quick Deploy Guide - Dashboard Bengkel Kayu

## ✅ Status: Ready to Deploy!

Semua dependencies sudah lengkap dan siap deploy ke VPS.

## 📋 Yang Sudah Fixed

### 1. Dependencies Baileys.js ✓
Sudah ditambahkan ke `package.json`:
- ✅ `@whiskeysockets/baileys@^7.0.0-rc.4`
- ✅ `audio-decode@^2.1.3`
- ✅ `jimp@^1.6.0`
- ✅ `link-preview-js@^3.0.5`
- ✅ `sharp@^0.33.5`

### 2. GitHub Workflows ✓
Dua workflow siap pakai:
- ✅ `deploy-vps.yml` - Deploy dengan SSH Key
- ✅ `deploy-vps-password.yml` - Deploy dengan Password (recommended untuk quick start)

### 3. Build & Scripts ✓
- ✅ Deploy script (`deploy-vps.sh`) sudah lengkap
- ✅ Verification script (`verify-build.sh`) untuk test build
- ✅ All syntax checks passed

## 🎯 Cara Deploy (3 Langkah)

### Step 1: Set GitHub Secrets

1. Buka: https://github.com/bengkelkayu/dashboard/settings/secrets/actions
2. Klik **"New repository secret"**
3. Tambahkan 2 secrets:

```
Name: VPS_HOST
Value: 43.134.97.90
```

```
Name: VPS_PASSWORD
Value: 23042015Ok$$
```

### Step 2: Trigger Workflow

1. Buka: https://github.com/bengkelkayu/dashboard/actions
2. Pilih workflow: **"Deploy to VPS (Password Auth)"**
3. Klik **"Run workflow"**
4. Pilih **"full"** (untuk deployment pertama kali)
5. Klik **"Run workflow"**

### Step 3: Wait & Verify

⏱️ Tunggu 5-10 menit untuk deployment selesai.

Setelah selesai:
1. Buka browser: `http://43.134.97.90`
2. Dashboard sudah bisa diakses! 🎉

## 📱 Setup WhatsApp (Baileys.js)

Setelah deploy berhasih, setup WhatsApp:

### 1. Initialize Connection
```bash
curl -X POST http://43.134.97.90/api/whatsapp/initialize
```

### 2. Get QR Code
```bash
curl http://43.134.97.90/api/whatsapp/qr
```

Atau buka di browser: `http://43.134.97.90/api/whatsapp/qr`

### 3. Scan QR Code
Scan QR code yang muncul dengan WhatsApp di HP Anda.

### 4. Verify Connection
```bash
curl http://43.134.97.90/api/whatsapp/status
```

Should return: `{"isConnected": true}`

## 🔍 Monitoring & Troubleshooting

### Check Application Status
```bash
ssh root@43.134.97.90
pm2 status
```

### View Logs
```bash
pm2 logs wedding-api
pm2 logs wedding-worker
```

### Restart if Needed
```bash
pm2 restart all
```

### Check Services
```bash
systemctl status nginx
systemctl status postgresql
systemctl status redis
```

## 📚 Documentation Files

Untuk info lebih lengkap, baca:

1. **[DEPLOYMENT_NOTES.md](DEPLOYMENT_NOTES.md)** - Deployment details & troubleshooting
2. **[GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)** - GitHub Actions setup guide
3. **[README.md](README.md)** - Application overview
4. **[API.md](API.md)** - API documentation

## ⚡ Quick Commands Reference

### Via GitHub Actions (Recommended)
```
1. Go to: Actions tab
2. Select: Deploy to VPS (Password Auth)
3. Click: Run workflow
4. Choose: full
```

### Via SSH (Manual Alternative)
```bash
ssh root@43.134.97.90
cd /root && \
git clone https://github.com/bengkelkayu/dashboard.git && \
cd dashboard && \
chmod +x deploy-vps.sh && \
./deploy-vps.sh
```

## ✅ Verification Checklist

Setelah deployment:

- [ ] App accessible di browser (http://43.134.97.90)
- [ ] PM2 showing 2 processes running (wedding-api, wedding-worker)
- [ ] Nginx running dan serving requests
- [ ] PostgreSQL database created
- [ ] Redis running for queue management
- [ ] WhatsApp initialized dan connected
- [ ] Can send test message via API

## 🎉 Done!

App sudah ready untuk production use!

**URL**: http://43.134.97.90

---

**Support**: Check logs dengan `pm2 logs` atau baca dokumentasi lengkap di file-file di atas.

**Last Updated**: 2024
**Build Status**: ✅ Ready to Deploy
