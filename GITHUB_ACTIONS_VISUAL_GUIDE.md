# 🎬 GitHub Actions Setup - Visual Guide

Panduan visual step-by-step untuk setup GitHub Actions deployment.

---

## 📋 Prerequisites

- ✅ Repository: `bengkelkayu/dashboard`
- ✅ VPS IP: `43.134.97.90`
- ✅ VPS Password: `23042015Ok$$`
- ✅ GitHub Account dengan akses ke repository

---

## 🎯 Step 1: Add GitHub Secrets

### 1.1. Open Repository Settings

```
1. Buka browser
2. Go to: https://github.com/bengkelkayu/dashboard
3. Klik tab: "Settings" (pojok kanan atas)
```

**Screenshot location:**
```
GitHub Repository → Settings (tab)
```

### 1.2. Navigate to Secrets

```
Settings → Sidebar kiri
   ↓
Secrets and variables
   ↓
Actions
```

**Visual path:**
```
Settings
  └─ Security (section)
      └─ Secrets and variables
          └─ Actions
```

### 1.3. Add First Secret (VPS_HOST)

```
1. Click: "New repository secret" (hijau button)
2. Name: VPS_HOST
3. Secret: 43.134.97.90
4. Click: "Add secret"
```

**Form:**
```
┌─────────────────────────────────────┐
│ New secret                          │
├─────────────────────────────────────┤
│                                     │
│ Name *                              │
│ ┌─────────────────────────────────┐ │
│ │ VPS_HOST                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Secret *                            │
│ ┌─────────────────────────────────┐ │
│ │ 43.134.97.90                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ Add secret ]                      │
└─────────────────────────────────────┘
```

### 1.4. Add Second Secret (VPS_PASSWORD)

```
1. Click: "New repository secret" lagi
2. Name: VPS_PASSWORD
3. Secret: 23042015Ok$$
4. Click: "Add secret"
```

**Form:**
```
┌─────────────────────────────────────┐
│ New secret                          │
├─────────────────────────────────────┤
│                                     │
│ Name *                              │
│ ┌─────────────────────────────────┐ │
│ │ VPS_PASSWORD                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Secret *                            │
│ ┌─────────────────────────────────┐ │
│ │ 23042015Ok$$                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ Add secret ]                      │
└─────────────────────────────────────┘
```

### 1.5. Verify Secrets

Setelah menambahkan, Anda akan melihat:

```
Repository secrets

┌────────────────────────────────────────────────┐
│ Name           │ Updated          │ Actions    │
├────────────────────────────────────────────────┤
│ VPS_HOST       │ just now        │ [Update] [Remove] │
│ VPS_PASSWORD   │ just now        │ [Update] [Remove] │
└────────────────────────────────────────────────┘
```

✅ **Step 1 Complete!**

---

## 🚀 Step 2: Run Workflow

### 2.1. Open Actions Tab

```
1. Buka: https://github.com/bengkelkayu/dashboard
2. Klik tab: "Actions"
```

**Tab location:**
```
Code | Issues | Pull requests | Actions | ... 
                               ^^^^^^^^
```

### 2.2. Select Workflow

Di sidebar kiri, akan ada 2 workflows:

```
All workflows
├─ Deploy to VPS
└─ Deploy to VPS (Password Auth)  ← Pilih ini!
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ Workflows                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ ○ Deploy to VPS                                 │
│                                                 │
│ ● Deploy to VPS (Password Auth)  ← Click here! │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.3. Run Workflow

```
1. Click: "Run workflow" (dropdown button kanan atas)
2. Branch: main (default)
3. Deployment type: full
4. Click: "Run workflow" (hijau button)
```

**Dropdown:**
```
┌─────────────────────────────────────┐
│ Run workflow                        │
├─────────────────────────────────────┤
│                                     │
│ Use workflow from                   │
│ ┌─────────────────────────────────┐ │
│ │ Branch: main               ▼    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Deployment type                     │
│ ┌─────────────────────────────────┐ │
│ │ full                       ▼    │ │
│ └─────────────────────────────────┘ │
│   • full                            │
│   • app-only                        │
│   • setup-only                      │
│                                     │
│ [ Run workflow ]                    │
└─────────────────────────────────────┘
```

### 2.4. Monitor Progress

Setelah klik "Run workflow", akan muncul workflow run baru:

```
┌────────────────────────────────────────────────────┐
│ Deploy to VPS (Password Auth) #1                   │
│ ● Running...                                       │
│                                                    │
│ deploy                                             │
│ ├─ Checkout repository          ✓                 │
│ ├─ Install sshpass              ✓                 │
│ ├─ Deploy to VPS (Full Setup)   ● Running...      │
│ ├─ Deploy Application            Waiting...       │
│ └─ Verify Deployment             Waiting...       │
│                                                    │
│ Duration: 5m 23s                                   │
└────────────────────────────────────────────────────┘
```

**Progress indicator:**
- ✓ = Completed
- ● = Running
- ○ = Waiting
- ✗ = Failed

### 2.5. View Logs

Klik pada workflow run untuk melihat logs detail:

```
┌────────────────────────────────────────────────────┐
│ Deploy to VPS (Full Setup)                         │
├────────────────────────────────────────────────────┤
│                                                    │
│ Run sshpass -p "***" ssh ...                       │
│                                                    │
│ ================================================   │
│ 🚀 Starting VPS Setup and Deployment               │
│ ================================================   │
│                                                    │
│ 📦 Updating system packages...                     │
│ ✓ System packages updated                          │
│                                                    │
│ 📦 Installing Node.js...                           │
│ ✓ Node.js installed: v18.20.0                      │
│                                                    │
│ 📦 Installing PostgreSQL...                        │
│ ✓ PostgreSQL installed                             │
│                                                    │
│ ...                                                │
└────────────────────────────────────────────────────┘
```

✅ **Step 2 Complete!**

---

## 🎉 Step 3: Verify Deployment

### 3.1. Check Workflow Status

Setelah semua steps selesai:

```
┌────────────────────────────────────────────────────┐
│ Deploy to VPS (Password Auth) #1                   │
│ ✓ Success                                          │
│                                                    │
│ deploy                                             │
│ ├─ Checkout repository          ✓ 5s              │
│ ├─ Install sshpass              ✓ 3s              │
│ ├─ Deploy to VPS (Full Setup)   ✓ 4m 30s          │
│ ├─ Deploy Application           ✓ 2m 15s          │
│ └─ Verify Deployment            ✓ 10s             │
│                                                    │
│ Total duration: 7m 3s                              │
└────────────────────────────────────────────────────┘
```

### 3.2. Access Application

Open browser:
```
http://43.134.97.90
```

You should see:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           Wedding Guest Dashboard                   │
│                                                     │
│     [📋 Daftar Tamu]  [➕ Tambah Tamu Baru]        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ No  Nama      Kategori  Status  Actions    │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 1   John Doe  👑 VVIP   ✓ Hadir  [Edit] [❌] │   │
│  │ 2   Jane Doe  ⭐ VIP    ✗ Belum  [Edit] [❌] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

✅ **Step 3 Complete! Application is live! 🎉**

---

## 📊 Status Indicators

### Workflow Status Icons
- ✓ (Green) = Success
- ● (Yellow) = Running
- ○ (Gray) = Waiting
- ✗ (Red) = Failed
- ⚠ (Orange) = Warning

### HTTP Status Codes
- 200 = Success
- 304 = Success (cached)
- 404 = Not found
- 500 = Server error
- 502 = Bad gateway (Nginx issue)

---

## 🔄 Update Workflow

Untuk update aplikasi di masa depan:

```
1. Go to Actions
2. Select: "Deploy to VPS (Password Auth)"
3. Click: "Run workflow"
4. Choose: "app-only"  ← Lebih cepat!
5. Click: "Run workflow"
6. Wait: 2-3 minutes
```

**Deployment type comparison:**

| Type | Duration | Use Case |
|------|----------|----------|
| **full** | 10 min | First time / Fresh VPS |
| **app-only** | 2-3 min | Code updates |
| **setup-only** | 5 min | System updates |

---

## 🆘 Common Issues

### Issue 1: Workflow Fails at SSH Connection

**Error message:**
```
Error: Connection refused
```

**Solution:**
1. Check VPS is online: `ping 43.134.97.90`
2. Verify secrets are correct
3. Try manual SSH: `ssh root@43.134.97.90`

### Issue 2: Database Creation Fails

**Error message:**
```
ERROR: database "wedding_dashboard" already exists
```

**Solution:** This is OK! Workflow will skip and continue.

### Issue 3: Application Returns 502

**Error message:**
```
⚠️ Warning: Application returned HTTP code 502
```

**Solution:**
```bash
# SSH to VPS
ssh root@43.134.97.90

# Check PM2
pm2 status
pm2 logs

# Restart
pm2 restart all
```

---

## 📞 Need Help?

### Quick Checks
```bash
# SSH to VPS
ssh root@43.134.97.90

# Check everything
pm2 status                    # PM2 processes
systemctl status nginx        # Nginx
systemctl status postgresql   # PostgreSQL
systemctl status redis-server # Redis
```

### Logs
```bash
# Application logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -xe
```

### Restart Everything
```bash
pm2 restart all
systemctl restart nginx
systemctl restart postgresql
systemctl restart redis-server
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Workflow shows green checkmark
- [ ] All steps completed successfully
- [ ] Can access http://43.134.97.90
- [ ] Dashboard loads properly
- [ ] Can add/edit/delete guests
- [ ] PM2 shows 2 running processes
- [ ] No errors in pm2 logs

---

## 🎓 Pro Tips

1. **Use app-only for updates** - Much faster (2-3 min vs 10 min)
2. **Monitor logs** - Always check PM2 logs after deployment
3. **Save credentials** - Database password is shown in deployment logs
4. **Backup regularly** - Setup automated backups (see security guide)
5. **Use SSH keys** - More secure than password (see advanced guide)

---

## 🚀 You're Ready!

Now you can deploy with just a few clicks! 🎉

**Remember:**
- First deployment: Choose "full"
- Code updates: Choose "app-only"
- Need help: Check logs in GitHub Actions

**Happy deploying! 🚀**
