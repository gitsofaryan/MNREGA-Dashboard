# MGNREGA Dashboard - Complete Setup Guide

This guide will help you set up both frontend and backend for local development or production deployment.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Git ([Download](https://git-scm.com/))

### 1. Clone Repository
```bash
git clone https://github.com/gitsofaryan/desh-lekha.git
cd desh-lekha
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# On Windows: notepad .env
# On Mac/Linux: nano .env

# Initialize database (creates tables)
npm run init-db

# Sync initial data (takes 5-10 minutes)
npm run sync-data

# Start backend server
npm start
```

Backend runs at: **http://localhost:5000**

Test it: Open browser and visit `http://localhost:5000/health`

### 3. Setup Frontend

Open new terminal:

```bash
cd ..  # Back to root directory

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 4. Verify Setup

1. Open browser: `http://localhost:5173`
2. You should see the MGNREGA Dashboard
3. Select state "Madhya Pradesh"
4. Data should load (500 districts)
5. Check browser DevTools Network tab:
   - Requests should go to `http://localhost:5000/api/...`
   - Response should include `"source": "cache"` or `"source": "database"`

✅ **Success!** Both frontend and backend are running.

---

## 📦 Production Deployment

### Deploy Backend to VPS

**Option 1: Automated Script**
```bash
ssh ubuntu@your-vps-ip
curl -fsSL https://raw.githubusercontent.com/gitsofaryan/desh-lekha/main/backend/deploy.sh | bash
```

**Option 2: Manual Setup**

See detailed guide: **[backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)**

Quick steps:
1. SSH into VPS: `ssh ubuntu@your-vps-ip`
2. Install Node.js, PostgreSQL, PM2, Nginx
3. Clone repo and install dependencies
4. Configure `.env` with database credentials
5. Initialize database and sync data
6. Start with PM2: `pm2 start server.js --name mgnrega-backend`
7. Configure Nginx reverse proxy
8. Set up SSL with Let's Encrypt (optional)

Backend URL: `http://your-vps-ip:5000` or `https://api.yourdomain.com`

### Deploy Frontend to Netlify

```bash
# Build for production
npm run build

# Deploy to Netlify
# Install Netlify CLI: npm install -g netlify-cli
netlify deploy --prod

# OR: Connect GitHub repo in Netlify dashboard
```

**Set Environment Variable in Netlify**:
- Go to: Site Settings → Build & Deploy → Environment
- Add: `VITE_API_URL` = `https://api.yourdomain.com`

Frontend URL: `https://your-app.netlify.app`

### Deploy Frontend to Vercel

```bash
# Build for production
npm run build

# Deploy to Vercel
# Install Vercel CLI: npm install -g vercel
vercel --prod

# OR: Connect GitHub repo in Vercel dashboard
```

**Set Environment Variable in Vercel**:
- Go to: Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://api.yourdomain.com`

Frontend URL: `https://your-app.vercel.app`

### Update Backend CORS

After deploying frontend, update backend `.env`:

```env
CORS_ORIGIN=https://your-app.netlify.app,https://your-app.vercel.app
```

Restart backend:
```bash
pm2 restart mgnrega-backend
```

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Get all states
curl http://localhost:5000/api/states

# Get districts for Madhya Pradesh
curl http://localhost:5000/api/districts/MADHYA%20PRADESH

# Get MGNREGA data
curl "http://localhost:5000/api/data/MADHYA%20PRADESH?finYear=2024-2025&month=4"

# Get aggregated statistics
curl "http://localhost:5000/api/stats/MADHYA%20PRADESH?finYear=2024-2025"

# Manually trigger data sync
curl -X POST http://localhost:5000/api/sync/MADHYA%20PRADESH

# Get cache statistics
curl http://localhost:5000/api/cache/stats

# Clear cache
curl -X DELETE http://localhost:5000/api/cache/clear
```

### Test Frontend Features

1. **Overview Tab**
   - Select state "Madhya Pradesh"
   - Verify all 6 metric cards show data
   - Verify 3D map renders with location
   - Verify summary statistics appear

2. **Leaderboard Tab**
   - Check top 10 districts appear
   - Verify podium animation (🥇🥈🥉)
   - Verify all metrics are sortable

3. **Compare Tab**
   - Select two districts
   - Verify bar chart shows comparison (blue vs orange)
   - Verify radar chart shows normalized performance
   - Verify winner indicators (green border + trophy)
   - Verify overall winner banner appears

4. **Visualizer Tab**
   - Verify 5 big emoji metric cards
   - Verify progress bars (no math, just look at bar)
   - Verify bar chart (metrics overview)
   - Verify pie chart (active vs inactive workers)
   - Verify quick summary cards

5. **Low-Literacy Features**
   - All numbers formatted with commas (12,34,567)
   - All percentages shown with % symbol
   - All charts have color coding (green = good, red = bad)
   - All cards have emoji icons
   - All text uses simple language

6. **Multi-Language**
   - Click language toggle (🌐)
   - Switch between English and Hindi
   - Verify all text translates
   - Use Google Translate for other languages

7. **PWA/Offline**
   - Load app (data cached)
   - Disconnect internet
   - Refresh page
   - App should still work (from cache)

---

## 📊 Project Structure

```
desh-lekha/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OverviewPanel.jsx       # Main dashboard
│   │   │   ├── LeaderboardPanel.jsx    # Top 10 rankings
│   │   │   ├── ComparePanel.jsx        # District comparison
│   │   │   ├── SimulatorPanel.jsx      # Data visualizer
│   │   │   ├── NavBar.jsx              # Top navigation
│   │   │   ├── SideNav.jsx             # Side navigation
│   │   │   ├── DistrictDataTable.jsx   # Data table
│   │   │   └── LoadingSkeleton.jsx     # Loading UI
│   │   ├── hooks/
│   │   │   └── useMGNREGAData.js       # Data fetching
│   │   ├── i18n/
│   │   │   ├── config.js               # i18next setup
│   │   │   └── locales/
│   │   │       ├── en.json             # English translations
│   │   │       └── hi.json             # Hindi translations
│   │   ├── App.jsx                     # Main app component
│   │   └── main.jsx                    # React entry point
│   ├── public/
│   │   └── service-worker.js           # PWA offline support
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── db/
│   │   └── database.js                 # PostgreSQL schema
│   ├── routes/
│   │   └── api.js                      # REST API endpoints
│   ├── services/
│   │   └── syncService.js              # Government API sync
│   ├── utils/
│   │   └── logger.js                   # Winston logging
│   ├── scripts/
│   │   ├── init-db.js                  # Database initialization
│   │   └── sync-data.js                # Manual data sync
│   ├── logs/                           # Log files (auto-created)
│   ├── server.js                       # Express app entry
│   ├── package.json
│   ├── .env.example                    # Environment template
│   ├── README.md                       # Backend documentation
│   ├── DEPLOYMENT.md                   # VPS deployment guide
│   └── deploy.sh                       # Auto-deployment script
│
├── README.md                           # Main project README
├── ARCHITECTURE.md                     # Technical decisions
├── PRODUCTION_READINESS.md             # Production checklist
└── FRONTEND_INTEGRATION.md             # Frontend-Backend integration
```

---

## 🛠️ Development Workflow

### Making Changes

1. **Frontend Changes**
   ```bash
   # Start dev server (hot reload enabled)
   npm run dev
   
   # Make changes to files in src/
   # Browser auto-refreshes
   ```

2. **Backend Changes**
   ```bash
   # Start dev server with auto-reload
   cd backend
   npm run dev
   
   # Make changes to files
   # Server auto-restarts
   ```

### Adding New States

1. **Update Backend Sync Service**

   Edit `backend/services/syncService.js`:
   ```javascript
   const STATES_TO_SYNC = [
     'MADHYA PRADESH',
     'UTTAR PRADESH',  // Add new state here
     'RAJASTHAN'        // Add another state
   ];
   ```

2. **Run Manual Sync**
   ```bash
   cd backend
   npm run sync-data
   ```

3. **No Frontend Changes Needed**
   - Frontend auto-detects available states from backend

### Database Maintenance

```bash
# Check database status
sudo -u postgres psql -d mgnrega_db

# Inside PostgreSQL shell:

-- Check record counts
SELECT COUNT(*) FROM states;
SELECT COUNT(*) FROM districts;
SELECT COUNT(*) FROM mgnrega_data;

-- Check storage size
SELECT 
  pg_size_pretty(pg_total_relation_size('mgnrega_data')) as size;

-- Check latest sync timestamp
SELECT MAX(updated_at) FROM mgnrega_data;

-- Manually delete old data (if needed)
DELETE FROM mgnrega_data 
WHERE updated_at < NOW() - INTERVAL '30 days';

-- Exit
\q
```

---

## 📈 Monitoring

### Backend Monitoring (PM2)

```bash
# Check status
pm2 status

# View logs (real-time)
pm2 logs mgnrega-backend

# Monitor CPU/Memory
pm2 monit

# Restart if needed
pm2 restart mgnrega-backend
```

### Application Logs

```bash
# Backend logs
tail -f backend/logs/app.log      # All logs
tail -f backend/logs/error.log    # Errors only

# Filter for specific events
grep "sync" backend/logs/app.log  # Sync operations
grep "cache" backend/logs/app.log # Cache operations
```

### Database Monitoring

```bash
# PostgreSQL activity
sudo -u postgres psql -c "
  SELECT * FROM pg_stat_activity 
  WHERE datname = 'mgnrega_db';
"

# Slow queries
sudo -u postgres psql -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Server won't start
```bash
# Solution 1: Check port availability
lsof -i :5000
# If port is in use, kill the process or change PORT in .env

# Solution 2: Check logs
npm run dev  # See detailed error messages
```

**Problem**: Database connection failed
```bash
# Solution: Check PostgreSQL is running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Test connection manually
psql -h localhost -U mgnrega_user -d mgnrega_db
```

**Problem**: Data sync fails
```bash
# Solution: Check logs
tail -f backend/logs/error.log

# Test government API manually
curl "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?limit=1"
```

### Frontend Issues

**Problem**: CORS errors
```bash
# Solution: Update backend .env
CORS_ORIGIN=http://localhost:5173

# Restart backend
pm2 restart mgnrega-backend
```

**Problem**: Data not loading
```bash
# Solution 1: Check backend is running
curl http://localhost:5000/health

# Solution 2: Check API URL in frontend .env
cat .env  # Should show: VITE_API_URL=http://localhost:5000

# Solution 3: Clear cache
# In browser: DevTools → Application → Clear Storage
```

**Problem**: Build fails
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Documentation

- **[README.md](./README.md)** - Main project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical decisions explained
- **[PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)** - Production deployment checklist
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)** - VPS deployment guide
- **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)** - Frontend-Backend connection guide

---

## 🎥 Demo Video (Loom)

For Build for Bharat Fellowship submission, record a <2 minute Loom video covering:

1. **Features Demo (0:00-0:40)**
   - Overview tab: Show all metrics, map, summary
   - Leaderboard tab: Show rankings, podium
   - Compare tab: Show charts, winner indicators
   - Visualizer tab: Show emoji cards, progress bars

2. **Low-Literacy Design (0:40-0:55)**
   - Show color coding (green/red)
   - Show emoji icons
   - Show progress bars (visual, no math)
   - Show Google Translate

3. **Backend Architecture (0:55-1:20)**
   - Show database in PostgreSQL
   - Show API endpoint response
   - Show cron job logs (auto-sync)
   - Show caching (source: cache/database)

4. **Production Readiness (1:20-1:45)**
   - Show deployed frontend URL
   - Show deployed backend URL
   - Show offline PWA (disconnect internet)
   - Show error handling

5. **Code Walkthrough (1:45-2:00)**
   - Show cache-first strategy code
   - Show calculateStats function
   - Show database schema
   - Wrap up

---

## 🚀 Fellowship Submission Checklist

- [ ] Backend deployed to VPS (DigitalOcean/AWS)
- [ ] Database initialized with 500+ records
- [ ] Frontend deployed to Netlify/Vercel
- [ ] Both hosted URLs working
- [ ] Loom video recorded (<2 minutes)
- [ ] All 4 tabs working (Overview, Leaderboard, Compare, Visualizer)
- [ ] Multi-language working (English + Hindi + Google Translate)
- [ ] Offline PWA working
- [ ] Low-literacy features verified (charts, emojis, progress bars)
- [ ] README updated with hosted URLs
- [ ] Fellowship form filled with:
  - Public Tech Challenge answer
  - Loom video URL
  - Frontend hosted URL
  - Backend hosted URL (optional but impressive)

---

## 📧 Support

- **GitHub Issues**: https://github.com/gitsofaryan/desh-lekha/issues
- **Email**: aryanjain7827@gmail.com

---

**Built for Build for Bharat Fellowship 2026** 🇮🇳

**Good luck with your submission!** 🚀
