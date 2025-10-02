# 🔄 Deployment Workflow

Visualisasi lengkap proses deployment Wedding Guest Dashboard ke VPS.

---

## 📊 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     START DEPLOYMENT                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   Login ke VPS         │
          │   ssh root@IP          │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │   Clone Repository     │
          │   git clone...         │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │   Run deploy-vps.sh    │
          │   ./deploy-vps.sh      │
          └────────┬───────────────┘
                   │
                   ▼
   ┌───────────────────────────────────────┐
   │    AUTOMATED INSTALLATION BEGINS      │
   └───────────────┬───────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌─────────┐                  ┌─────────┐
│ Node.js │                  │ System  │
│  v18    │                  │ Update  │
└────┬────┘                  └────┬────┘
     │                            │
     └────────────┬───────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │   Database & Cache Install  │
    ├─────────────────────────────┤
    │  • PostgreSQL 12+           │
    │  • Redis Server             │
    │  • Database Creation        │
    │  • User & Permissions       │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │   Web Server Setup          │
    ├─────────────────────────────┤
    │  • Nginx Installation       │
    │  • Reverse Proxy Config     │
    │  • PM2 Installation         │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │   Application Setup         │
    ├─────────────────────────────┤
    │  • npm install              │
    │  • .env creation            │
    │  • Database migration       │
    │  • Seed data (optional)     │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │   Services Configuration    │
    ├─────────────────────────────┤
    │  • PM2 start API            │
    │  • PM2 start Worker         │
    │  • Auto-start on boot       │
    │  • Firewall rules           │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │   DEPLOYMENT COMPLETE ✅    │
    ├─────────────────────────────┤
    │  • Display credentials      │
    │  • Show access URL          │
    │  • Show management commands │
    └──────────────┬──────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │   Validation           │
          │   (Optional)           │
          │   ./validate-deploy.sh │
          └────────┬───────────────┘
                   │
                   ▼
          ┌────────────────────────┐
          │   APPLICATION LIVE 🎉  │
          │   http://43.134.97.90  │
          └────────────────────────┘
```

---

## 🎯 Decision Tree - Which Guide to Use?

```
                    START
                      │
                      ▼
              ┌───────────────┐
              │ Familiar with │
              │    Linux?     │
              └───┬───────┬───┘
                  │       │
            YES   │       │   NO
                  │       │
                  ▼       ▼
         ┌──────────┐ ┌──────────────────┐
         │ Want     │ │ Use Indonesian   │
         │ English? │ │ Guide with       │
         └─┬─────┬──┘ │ Screenshots      │
           │     │    │                  │
       YES │     │ NO │ INSTALL_VPS_ID.md│
           │     │    └──────────────────┘
           ▼     ▼
    ┌──────────┐ ┌──────────────────┐
    │ Advanced │ │ One-Liner Install│
    │ User?    │ │                  │
    └─┬────┬───┘ │ ONE_LINER_       │
      │    │     │ INSTALL.md       │
  YES │    │ NO  └──────────────────┘
      │    │
      ▼    ▼
┌─────────┐ ┌──────────────┐
│ Deploy  │ │ DEPLOYMENT_  │
│ VPS.md  │ │ VPS.md       │
│ +       │ │              │
│ Checklist│ └──────────────┘
└─────────┘
```

---

## 🔄 Post-Deployment Workflow

```
┌─────────────────────────────────────────────────────────┐
│              APPLICATION IS LIVE                         │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
   ┌─────────────┐          ┌─────────────┐
   │   Daily     │          │  Updates &  │
   │   Ops       │          │  Maintenance│
   └──────┬──────┘          └──────┬──────┘
          │                        │
          │                        │
    ┌─────┴─────┐            ┌─────┴─────┐
    │           │            │           │
    ▼           ▼            ▼           ▼
┌────────┐ ┌────────┐  ┌────────┐ ┌────────┐
│ Check  │ │ View   │  │ Update │ │ Backup │
│ Status │ │ Logs   │  │ Code   │ │  DB    │
└────────┘ └────────┘  └────────┘ └────────┘
    │           │            │           │
    │           │            │           │
    └─────┬─────┘            └─────┬─────┘
          │                        │
          ▼                        ▼
   ┌─────────────┐          ┌─────────────┐
   │ QUICK_      │          │ git pull    │
   │ REFERENCE   │          │ npm install │
   │ .md         │          │ migrate     │
   └─────────────┘          │ pm2 restart │
                            └─────────────┘
```

---

## 🛠️ Component Architecture After Deployment

```
┌─────────────────────────────────────────────────────┐
│                   INTERNET                           │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ Port 80
                    ▼
         ┌─────────────────────┐
         │   NGINX (Port 80)   │
         │   Reverse Proxy     │
         └──────────┬──────────┘
                    │
                    │ Proxy to localhost:3000
                    ▼
         ┌─────────────────────┐
         │   PM2 Process       │
         │   Manager           │
         ├─────────────────────┤
         │ ┌─────────────────┐ │
         │ │  wedding-api    │ │ ← Express.js Server
         │ │  (Port 3000)    │ │   Backend API
         │ └─────────────────┘ │
         │                     │
         │ ┌─────────────────┐ │
         │ │ wedding-worker  │ │ ← Background Worker
         │ │                 │ │   Thank You Messages
         │ └─────────────────┘ │
         └──────────┬──────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │  Redis   │  │   File   │
│  Port    │  │  Port    │  │  System  │
│  5432    │  │  6379    │  │          │
│          │  │          │  │  - Logs  │
│ - guests │  │ - Cache  │  │  - .env  │
│ - attend │  │ - Queue  │  │  - App   │
│ - templ  │  │          │  │          │
│ - audit  │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘
```

---

## 📁 File Organization After Deployment

```
/root/dashboard/
│
├── 🔧 Deployment Scripts
│   ├── deploy-vps.sh              ← Main deployment
│   ├── manual-deploy.sh           ← Manual commands
│   ├── validate-deployment.sh     ← Validation
│   └── setup.sh                   ← Dev setup
│
├── 📚 Documentation
│   ├── INSTALL_VPS_ID.md         ← 🇮🇩 Start here
│   ├── DEPLOYMENT_VPS.md         ← 🇬🇧 Full guide
│   ├── QUICK_REFERENCE.md        ← Daily commands
│   ├── ONE_LINER_INSTALL.md      ← Quick install
│   ├── DEPLOYMENT_CHECKLIST.md   ← Checklist
│   └── DEPLOYMENT_SUMMARY.md     ← Overview
│
├── ⚙️ Configuration
│   ├── .env                       ← Environment vars
│   ├── .env.example              ← Template
│   └── package.json              ← Dependencies
│
├── 💻 Application Code
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.js         ← Main server
│   │   │   ├── config/           ← Config
│   │   │   ├── controllers/      ← Logic
│   │   │   ├── models/           ← DB models
│   │   │   ├── routes/           ← API routes
│   │   │   └── workers/          ← Background
│   │   │       └── thankYouWorker.js
│   │   └── migrations/           ← DB migrations
│   │       ├── 001_initial_schema.sql
│   │       └── seed-sample-data.sql
│   └── public/
│       ├── index.html            ← Dashboard
│       ├── thankyou.html         ← Templates
│       ├── app.js                ← Frontend
│       └── styles.css            ← Styles
│
└── 📊 Runtime (Generated)
    └── node_modules/             ← Dependencies
```

---

## 🔄 Update Workflow

```
┌──────────────────────────────────┐
│  New Update Available on GitHub  │
└────────────┬─────────────────────┘
             │
             ▼
     ┌───────────────┐
     │ Login to VPS  │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ cd dashboard  │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │  git pull     │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ npm install   │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ npm run       │
     │ migrate       │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ pm2 restart   │
     │ all           │
     └───────┬───────┘
             │
             ▼
     ┌───────────────┐
     │ Verify update │
     │ working       │
     └───────────────┘
```

---

## 🆘 Troubleshooting Flow

```
┌─────────────────────────────┐
│  Problem: App not working   │
└──────────┬──────────────────┘
           │
           ▼
   ┌───────────────┐
   │ Check PM2     │
   │ pm2 status    │
   └───┬───────────┘
       │
       ▼
   ┌───────────────┐
   │ All online?   │
   └─┬─────────┬───┘
     │         │
   NO│         │YES
     │         │
     ▼         ▼
┌──────────┐ ┌──────────┐
│ pm2      │ │ Check    │
│ restart  │ │ logs     │
│ all      │ │          │
└──────────┘ └────┬─────┘
                  │
                  ▼
           ┌──────────────┐
           │ Database     │
           │ connection   │
           │ error?       │
           └─┬──────────┬─┘
             │          │
           YES│          │NO
             │          │
             ▼          ▼
      ┌──────────┐ ┌──────────┐
      │ Restart  │ │ Nginx    │
      │ postgres │ │ issue?   │
      └──────────┘ └────┬─────┘
                        │
                      YES│
                        │
                        ▼
                 ┌──────────┐
                 │ Restart  │
                 │ nginx    │
                 └──────────┘
```

---

## ✅ Success Indicators

After deployment, these should all be ✅:

```
System Services:
├─ PostgreSQL ────── ✅ Active (running)
├─ Redis ───────────── ✅ Active (running)
└─ Nginx ───────────── ✅ Active (running)

PM2 Processes:
├─ wedding-api ───── ✅ Online (0 restarts)
└─ wedding-worker ── ✅ Online (0 restarts)

Network:
├─ Port 5432 ──────── ✅ PostgreSQL listening
├─ Port 6379 ──────── ✅ Redis listening
├─ Port 3000 ──────── ✅ App listening
└─ Port 80 ────────── ✅ Nginx listening

Endpoints:
├─ http://IP/health ─ ✅ {"status":"ok"}
├─ http://IP/api ──── ✅ API info
└─ http://IP ──────── ✅ Dashboard loads

Configuration:
├─ .env file ───────── ✅ Exists
├─ Database ────────── ✅ Connected
└─ Migrations ──────── ✅ Applied
```

---

## 📞 Quick Command Reference

```bash
# Status Check
pm2 status
systemctl status postgresql nginx redis-server

# View Logs
pm2 logs
pm2 logs wedding-api
pm2 logs wedding-worker

# Restart
pm2 restart all
systemctl restart nginx

# Database
psql -U wedding_user -d wedding_dashboard

# Update
cd /root/dashboard && git pull && npm install && npm run migrate && pm2 restart all

# Validation
./validate-deployment.sh
```

---

**For full documentation, see:**
- 🇮🇩 [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md)
- 🇬🇧 [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md)
- ⚡ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
