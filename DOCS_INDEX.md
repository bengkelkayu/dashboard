# 📚 Documentation Index

Panduan lengkap untuk navigasi semua dokumentasi Wedding Guest Dashboard.

---

## 🚀 Quick Start - Pilih Berdasarkan Kebutuhan

### 1️⃣ Saya Ingin Deploy ke VPS (Recommended untuk Production)

#### ⚡ GitHub Actions (RECOMMENDED - Paling Mudah!)

**👉 START HERE:** [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) 🚀

Deploy dengan 1 klik via GitHub Actions - **TIDAK PERLU SSH/TERMINAL!**

**Guides:**
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - Quick 5-minute setup
- [GITHUB_ACTIONS_VISUAL_GUIDE.md](GITHUB_ACTIONS_VISUAL_GUIDE.md) - Step-by-step dengan gambar
- [GITHUB_ACTIONS_DEPLOYMENT_SUMMARY.md](GITHUB_ACTIONS_DEPLOYMENT_SUMMARY.md) - Complete overview
- [DEPLOYMENT_METHODS_COMPARISON.md](DEPLOYMENT_METHODS_COMPARISON.md) - Comparison semua metode

#### 💻 Manual SSH Deployment

**👉 START HERE:** [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) 🇮🇩

Panduan lengkap dalam Bahasa Indonesia dengan step-by-step instructions.

**Alternative:**
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Overview singkat semua deployment files
- [ONE_LINER_INSTALL.md](ONE_LINER_INSTALL.md) - Copy-paste commands

### 2️⃣ Saya Ingin Development di Local Machine

**👉 START HERE:** [DEVELOPMENT.md](DEVELOPMENT.md)

Setup untuk development di laptop/komputer local.

**Alternative:**
- [README.md](README.md) - Quick start guide
- Run `./setup.sh` - Automated setup script

### 3️⃣ Saya Sudah Deploy, Butuh Reference Cepat

**👉 START HERE:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

Command reference untuk daily operations.

**Alternative:**
- [DEPLOYMENT_WORKFLOW.md](DEPLOYMENT_WORKFLOW.md) - Visual workflow diagrams

### 4️⃣ Saya Ingin Memahami API

**👉 START HERE:** [API.md](API.md)

Complete API documentation dengan examples.

### 5️⃣ Saya Ingin Memahami Architecture

**👉 START HERE:** [ARCHITECTURE.md](ARCHITECTURE.md)

System architecture dan technology decisions.

---

## 📁 All Documents - Organized by Category

### 🌐 Deployment & Installation

| Document | Purpose | Language | Best For |
|----------|---------|----------|----------|
| [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) | Panduan lengkap VPS deployment | 🇮🇩 | Pemula, production setup |
| [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) | Complete VPS deployment guide | 🇬🇧 | Advanced users |
| [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) | Overview of deployment package | 🇬🇧 | Quick understanding |
| [DEPLOYMENT_WORKFLOW.md](DEPLOYMENT_WORKFLOW.md) | Visual workflow diagrams | 🇬🇧 | Visual learners |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Validation checklist | 🇬🇧 | Quality assurance |
| [ONE_LINER_INSTALL.md](ONE_LINER_INSTALL.md) | Quick copy-paste commands | 🇮🇩/🇬🇧 | Quick deployment |

### 🛠️ Development

| Document | Purpose | Best For |
|----------|---------|----------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Local development setup | Developers |
| [README.md](README.md) | Project overview & quick start | First-time users |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Implementation details | Understanding codebase |

### 📡 API & Architecture

| Document | Purpose | Best For |
|----------|---------|----------|
| [API.md](API.md) | API endpoints documentation | Frontend/API developers |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture | System designers |

### 📝 Reference & Operations

| Document | Purpose | Best For |
|----------|---------|----------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Daily commands reference | Daily operations |
| [PROJECT_STATS.md](PROJECT_STATS.md) | Project statistics | Project overview |

---

## 🔧 Scripts Index

### Executable Shell Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `deploy-vps.sh` | **Main deployment script** | Fresh VPS deployment |
| `manual-deploy.sh` | Manual step-by-step commands | When automation fails |
| `validate-deployment.sh` | Post-deployment validation | After deployment |
| `setup.sh` | Local development setup | Local development |

### How to Run Scripts

```bash
# Make executable (if needed)
chmod +x script-name.sh

# Run script
./script-name.sh
```

---

## 🎯 Common Scenarios - Where to Look

### Scenario: "Saya baru pertama kali deploy aplikasi"
1. Read: [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md)
2. Use: `deploy-vps.sh`
3. Validate: `validate-deployment.sh`
4. Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### Scenario: "Aplikasi sudah running, saya butuh update code"
1. Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → Update Application section
2. Commands:
   ```bash
   cd /root/dashboard
   git pull
   npm install --production
   npm run migrate
   pm2 restart all
   ```

### Scenario: "Ada error, aplikasi tidak jalan"
1. Check: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → Troubleshooting section
2. Check: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Troubleshooting section
3. Run: `pm2 logs` untuk lihat error
4. Run: `./validate-deployment.sh` untuk comprehensive check

### Scenario: "Saya ingin develop fitur baru locally"
1. Read: [DEVELOPMENT.md](DEVELOPMENT.md)
2. Run: `./setup.sh`
3. Reference: [API.md](API.md) untuk API endpoints

### Scenario: "Saya ingin backup database"
Reference: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Database Management section
```bash
pg_dump -U wedding_user wedding_dashboard > backup.sql
```

### Scenario: "Saya ingin setup domain & SSL"
Reference: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Setup Domain & SSL section

### Scenario: "Saya ingin memahami cara kerja system"
1. Read: [ARCHITECTURE.md](ARCHITECTURE.md)
2. Read: [DEPLOYMENT_WORKFLOW.md](DEPLOYMENT_WORKFLOW.md)
3. Read: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 📊 Documentation Map (Visual)

```
ROOT DOCUMENTATION
│
├── 🚀 GETTING STARTED
│   ├── README.md ........................ Project overview
│   └── INSTALL_VPS_ID.md ................ 🇮🇩 START HERE for VPS
│
├── 💻 DEPLOYMENT
│   ├── DEPLOYMENT_SUMMARY.md ............ Overview of deployment
│   ├── DEPLOYMENT_VPS.md ................ Complete VPS guide
│   ├── DEPLOYMENT_WORKFLOW.md ........... Visual workflows
│   ├── DEPLOYMENT_CHECKLIST.md .......... Validation checklist
│   └── ONE_LINER_INSTALL.md ............. Quick commands
│
├── 🔧 DEVELOPMENT
│   ├── DEVELOPMENT.md ................... Local dev setup
│   └── IMPLEMENTATION_SUMMARY.md ........ Implementation details
│
├── 📡 TECHNICAL
│   ├── API.md ........................... API documentation
│   ├── ARCHITECTURE.md .................. System architecture
│   └── PROJECT_STATS.md ................. Project statistics
│
├── 📝 OPERATIONS
│   ├── QUICK_REFERENCE.md ............... Daily commands
│   └── DEPLOYMENT_CHECKLIST.md .......... Operations checklist
│
└── 🔧 SCRIPTS
    ├── deploy-vps.sh .................... Main deployment
    ├── manual-deploy.sh ................. Manual commands
    ├── validate-deployment.sh ........... Validation
    └── setup.sh ......................... Local setup
```

---

## 🔍 Find Information By Topic

### Infrastructure
- **Node.js Setup**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Software Installation
- **PostgreSQL Setup**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Software Installation
- **Redis Setup**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Software Installation
- **Nginx Configuration**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Web Server Configuration

### Application
- **Environment Variables**: [DEVELOPMENT.md](DEVELOPMENT.md) → Configure Environment Variables
- **Database Migration**: [DEVELOPMENT.md](DEVELOPMENT.md) → Run Database Migrations
- **Starting Application**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → Daily Commands

### Operations
- **PM2 Commands**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → Daily Commands
- **Database Backup**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Database Management
- **Update Application**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → Update Application
- **Troubleshooting**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Troubleshooting

### Security
- **SSL Certificate**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Setup Domain & SSL
- **Firewall Setup**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Security Recommendations
- **Credentials Management**: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Credentials & Security

### API & Integration
- **API Endpoints**: [API.md](API.md)
- **WhatsApp Integration**: [API.md](API.md) → Thank You Messages
- **Webhook Integration**: [API.md](API.md) → Webhook Endpoints

---

## 📖 Reading Order Recommendations

### For First-Time Deployer (Pemula)
1. [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) - Baca seluruh dokumen
2. [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Quick overview
3. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Save for future reference
4. Run `deploy-vps.sh`
5. Bookmark [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for daily use

### For Experienced Sysadmin
1. [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Quick overview
2. [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) - Technical details
3. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
4. Review `deploy-vps.sh` script
5. Deploy using `deploy-vps.sh`
6. Validate using `validate-deployment.sh`

### For Developer
1. [README.md](README.md) - Project overview
2. [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
3. [API.md](API.md) - API documentation
4. [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
5. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Code details
6. Run `./setup.sh` for local development

---

## 🆘 Quick Help

### "I don't know where to start"
👉 [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) (Bahasa Indonesia)
👉 [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) (English)

### "I need quick commands"
👉 [ONE_LINER_INSTALL.md](ONE_LINER_INSTALL.md)
👉 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### "Something is broken"
👉 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → Troubleshooting
👉 [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) → Troubleshooting

### "I want to understand the system"
👉 [ARCHITECTURE.md](ARCHITECTURE.md)
👉 [DEPLOYMENT_WORKFLOW.md](DEPLOYMENT_WORKFLOW.md)

### "I need API information"
👉 [API.md](API.md)

---

## 📞 External Resources

- **Repository**: https://github.com/bengkelkayu/dashboard
- **Issues**: https://github.com/bengkelkayu/dashboard/issues
- **Node.js Docs**: https://nodejs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Nginx Docs**: https://nginx.org/en/docs/

---

## ✅ Document Status

All documents are:
- ✅ Complete
- ✅ Up-to-date
- ✅ Tested
- ✅ Ready for production use

Last updated: 2024

---

**Need help?** Start with [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md) for Indonesian guide or [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for quick English overview.
