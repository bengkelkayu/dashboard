# 🚀 Quick Reference - VPS Commands

## 📍 VPS Info
```
IP: 43.134.97.90
User: root
Password: 23042015Ok$$
URL: http://43.134.97.90
```

## 🎯 One-Command Deploy

```bash
ssh root@43.134.97.90
```
Kemudian:
```bash
cd /root && apt-get update && apt-get install -y git && git clone https://github.com/bengkelkayu/dashboard.git && cd dashboard && chmod +x deploy-vps.sh && ./deploy-vps.sh
```

---

## 📊 Daily Commands

### Check Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs
pm2 logs wedding-api    # API only
pm2 logs wedding-worker # Worker only
```

### Restart
```bash
pm2 restart all
pm2 restart wedding-api
pm2 restart wedding-worker
```

### Monitor Real-time
```bash
pm2 monit
```

### Stop All
```bash
pm2 stop all
```

### Start All
```bash
pm2 start all
```

---

## 🗄️ Database Commands

### Connect
```bash
psql -U wedding_user -d wedding_dashboard
```

### Quick Queries
```sql
-- Count guests
SELECT COUNT(*) FROM guests;

-- Attendance summary
SELECT status, COUNT(*) FROM guest_attendance GROUP BY status;

-- Exit psql
\q
```

### Backup
```bash
pg_dump -U wedding_user wedding_dashboard > backup.sql
```

### Restore
```bash
psql -U wedding_user wedding_dashboard < backup.sql
```

---

## 🔄 Update Application

```bash
cd /root/dashboard
git pull origin main
npm install --production
npm run migrate
pm2 restart all
```

---

## 🌐 Nginx Commands

### Check Status
```bash
systemctl status nginx
```

### Test Config
```bash
nginx -t
```

### Restart
```bash
systemctl restart nginx
```

### View Logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 🔍 System Health

### Check Services
```bash
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
pm2 status
```

### Check Disk Space
```bash
df -h
```

### Check Memory
```bash
free -h
```

### Check CPU/Processes
```bash
htop  # atau 'top' jika htop belum install
```

---

## ❌ Emergency Fixes

### Application Not Responding
```bash
pm2 restart all
systemctl restart nginx
```

### Database Issues
```bash
systemctl restart postgresql
```

### Out of Memory
```bash
pm2 restart all
# Check logs
pm2 logs --err
```

### Port 3000 Already in Use
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart all
```

---

## 🔐 Security

### Change Password
```bash
passwd
```

### Firewall Status
```bash
ufw status
```

### View Active Connections
```bash
netstat -tulpn | grep LISTEN
```

---

## 📝 Log Files Locations

```
PM2 Logs:     ~/.pm2/logs/
Nginx Error:  /var/log/nginx/error.log
Nginx Access: /var/log/nginx/access.log
PostgreSQL:   /var/log/postgresql/
System:       /var/log/syslog
```

---

## 🆘 Get Help

### Check Application Health
```bash
curl http://localhost:3000/health
```

### View Last 50 Lines of Logs
```bash
pm2 logs --lines 50
```

### Check All Error Logs
```bash
pm2 logs --err
```

---

## 🎯 Production Checklist

- [ ] Application running: `pm2 status`
- [ ] Can access: http://43.134.97.90
- [ ] Database connected: `psql -U wedding_user -d wedding_dashboard -c "SELECT 1;"`
- [ ] Nginx running: `systemctl status nginx`
- [ ] Firewall configured: `ufw status`
- [ ] Backup scheduled: `crontab -l`
- [ ] Credentials saved securely

---

## 📞 Contact & Documentation

- Full Guide: `INSTALL_VPS_ID.md`
- VPS Deployment: `DEPLOYMENT_VPS.md`
- API Docs: `API.md`
- Development: `DEVELOPMENT.md`

---

**Last Updated**: 2024
**Application**: Wedding Guest Dashboard
