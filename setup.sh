#!/bin/bash

# Setup script for Wedding Guest Dashboard

echo "🎉 Wedding Guest Dashboard Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH."
    echo "   Please ensure PostgreSQL is installed and running."
else
    echo "✓ PostgreSQL $(psql --version | awk '{print $3}') found"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please edit .env and configure your database settings:"
    echo "   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    echo ""
    read -p "Press Enter to continue after you've configured .env..."
else
    echo "✓ .env file exists"
fi

# Prompt for database setup
echo ""
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🗄️  Running database migrations..."
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "✓ Migrations completed successfully"
        
        echo ""
        read -p "Do you want to seed sample data? (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo "🌱 Seeding sample data..."
            npm run seed
            echo "✓ Sample data seeded"
        fi
    else
        echo "❌ Migration failed. Please check your database configuration."
        exit 1
    fi
fi

echo ""
echo "================================"
echo "✨ Setup completed!"
echo ""
echo "To start the application:"
echo "  npm run dev    - Start development server with auto-reload"
echo "  npm start      - Start production server"
echo "  npm run worker - Start background worker for thank you messages"
echo ""
echo "The application will run on http://localhost:3000"
echo "================================"
