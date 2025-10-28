#!/bin/bash

# MGNREGA Dashboard - Quick Start Script
# Built for Bharat by Aryan Jain

echo "🇮🇳 MGNREGA Dashboard - Build for Bharat"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Start development server
echo "🚀 Starting development server..."
echo ""
echo "Dashboard will open at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
