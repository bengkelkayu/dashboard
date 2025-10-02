#!/bin/bash

# VPS Deployment Script for Wedding Guest Dashboard
# This script will install and configure all dependencies on Ubuntu/Debian VPS

set -e

echo "================================================"
echo "🚀 Wedding Guest Dashboard - VPS Deployment"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Update system packages
echo ""
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
print_success "System packages updated"

# Install Node.js (v18 LTS)
echo ""
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_info "Node.js already installed: $(node --version)"
fi

# Install PostgreSQL
echo ""
echo "📦 Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed: $(psql --version | awk '{print $3}')"
else
    print_info "PostgreSQL already installed: $(psql --version | awk '{print $3}')"
fi

# Install Redis
echo ""
echo "📦 Installing Redis..."
if ! command -v redis-cli &> /dev/null; then
    sudo apt-get install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    print_success "Redis installed: $(redis-cli --version)"
else
    print_info "Redis already installed: $(redis-cli --version)"
fi

# Install Nginx
echo ""
echo "📦 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx installed"
else
    print_info "Nginx already installed"
fi

# Install PM2 globally
echo ""
echo "📦 Installing PM2 Process Manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_info "PM2 already installed"
fi

# Setup PostgreSQL database
echo ""
echo "🗄️  Setting up PostgreSQL database..."
DB_NAME="wedding_dashboard"
DB_USER="wedding_user"
DB_PASSWORD=$(openssl rand -base64 32)

# Create PostgreSQL user and database
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${DB_USER}') THEN
        CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOF

print_success "Database created: ${DB_NAME}"
print_info "Database user: ${DB_USER}"

# Configure PostgreSQL to accept connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql

# Get current directory
DEPLOY_DIR=$(pwd)

# Install application dependencies
echo ""
echo "📦 Installing application dependencies..."
npm install --production
print_success "Dependencies installed"

# Create .env file
echo ""
echo "📝 Creating production environment configuration..."
cat > .env << EOF
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Redis Configuration (for Bull queue)
REDIS_URL=redis://localhost:6379

# WhatsApp API Configuration (optional - configure later)
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_KEY=your_api_key_here

# Digital Guestbook Webhook Secret
WEBHOOK_SECRET=$(openssl rand -hex 32)

# Application Configuration
CORS_ORIGIN=*
EOF

print_success ".env file created"

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
npm run migrate
print_success "Migrations completed"

# Optional: Seed sample data
echo ""
read -p "Do you want to seed sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
    print_success "Sample data seeded"
fi

# Configure Nginx reverse proxy
echo ""
echo "🌐 Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/wedding-dashboard > /dev/null << EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/wedding-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
print_success "Nginx configured and reloaded"

# Start application with PM2
echo ""
echo "🚀 Starting application with PM2..."

# Stop existing processes if any
pm2 delete wedding-api 2>/dev/null || true
pm2 delete wedding-worker 2>/dev/null || true

# Start the server
pm2 start backend/src/server.js --name wedding-api --log-date-format "YYYY-MM-DD HH:mm:ss Z"

# Start the worker
pm2 start backend/src/workers/thankYouWorker.js --name wedding-worker --log-date-format "YYYY-MM-DD HH:mm:ss Z"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save

print_success "Application started with PM2"

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw --force enable
    print_success "Firewall configured"
else
    print_info "UFW firewall not installed, skipping..."
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Display completion message
echo ""
echo "================================================"
echo "✨ Deployment completed successfully!"
echo "================================================"
echo ""
echo "📊 Application Information:"
echo "   - Server IP: ${SERVER_IP}"
echo "   - URL: http://${SERVER_IP}"
echo "   - Database: ${DB_NAME}"
echo "   - Database User: ${DB_USER}"
echo ""
echo "🔐 Important Credentials (SAVE THESE):"
echo "   - Database Password: ${DB_PASSWORD}"
echo "   - Webhook Secret: $(grep WEBHOOK_SECRET .env | cut -d '=' -f2)"
echo ""
echo "📝 Useful PM2 Commands:"
echo "   - View logs: pm2 logs"
echo "   - Monitor: pm2 monit"
echo "   - Restart: pm2 restart all"
echo "   - Stop: pm2 stop all"
echo "   - Status: pm2 status"
echo ""
echo "🌐 Access your dashboard at: http://${SERVER_IP}"
echo ""
echo "⚠️  Next Steps:"
echo "   1. Configure your domain DNS to point to ${SERVER_IP}"
echo "   2. Install SSL certificate (recommended: certbot)"
echo "   3. Update CORS_ORIGIN in .env if needed"
echo "   4. Configure WhatsApp API credentials in .env"
echo ""
echo "================================================"
