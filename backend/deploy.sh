#!/bin/bash

# MGNREGA Backend Deployment Script for VPS

echo "🚀 Starting MGNREGA Backend Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx (reverse proxy)
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Create database and user
echo "🗄️  Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE mgnrega_db;
CREATE USER mgnrega_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE mgnrega_db TO mgnrega_user;
\q
EOF

# Clone repository (replace with your repo URL)
echo "📥 Cloning repository..."
cd /home/ubuntu
git clone https://github.com/gitsofaryan/desh-lekha.git
cd desh-lekha/backend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production

# Copy .env.example to .env and configure
echo "⚙️  Setting up environment variables..."
cp .env.example .env

# Update .env with production values
cat > .env << EOF
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=mgnrega_db
DB_USER=mgnrega_user
DB_PASSWORD=your_secure_password_here

GOV_API_URL=https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722
GOV_API_KEY=

CACHE_TTL=14400000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=http://localhost:3000,http://your-domain.com

SYNC_CRON_SCHEDULE=0 */4 * * *
SYNC_ON_STARTUP=true

LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF

echo "⚠️  IMPORTANT: Edit /home/ubuntu/desh-lekha/backend/.env and update:"
echo "   - DB_PASSWORD"
echo "   - CORS_ORIGIN (add your frontend domain)"
echo "   - GOV_API_KEY (if available)"

# Initialize database tables
echo "🗄️  Initializing database tables..."
node -e "
  require('dotenv').config();
  const db = require('./db/database');
  (async () => {
    await db.connect();
    await db.initTables();
    await db.disconnect();
    console.log('Database initialized successfully');
    process.exit(0);
  })();
"

# Initial data sync
echo "📊 Running initial data sync..."
node -e "
  require('dotenv').config();
  const { syncAllStatesData } = require('./services/syncService');
  const db = require('./db/database');
  (async () => {
    await db.connect();
    await syncAllStatesData();
    await db.disconnect();
    console.log('Initial sync completed');
    process.exit(0);
  })();
"

# Start with PM2
echo "🚀 Starting backend server with PM2..."
pm2 start server.js --name mgnrega-backend
pm2 save
pm2 startup

# Configure Nginx reverse proxy
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mgnrega-backend > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:5000;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/mgnrega-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Backend deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file: nano /home/ubuntu/desh-lekha/backend/.env"
echo "2. Update DB_PASSWORD, CORS_ORIGIN, and other settings"
echo "3. Restart PM2: pm2 restart mgnrega-backend"
echo "4. Check logs: pm2 logs mgnrega-backend"
echo "5. Test API: curl http://localhost:5000/health"
echo ""
echo "🌐 Your backend API will be available at: http://your-domain.com/api"
