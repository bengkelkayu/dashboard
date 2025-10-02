#!/bin/bash

echo "================================================"
echo "🔍 Verifying Build Configuration"
echo "================================================"
echo ""

# Check Node.js
echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Check dependencies
echo "📦 Checking critical dependencies..."

check_dep() {
    if npm list "$1" 2>&1 | grep -q "$1@"; then
        VERSION=$(npm list "$1" 2>&1 | grep "$1@" | head -1 | sed 's/.*@//' | sed 's/ .*//')
        echo "  ✓ $1@$VERSION"
        return 0
    else
        echo "  ✗ $1 NOT FOUND"
        return 1
    fi
}

DEPS=(
    "@whiskeysockets/baileys"
    "audio-decode"
    "jimp"
    "link-preview-js"
    "sharp"
    "express"
    "pg"
    "bull"
    "qrcode"
)

ALL_OK=true
for dep in "${DEPS[@]}"; do
    check_dep "$dep" || ALL_OK=false
done

echo ""

# Check syntax of main files
echo "📝 Checking syntax of main files..."
FILES=(
    "backend/src/server.js"
    "backend/src/services/whatsappService.js"
    "backend/src/controllers/whatsappController.js"
    "backend/src/routes/whatsapp.js"
)

for file in "${FILES[@]}"; do
    if node --check "$file" 2>&1; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file FAILED"
        ALL_OK=false
    fi
done

echo ""

# Check workflow files
echo "🔧 Checking workflow files..."
if python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-vps.yml'))" 2>&1; then
    echo "  ✓ .github/workflows/deploy-vps.yml"
else
    echo "  ✗ .github/workflows/deploy-vps.yml FAILED"
    ALL_OK=false
fi

if python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-vps-password.yml'))" 2>&1; then
    echo "  ✓ .github/workflows/deploy-vps-password.yml"
else
    echo "  ✗ .github/workflows/deploy-vps-password.yml FAILED"
    ALL_OK=false
fi

echo ""

# Final result
if [ "$ALL_OK" = true ]; then
    echo "================================================"
    echo "✅ All checks passed! Build is ready."
    echo "================================================"
    echo ""
    echo "Next steps:"
    echo "1. Set GitHub Secrets (VPS_HOST, VPS_PASSWORD)"
    echo "2. Trigger workflow: Deploy to VPS (Password Auth)"
    echo "3. Wait for deployment to complete"
    echo "4. Access your app at http://YOUR_VPS_IP"
    exit 0
else
    echo "================================================"
    echo "❌ Some checks failed. Please fix the issues."
    echo "================================================"
    exit 1
fi
