# 📋 Deployment Checklist

Checklist lengkap untuk memastikan deployment VPS berhasil dengan baik.

## Pre-Deployment

### Server Requirements
- [ ] VPS dengan Ubuntu 20.04+ atau Debian 10+
- [ ] Minimal 1GB RAM
- [ ] Minimal 1 CPU Core
- [ ] Minimal 10GB Storage
- [ ] Akses SSH (root atau sudo user)

### Network Requirements
- [ ] Port 22 (SSH) accessible
- [ ] Port 80 (HTTP) accessible
- [ ] Port 443 (HTTPS) accessible (untuk SSL)
- [ ] Domain name (opsional, tapi recommended)

### Credentials Prepared
- [ ] VPS IP address
- [ ] SSH username
- [ ] SSH password atau private key
- [ ] Database password (akan di-generate atau tentukan sendiri)

## Deployment Process

### 1. Initial Server Access
- [ ] Login ke VPS via SSH berhasil
- [ ] User memiliki sudo privileges
- [ ] Internet connection dari VPS berfungsi

### 2. Software Installation
- [ ] Node.js v18+ installed
- [ ] PostgreSQL v12+ installed dan running
- [ ] Redis installed dan running
- [ ] Nginx installed dan running
- [ ] PM2 installed
- [ ] Git installed

### 3. Application Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created dan configured
- [ ] Database created
- [ ] Database user created dengan privileges
- [ ] Migrations completed successfully
- [ ] Sample data seeded (opsional)

### 4. Web Server Configuration
- [ ] Nginx configured sebagai reverse proxy
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx reloaded/restarted
- [ ] Default site disabled

### 5. Application Start
- [ ] PM2 started `wedding-api` process
- [ ] PM2 started `wedding-worker` process
- [ ] PM2 configured untuk auto-start on boot
- [ ] PM2 configuration saved

### 6. Security Configuration
- [ ] Firewall (UFW) enabled
- [ ] Port 22, 80, 443 allowed
- [ ] Root login disabled (recommended)
- [ ] Strong passwords set
- [ ] SSH key authentication setup (recommended)

## Post-Deployment Validation

### Automated Validation
- [ ] Run validation script: `./validate-deployment.sh`
- [ ] All checks passed

### Manual Testing

#### System Services
- [ ] PostgreSQL status: `systemctl status postgresql` → Active
- [ ] Redis status: `systemctl status redis-server` → Active
- [ ] Nginx status: `systemctl status nginx` → Active

#### PM2 Processes
- [ ] `pm2 status` shows 2 processes
- [ ] `wedding-api` status: Online
- [ ] `wedding-worker` status: Online
- [ ] No restart loops (restarts should be 0 or minimal)

#### Network Connectivity
- [ ] `curl http://localhost:3000/health` returns `{"status":"ok"}`
- [ ] `curl http://localhost/health` returns `{"status":"ok"}`
- [ ] Access dari browser: `http://YOUR_VPS_IP` → Dashboard muncul

#### Database Connection
- [ ] `psql -U wedding_user -d wedding_dashboard -c "SELECT 1;"` → Success
- [ ] `psql -U wedding_user -d wedding_dashboard -c "SELECT COUNT(*) FROM guests;"` → Returns count

#### Application Features
- [ ] Dashboard homepage loads
- [ ] Guest list displays correctly
- [ ] Add new guest works
- [ ] Edit guest works
- [ ] Delete guest works
- [ ] Statistics displayed correctly
- [ ] Thank you templates page loads
- [ ] API endpoints responding (`http://YOUR_VPS_IP/api`)

#### Logs Check
- [ ] `pm2 logs` tidak menunjukkan error kritis
- [ ] No continuous error loops
- [ ] Database connection successful di logs
- [ ] Worker processing messages (jika ada)

## Production Readiness

### Performance
- [ ] Response time < 500ms untuk halaman utama
- [ ] Database queries efficient
- [ ] No memory leaks terdeteksi
- [ ] CPU usage normal (< 50% saat idle)

### Monitoring
- [ ] PM2 monitoring setup
- [ ] Log rotation configured
- [ ] Disk space monitoring setup
- [ ] Backup strategy implemented

### Backup
- [ ] Database backup script created
- [ ] Automated backup scheduled (cron)
- [ ] Backup tested (restore test)
- [ ] Backup location secured

### Security
- [ ] HTTPS/SSL certificate installed (recommended)
- [ ] Firewall rules configured
- [ ] Database password strong
- [ ] Environment variables secured
- [ ] Unnecessary services disabled
- [ ] Regular security updates scheduled

### Documentation
- [ ] Database credentials saved securely
- [ ] Webhook secret saved
- [ ] Server IP documented
- [ ] Domain configuration documented (if any)
- [ ] Emergency contacts documented

## Optional Enhancements

### Domain & SSL
- [ ] Domain name configured
- [ ] DNS A record pointing to VPS IP
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Auto-renewal configured for SSL
- [ ] HTTP to HTTPS redirect enabled
- [ ] CORS_ORIGIN updated in .env

### Monitoring & Alerts
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry, Rollbar)
- [ ] Log aggregation (ELK, Papertrail)
- [ ] Email alerts configured
- [ ] SMS alerts for critical issues

### Performance Optimization
- [ ] Nginx caching configured
- [ ] Gzip compression enabled
- [ ] Static assets served efficiently
- [ ] Database connection pooling optimized
- [ ] Redis cache utilized

### High Availability
- [ ] Load balancer setup (jika multi-server)
- [ ] Database replication (jika critical)
- [ ] Automated failover configured
- [ ] CDN setup untuk static assets

## Troubleshooting Completed

Jika ada masalah, pastikan sudah checked:

- [ ] Checked PM2 logs: `pm2 logs`
- [ ] Checked system logs: `journalctl -xe`
- [ ] Checked Nginx logs: `/var/log/nginx/error.log`
- [ ] Checked PostgreSQL logs: `/var/log/postgresql/*.log`
- [ ] Checked disk space: `df -h`
- [ ] Checked memory: `free -h`
- [ ] Restarted services: `pm2 restart all`, `systemctl restart nginx`

## Sign-Off

### Deployment Team
- [ ] Deployed by: _______________
- [ ] Date: _______________
- [ ] Time: _______________

### Client Approval
- [ ] Client tested application
- [ ] Client approved deployment
- [ ] Credentials handed over
- [ ] Training completed (if applicable)

### Documentation
- [ ] Deployment notes documented
- [ ] Known issues documented
- [ ] Handover document created
- [ ] Access credentials secured

---

## Quick Validation Commands

Run these commands untuk quick check:

```bash
# 1. System services
systemctl status postgresql redis-server nginx

# 2. PM2 processes
pm2 status

# 3. Application health
curl http://localhost:3000/health

# 4. Database connection
psql -U wedding_user -d wedding_dashboard -c "SELECT 1;"

# 5. Comprehensive validation
./validate-deployment.sh
```

---

## Emergency Rollback Plan

Jika deployment failed:

1. Stop PM2 processes: `pm2 stop all`
2. Restore database dari backup: `psql -U wedding_user wedding_dashboard < backup.sql`
3. Revert code: `git reset --hard <previous-commit>`
4. Reinstall dependencies: `npm install --production`
5. Restart: `pm2 restart all`

---

## Contact & Support

- Repository: https://github.com/bengkelkayu/dashboard
- Documentation: README.md, DEPLOYMENT_VPS.md, INSTALL_VPS_ID.md
- Quick Reference: QUICK_REFERENCE.md

---

**Template Version**: 1.0
**Last Updated**: 2024
