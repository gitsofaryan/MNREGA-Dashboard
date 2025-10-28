# 🎯 Build for Bharat Fellowship - Deployment Checklist

Use this checklist to track your deployment progress. Check off each item as you complete it.

---

## 📋 Pre-Deployment Validation

- [ ] Run validation script: `.\validate-backend.ps1`
- [ ] All validation checks pass (0 errors)
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed (for local testing)
- [ ] All documentation files present (7 docs)
- [ ] All backend files present (10+ files)
- [ ] `.env.example` exists in backend folder
- [ ] `.gitignore` configured properly

---

## 🖥️ Local Testing (Backend)

- [ ] Navigate to backend: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Edit `.env` with local database credentials:
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_NAME=mgnrega_db`
  - [ ] `DB_USER=mgnrega_user`
  - [ ] `DB_PASSWORD=your_password_here`
- [ ] Create PostgreSQL database:
  - [ ] `sudo -u postgres psql`
  - [ ] `CREATE DATABASE mgnrega_db;`
  - [ ] `CREATE USER mgnrega_user WITH PASSWORD 'your_password';`
  - [ ] `GRANT ALL PRIVILEGES ON DATABASE mgnrega_db TO mgnrega_user;`
- [ ] Initialize database: `npm run init-db`
- [ ] Sync initial data: `npm run sync-data` (takes 5-10 minutes)
- [ ] Start backend: `npm start`
- [ ] Test health endpoint: `curl http://localhost:5000/health`
- [ ] Test states endpoint: `curl http://localhost:5000/api/states`
- [ ] Test data endpoint: `curl "http://localhost:5000/api/data/MADHYA%20PRADESH?finYear=2024-2025&month=4"`
- [ ] Verify 500 records returned
- [ ] Backend logs show no errors

---

## 🌐 Local Testing (Frontend)

- [ ] Navigate to root: `cd ..`
- [ ] Install dependencies: `npm install` (if not done)
- [ ] Create `.env` file: `echo "VITE_API_URL=http://localhost:5000" > .env`
- [ ] Start frontend: `npm run dev`
- [ ] Open browser: `http://localhost:5173`
- [ ] Test Overview tab:
  - [ ] Select "Madhya Pradesh" state
  - [ ] 6 metric cards show data
  - [ ] 3D map renders
  - [ ] District summary appears
- [ ] Test Leaderboard tab:
  - [ ] Top 10 districts appear
  - [ ] Podium animation works (🥇🥈🥉)
  - [ ] Metrics are sortable
- [ ] Test Compare tab:
  - [ ] Select two districts
  - [ ] Bar chart appears (blue vs orange)
  - [ ] Radar chart appears
  - [ ] Winner indicators show (green border + trophy)
  - [ ] Overall winner banner appears
- [ ] Test Visualizer tab:
  - [ ] 5 big emoji metric cards appear
  - [ ] Progress bars show correctly
  - [ ] Bar chart (metrics overview) appears
  - [ ] Pie chart (active vs inactive) appears
- [ ] Test language switching:
  - [ ] Click language toggle (🌐)
  - [ ] Switch to Hindi
  - [ ] All text translates
  - [ ] Numbers format correctly (12,34,567)
- [ ] Test Google Translate:
  - [ ] Widget appears in top-right
  - [ ] Can translate to other languages
- [ ] Test offline mode:
  - [ ] Load app (data cached)
  - [ ] Stop backend server
  - [ ] Refresh page
  - [ ] App still works (from localStorage)
- [ ] Check browser DevTools:
  - [ ] No console errors
  - [ ] No CORS errors
  - [ ] Requests go to `http://localhost:5000/api/...`
  - [ ] Response includes `"source": "cache"` or `"source": "database"`

---

## ☁️ VPS Setup

- [ ] **Provision VPS**:
  - [ ] Create account on DigitalOcean / AWS / Azure
  - [ ] Create new Droplet/VM (2GB RAM minimum, 4GB recommended)
  - [ ] Operating System: Ubuntu 20.04 or 22.04
  - [ ] Note VPS IP address: `________________`
- [ ] **SSH Access**:
  - [ ] Generate SSH key (if needed): `ssh-keygen`
  - [ ] Add SSH key to VPS
  - [ ] Test SSH connection: `ssh ubuntu@your-vps-ip`
- [ ] **Domain Setup** (optional but recommended):
  - [ ] Buy domain from Namecheap/GoDaddy/etc.
  - [ ] Create A record pointing to VPS IP
  - [ ] Wait for DNS propagation (2-24 hours)
  - [ ] Note domain: `________________`

---

## 🚀 Backend Deployment to VPS

**Option A: Automated Deployment (Recommended)**
- [ ] SSH into VPS: `ssh ubuntu@your-vps-ip`
- [ ] Run deployment script:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/gitsofaryan/desh-lekha/main/backend/deploy.sh | bash
  ```
- [ ] Edit `.env` file:
  ```bash
  cd /home/ubuntu/desh-lekha/backend
  nano .env
  ```
- [ ] Update values:
  - [ ] `DB_PASSWORD` - Strong password (16+ chars)
  - [ ] `CORS_ORIGIN` - Your frontend domain (update later)
  - [ ] `GOV_API_KEY` - Government API key (optional)
- [ ] Restart backend: `pm2 restart mgnrega-backend`

**Option B: Manual Deployment**
- [ ] Follow step-by-step guide in `backend/DEPLOYMENT.md`
- [ ] Install Node.js 18+
- [ ] Install PostgreSQL 14+
- [ ] Install PM2
- [ ] Install Nginx
- [ ] Clone repository
- [ ] Configure `.env`
- [ ] Initialize database
- [ ] Sync data
- [ ] Start with PM2
- [ ] Configure Nginx

---

## ✅ Backend Verification

- [ ] Health check: `curl http://your-vps-ip:5000/health`
- [ ] Expected: `{"status":"healthy","timestamp":"..."}`
- [ ] States endpoint: `curl http://your-vps-ip:5000/api/states`
- [ ] Expected: `{"success":true,"data":[...]}`
- [ ] Data endpoint: `curl "http://your-vps-ip:5000/api/data/MADHYA%20PRADESH?finYear=2024-2025&month=4"`
- [ ] Expected: 500 records with all metrics
- [ ] PM2 status: `pm2 status`
- [ ] Expected: `mgnrega-backend` online
- [ ] PM2 logs: `pm2 logs mgnrega-backend`
- [ ] Expected: No errors, sync logs every 4 hours
- [ ] Database check:
  ```bash
  sudo -u postgres psql -d mgnrega_db -c "SELECT COUNT(*) FROM mgnrega_data;"
  ```
- [ ] Expected: 500+ records
- [ ] Note backend URL: `http://________________:5000`

---

## 🌍 Frontend Deployment to Netlify

- [ ] **Create Netlify Account**:
  - [ ] Go to https://netlify.com
  - [ ] Sign up with GitHub
- [ ] **Connect Repository**:
  - [ ] Click "New site from Git"
  - [ ] Choose GitHub
  - [ ] Select your repository
  - [ ] Branch: `main` or `master`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
  - [ ] Click "Deploy site"
- [ ] **Set Environment Variables**:
  - [ ] Go to: Site Settings → Build & Deploy → Environment
  - [ ] Click "Add environment variable"
  - [ ] Name: `VITE_API_URL`
  - [ ] Value: `http://your-vps-ip:5000` (or `https://api.yourdomain.com`)
  - [ ] Click "Save"
- [ ] **Redeploy**:
  - [ ] Go to: Deploys
  - [ ] Click "Trigger deploy" → "Deploy site"
- [ ] **Custom Domain** (optional):
  - [ ] Go to: Domain Settings
  - [ ] Click "Add custom domain"
  - [ ] Enter your domain
  - [ ] Configure DNS records as instructed
- [ ] Note frontend URL: `https://________________.netlify.app`

---

## 🚀 Frontend Deployment to Vercel (Alternative)

- [ ] **Create Vercel Account**:
  - [ ] Go to https://vercel.com
  - [ ] Sign up with GitHub
- [ ] **Import Repository**:
  - [ ] Click "New Project"
  - [ ] Import your GitHub repository
  - [ ] Framework Preset: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Click "Deploy"
- [ ] **Set Environment Variables**:
  - [ ] Go to: Project Settings → Environment Variables
  - [ ] Name: `VITE_API_URL`
  - [ ] Value: `http://your-vps-ip:5000` (or `https://api.yourdomain.com`)
  - [ ] Environment: Production
  - [ ] Click "Save"
- [ ] **Redeploy**:
  - [ ] Go to: Deployments
  - [ ] Click "..." → Redeploy
- [ ] Note frontend URL: `https://________________.vercel.app`

---

## 🔗 Final Integration

- [ ] Update backend CORS:
  - [ ] SSH into VPS: `ssh ubuntu@your-vps-ip`
  - [ ] Edit `.env`: `nano /home/ubuntu/desh-lekha/backend/.env`
  - [ ] Update `CORS_ORIGIN=https://your-app.netlify.app` (or Vercel URL)
  - [ ] Restart: `pm2 restart mgnrega-backend`
- [ ] Test frontend → backend connection:
  - [ ] Open frontend URL in browser
  - [ ] Open DevTools → Network tab
  - [ ] Select "Madhya Pradesh" state
  - [ ] Verify requests go to your backend API
  - [ ] Verify no CORS errors
  - [ ] Verify data loads correctly
- [ ] Test all features end-to-end:
  - [ ] Overview tab works
  - [ ] Leaderboard tab works
  - [ ] Compare tab works
  - [ ] Visualizer tab works
  - [ ] Language switching works
  - [ ] Google Translate works
- [ ] Test offline mode:
  - [ ] Load app (data cached)
  - [ ] Disconnect internet
  - [ ] Refresh page
  - [ ] App still works

---

## 🎥 Loom Video Recording

- [ ] **Create Loom Account**:
  - [ ] Go to https://loom.com
  - [ ] Sign up (free plan)
  - [ ] Install Loom desktop app or Chrome extension
- [ ] **Script Preparation**:
  - [ ] Read script in `QUICKSTART.md` (section: "Demo Video")
  - [ ] Practice walkthrough (stay under 2 minutes)
- [ ] **Record Video** (<2 minutes total):
  - [ ] **0:00-0:40** - Features Demo:
    - [ ] Show Overview tab (metrics, map, summary)
    - [ ] Show Leaderboard tab (top 10, podium)
    - [ ] Show Compare tab (bar chart, radar chart, winners)
    - [ ] Show Visualizer tab (emoji cards, progress bars, charts)
  - [ ] **0:40-0:55** - Low-Literacy Design:
    - [ ] Show color coding (green/red)
    - [ ] Show emoji icons
    - [ ] Show progress bars (visual comparison)
    - [ ] Show Google Translate widget
  - [ ] **0:55-1:20** - Backend Architecture:
    - [ ] Open backend URL in browser (show health check)
    - [ ] Show API response (JSON with 500 records)
    - [ ] Show PostgreSQL database (via terminal or pgAdmin)
    - [ ] Show PM2 logs (cron sync every 4 hours)
    - [ ] Show caching (`source: cache` in response)
  - [ ] **1:20-1:45** - Production Readiness:
    - [ ] Show offline PWA (disconnect internet, still works)
    - [ ] Show error handling (invalid state, shows message)
    - [ ] Show Lighthouse scores (Performance 95+, Accessibility 100)
    - [ ] Show responsive design (mobile, tablet, desktop)
  - [ ] **1:45-2:00** - Code Walkthrough:
    - [ ] Show cache-first strategy code (`useMGNREGAData.js`)
    - [ ] Show calculateStats function
    - [ ] Show database schema (`backend/db/database.js`)
    - [ ] Wrap up with hosted URLs
- [ ] **Upload & Share**:
  - [ ] Upload to Loom
  - [ ] Get shareable link
  - [ ] Test link (open in incognito, verify playback)
  - [ ] Note Loom URL: `https://loom.com/share/________________`

---

## 📝 Fellowship Application Submission

- [ ] Go to Build for Bharat Fellowship portal
- [ ] Fill application form:
  - [ ] **Name**: Your name
  - [ ] **Email**: Your email
  - [ ] **Phone**: Your phone
  - [ ] **College/University**: Your institution
  - [ ] **GitHub Profile**: `https://github.com/yourusername`
  - [ ] **Public Tech Challenge Answer**: (already written in fellowship requirements doc)
  - [ ] **Loom Video URL**: `https://loom.com/share/________________`
  - [ ] **Frontend Hosted URL**: `https://________________.netlify.app`
  - [ ] **Backend Hosted URL**: `http://________________:5000` (optional but impressive)
  - [ ] **GitHub Repository**: `https://github.com/gitsofaryan/desh-lekha`
  - [ ] **Additional Notes**: "Includes production-ready backend with PostgreSQL, auto data sync, comprehensive documentation (7 docs, 16,800+ words), low-literacy UI design, and full deployment guides."
- [ ] Review all information
- [ ] Submit application
- [ ] Note submission date: `________________`
- [ ] Save confirmation email/screenshot

---

## 🎉 Post-Submission

- [ ] Share hosted URLs with friends/family for feedback
- [ ] Monitor backend logs: `pm2 logs mgnrega-backend`
- [ ] Check database size: `sudo -u postgres psql -d mgnrega_db -c "SELECT pg_size_pretty(pg_database_size('mgnrega_db'));"`
- [ ] Verify cron sync runs every 4 hours
- [ ] Set up database backups (see `backend/DEPLOYMENT.md`)
- [ ] Set up monitoring alerts (optional)
- [ ] Document any issues encountered
- [ ] Prepare for potential fellowship interview:
  - [ ] Review technical decisions in `ARCHITECTURE.md`
  - [ ] Review production readiness in `PRODUCTION_READINESS.md`
  - [ ] Be ready to explain cache-first strategy
  - [ ] Be ready to explain low-literacy design choices
  - [ ] Be ready to demo live app

---

## 📊 Success Metrics

Track these after deployment:

**Performance**:
- [ ] Frontend loads in <3 seconds
- [ ] API response time <200ms (database), <50ms (cache)
- [ ] Lighthouse Performance score ≥95
- [ ] Lighthouse Accessibility score = 100
- [ ] Cache hit rate ≥95%

**Functionality**:
- [ ] All 4 tabs working
- [ ] All charts rendering
- [ ] Language switching working
- [ ] Google Translate working
- [ ] Offline PWA working
- [ ] Error handling working

**Data**:
- [ ] 500 districts loaded for Madhya Pradesh
- [ ] All 24 metrics present
- [ ] Data syncs every 4 hours (check logs)
- [ ] Database has proper indexes
- [ ] No duplicate records

**Deployment**:
- [ ] Frontend accessible publicly
- [ ] Backend accessible publicly
- [ ] No CORS errors
- [ ] SSL certificate (if using domain)
- [ ] PM2 auto-restart working
- [ ] Nginx reverse proxy working (if used)

---

## 🆘 Troubleshooting Resources

If you encounter issues, refer to:

1. **`QUICKSTART.md`** - Complete setup guide with troubleshooting
2. **`backend/DEPLOYMENT.md`** - VPS deployment troubleshooting
3. **`FRONTEND_INTEGRATION.md`** - Frontend-backend connection issues
4. **`PRODUCTION_READINESS.md`** - Production checklist
5. **PM2 logs**: `pm2 logs mgnrega-backend`
6. **Backend logs**: `tail -f backend/logs/error.log`
7. **Database logs**: `sudo tail -f /var/log/postgresql/*.log`

Common issues:
- **CORS errors**: Update `CORS_ORIGIN` in backend `.env`
- **Database connection failed**: Check PostgreSQL is running
- **Data not loading**: Check backend API is accessible
- **Build fails**: Clear `node_modules`, reinstall
- **Port in use**: Change `PORT` in `.env` or kill process

---

## ✅ Final Checklist Summary

- [ ] Backend deployed to VPS
- [ ] Backend API working (`/health`, `/api/states`, `/api/data`)
- [ ] PostgreSQL database initialized with 500+ records
- [ ] PM2 running backend with auto-restart
- [ ] Cron job syncing data every 4 hours
- [ ] Frontend deployed to Netlify/Vercel
- [ ] Frontend loads and displays data
- [ ] All 4 tabs working (Overview, Leaderboard, Compare, Visualizer)
- [ ] Language switching working (English, Hindi, Google Translate)
- [ ] Offline PWA working
- [ ] CORS configured correctly
- [ ] Loom video recorded (<2 minutes)
- [ ] Fellowship application submitted
- [ ] Both hosted URLs noted and working

---

**You've got this! 🚀**

Follow this checklist step-by-step, and you'll have a production-ready MGNREGA Dashboard deployed and submitted to Build for Bharat Fellowship 2026.

**Good luck! 🎯**
