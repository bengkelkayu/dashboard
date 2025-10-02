# Deployment Notes

## WhatsApp Integration dengan Baileys.js

Aplikasi ini menggunakan **@whiskeysockets/baileys** untuk integrasi WhatsApp (bukan WhatsApp API).

### Dependencies yang Dibutuhkan

Package.json sudah include semua dependencies yang diperlukan:

#### Core Dependencies
- `@whiskeysockets/baileys@^7.0.0-rc.4` - WhatsApp Web API library

#### Peer Dependencies (Required oleh Baileys)
- `audio-decode@^2.1.3` - Audio processing
- `jimp@^1.6.0` - Image processing
- `link-preview-js@^3.0.5` - Link preview generation
- `sharp@^0.33.5` - High performance image processing

### Setup WhatsApp Connection

1. **Deploy aplikasi ke VPS** menggunakan GitHub Actions workflow
2. **Initialize WhatsApp connection**:
   ```bash
   # Via API endpoint
   POST http://your-vps-ip/api/whatsapp/initialize
   ```
3. **Scan QR Code**:
   ```bash
   # Get QR code
   GET http://your-vps-ip/api/whatsapp/qr
   ```
4. **Check connection status**:
   ```bash
   GET http://your-vps-ip/api/whatsapp/status
   ```

### Autentikasi Baileys

Baileys menyimpan session data di folder `baileys_auth/` (sudah ada di .gitignore).

**Penting**: Folder ini berisi kredensial WhatsApp session. Jangan commit ke git!

### Deployment via GitHub Actions

#### Option 1: Password Authentication (Recommended untuk quick setup)
1. Set GitHub Secrets:
   - `VPS_HOST`: IP VPS Anda
   - `VPS_PASSWORD`: Password root VPS

2. Trigger workflow: **Deploy to VPS (Password Auth)**

#### Option 2: SSH Key Authentication (More secure)
1. Generate SSH key:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/vps_deploy_key
   ssh-copy-id -i ~/.ssh/vps_deploy_key.pub root@YOUR_VPS_IP
   ```

2. Set GitHub Secrets:
   - `VPS_HOST`: IP VPS Anda
   - `VPS_SSH_KEY`: Content dari `~/.ssh/vps_deploy_key`

3. Trigger workflow: **Deploy to VPS**

### Build Process

Workflow akan:
1. ✅ Install Node.js v18
2. ✅ Install PostgreSQL, Redis, Nginx
3. ✅ Clone repository
4. ✅ Run `npm install --production` (termasuk semua Baileys dependencies)
5. ✅ Setup database & migrations
6. ✅ Configure Nginx reverse proxy
7. ✅ Start dengan PM2

### Troubleshooting

#### Error: Cannot find module '@whiskeysockets/baileys'
**Fix**: Pastikan `npm install --production` berhasil. Dependencies akan auto-install saat deployment.

#### Error: sharp installation failed
**Fix**: Sharp memerlukan build tools. Workflow sudah include package installation yang diperlukan.

#### WhatsApp tidak connect
1. Check logs: `pm2 logs wedding-api`
2. Initialize ulang: `POST /api/whatsapp/initialize`
3. Scan QR code: `GET /api/whatsapp/qr`

### Production Checklist

- [x] Dependencies installed (including Baileys peer dependencies)
- [ ] VPS accessible via SSH
- [ ] GitHub Secrets configured
- [ ] Workflow triggered and successful
- [ ] Application accessible via browser
- [ ] WhatsApp connection initialized
- [ ] Test send message

### Quick Deploy Command

Via GitHub Actions (recommended):
```bash
# Go to: https://github.com/bengkelkayu/dashboard/actions
# Select: "Deploy to VPS (Password Auth)"
# Click: "Run workflow"
# Choose: "full" for first-time deployment
```

Via SSH (manual):
```bash
ssh root@YOUR_VPS_IP
cd /root && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

### Support

- 📖 [README.md](README.md) - Overview
- 🚀 [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - GitHub Actions guide
- 🔧 [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment details
- 📡 [API.md](API.md) - API documentation

---

**Last Updated**: $(date +%Y-%m-%d)
**Version**: 1.0.0
