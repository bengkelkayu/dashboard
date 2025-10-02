#!/bin/bash

# Deployment Validation Script
# Run this on VPS after deployment to verify everything is working

echo "=========================================="
echo "🔍 Wedding Dashboard Deployment Validation"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✓ $name is running${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ $name is NOT running${NC}"
        ((FAILED++))
        return 1
    fi
}

check_command() {
    local cmd=$1
    local name=$2
    
    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n1)
        echo -e "${GREEN}✓ $name is installed: $version${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ $name is NOT installed${NC}"
        ((FAILED++))
        return 1
    fi
}

check_port() {
    local port=$1
    local name=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo -e "${GREEN}✓ Port $port ($name) is listening${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ Port $port ($name) is NOT listening${NC}"
        ((FAILED++))
        return 1
    fi
}

check_http() {
    local url=$1
    local name=$2
    
    if curl -s -f -o /dev/null "$url"; then
        echo -e "${GREEN}✓ $name is accessible${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ $name is NOT accessible${NC}"
        ((FAILED++))
        return 1
    fi
}

# Check system services
echo "1. Checking System Services..."
check_service "postgresql" "PostgreSQL"
check_service "redis-server" "Redis"
check_service "nginx" "Nginx"
echo ""

# Check installed software
echo "2. Checking Installed Software..."
check_command "node" "Node.js"
check_command "npm" "NPM"
check_command "pm2" "PM2"
check_command "psql" "PostgreSQL Client"
check_command "redis-cli" "Redis Client"
echo ""

# Check listening ports
echo "3. Checking Listening Ports..."
check_port "5432" "PostgreSQL"
check_port "6379" "Redis"
check_port "80" "Nginx"
check_port "3000" "Application"
echo ""

# Check PM2 processes
echo "4. Checking PM2 Processes..."
if pm2 list | grep -q "wedding-api.*online"; then
    echo -e "${GREEN}✓ wedding-api is running${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ wedding-api is NOT running${NC}"
    ((FAILED++))
fi

if pm2 list | grep -q "wedding-worker.*online"; then
    echo -e "${GREEN}✓ wedding-worker is running${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ wedding-worker is NOT running${NC}"
    ((FAILED++))
fi
echo ""

# Check database connection
echo "5. Checking Database Connection..."
if [ -f .env ]; then
    source .env
    if psql -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✓ Database connection successful${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Database connection failed${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
fi
echo ""

# Check HTTP endpoints
echo "6. Checking HTTP Endpoints..."
check_http "http://localhost:3000/health" "Health endpoint"
check_http "http://localhost:3000/api" "API root"
check_http "http://localhost:80" "Nginx proxy"
echo ""

# Check disk space
echo "7. Checking Disk Space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓ Disk space OK: ${DISK_USAGE}% used${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Disk space warning: ${DISK_USAGE}% used${NC}"
fi
echo ""

# Check memory
echo "8. Checking Memory..."
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -lt 90 ]; then
    echo -e "${GREEN}✓ Memory OK: ${MEM_USAGE}% used${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Memory high: ${MEM_USAGE}% used${NC}"
fi
echo ""

# Check .env file exists
echo "9. Checking Configuration..."
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ .env file missing${NC}"
    ((FAILED++))
fi

if [ -f backend/src/server.js ]; then
    echo -e "${GREEN}✓ Application files exist${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Application files missing${NC}"
    ((FAILED++))
fi
echo ""

# Final summary
echo "=========================================="
echo "📊 Validation Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Deployment is successful!${NC}"
    echo ""
    echo "🌐 Access your application at:"
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "   http://$SERVER_IP"
    exit 0
else
    echo -e "${RED}⚠ Some checks failed. Please review the errors above.${NC}"
    echo ""
    echo "📝 Troubleshooting tips:"
    echo "   1. Check PM2 logs: pm2 logs"
    echo "   2. Check service status: systemctl status <service>"
    echo "   3. Review deployment logs"
    echo "   4. See DEPLOYMENT_VPS.md for troubleshooting"
    exit 1
fi
