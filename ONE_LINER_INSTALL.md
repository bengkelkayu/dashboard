# ⚡ One-Liner Installation Commands

## 🚀 Super Quick Deploy (Copy-Paste ini ke VPS)

### Method 1: Direct Deploy (Recommended)
```bash
ssh root@43.134.97.90 "cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh"
```

### Method 2: Step-by-Step
```bash
# 1. Login
ssh root@43.134.97.90

# 2. Install & Deploy
cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

### Method 3: Manual Commands
```bash
# Login first
ssh root@43.134.97.90

# Then run these:
apt-get update
apt-get install -y git
cd /root
git clone https://github.com/bengkelkayu/dashboard.git
cd dashboard
chmod +x deploy-vps.sh
./deploy-vps.sh
```

---

## 📋 After Installation

### Check Status
```bash
pm2 status
```

### View Application
Open browser: `http://43.134.97.90`

### View Logs
```bash
pm2 logs
```

---

## 🔄 Quick Commands

### Restart Application
```bash
pm2 restart all
```

### Update Application
```bash
cd /root/dashboard && git pull && npm install --production && npm run migrate && pm2 restart all
```

### Backup Database
```bash
pg_dump -U wedding_user wedding_dashboard > backup_$(date +%Y%m%d).sql
```

### View Recent Logs
```bash
pm2 logs --lines 50
```

---

## 🆘 Emergency Commands

### Application Not Working
```bash
pm2 restart all && systemctl restart nginx
```

### Check What's Wrong
```bash
pm2 logs --err && systemctl status nginx postgresql redis-server
```

### Reset Application
```bash
pm2 delete all && cd /root/dashboard && pm2 start backend/src/server.js --name wedding-api && pm2 start backend/src/workers/thankYouWorker.js --name wedding-worker && pm2 save
```

---

## 📞 Full Documentation

- 🇮🇩 Panduan Lengkap: [INSTALL_VPS_ID.md](INSTALL_VPS_ID.md)
- 📖 English Guide: [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md)
- ⚡ Quick Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- ✅ Checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

**Access Info:**
- IP: 43.134.97.90
- User: root
- URL: http://43.134.97.90
