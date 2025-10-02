#!/bin/bash

# Quick Manual Deployment Commands
# Copy and paste these commands one by one into your VPS terminal

# 1. UPDATE SYSTEM
sudo apt-get update && sudo apt-get upgrade -y

# 2. INSTALL NODE.JS 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. INSTALL POSTGRESQL
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. INSTALL REDIS
sudo apt-get install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 5. INSTALL NGINX
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. INSTALL PM2
sudo npm install -g pm2

# 7. INSTALL GIT (if not installed)
sudo apt-get install -y git

# 8. CLONE REPOSITORY
cd ~
git clone https://github.com/bengkelkayu/dashboard.git
cd dashboard

# 9. INSTALL DEPENDENCIES
npm install --production

# 10. SETUP DATABASE
# Generate random password
DB_PASSWORD=$(openssl rand -base64 32)
echo "Database Password: $DB_PASSWORD"
echo "SAVE THIS PASSWORD!"

# Create database and user
sudo -u postgres psql << EOF
CREATE USER wedding_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE wedding_dashboard OWNER wedding_user;
GRANT ALL PRIVILEGES ON DATABASE wedding_dashboard TO wedding_user;
EOF

# 11. CREATE .ENV FILE
cat > .env << EOF
PORT=3000
NODE_ENV=production

DATABASE_URL=postgresql://wedding_user:$DB_PASSWORD@localhost:5432/wedding_dashboard
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wedding_dashboard
DB_USER=wedding_user
DB_PASSWORD=$DB_PASSWORD

REDIS_URL=redis://localhost:6379
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_KEY=your_api_key_here
WEBHOOK_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=*
EOF

# 12. RUN MIGRATIONS
npm run migrate

# 13. CONFIGURE NGINX
sudo tee /etc/nginx/sites-available/wedding-dashboard > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
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
EOF

sudo ln -sf /etc/nginx/sites-available/wedding-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 14. START APPLICATION WITH PM2
pm2 start backend/src/server.js --name wedding-api
pm2 start backend/src/workers/thankYouWorker.js --name wedding-worker
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save

# 15. CONFIGURE FIREWALL
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 16. DISPLAY INFO
echo ""
echo "========================================"
echo "✨ DEPLOYMENT COMPLETED!"
echo "========================================"
echo "Access your application at: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Database Password: $DB_PASSWORD"
echo "Webhook Secret: $(grep WEBHOOK_SECRET .env | cut -d '=' -f2)"
echo ""
echo "Useful commands:"
echo "  pm2 status       - Check status"
echo "  pm2 logs         - View logs"
echo "  pm2 monit        - Monitor"
echo "  pm2 restart all  - Restart"
echo "========================================"
