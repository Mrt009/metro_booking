#!/bin/bash

# Metro Ticket Booking System - Quick Setup Script
echo "🚊 Metro Ticket Booking System Setup"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Environment file created from .env.example"
    else
        echo "⚠️  No .env.example found, creating basic .env file"
        cat > .env << EOL
NODE_ENV=development
PORT=3000
DB_PATH=./metro_booking.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
APP_NAME=Metro Ticket Booking
APP_VERSION=1.0.0
SUPPORT_EMAIL=support@metrobook.com
EOL
    fi
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "  npm start          # Production mode"
echo "  npm run dev        # Development mode (with auto-restart)"
echo ""
echo "The application will be available at: http://localhost:3000"
echo ""
echo "📖 For detailed documentation, see README.md"
echo "🐛 For issues, visit: https://github.com/Mrt009/metro_booking/issues"
echo ""
echo "Happy coding! 🚀"
