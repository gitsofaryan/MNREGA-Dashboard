# Frontend Integration Guide

This guide shows how to connect your React frontend to the new backend API.

## Overview

Currently, your frontend fetches data directly from the government API using localStorage caching. With the backend deployed, you'll switch to fetching from your own API which handles caching and data sync automatically.

## Changes Required

### 1. Add Backend URL to Frontend Environment

Create/update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

For production (after backend deployment):
```env
VITE_API_URL=https://your-backend-domain.com
```

### 2. Update `useMGNREGAData.js` Hook

**Location**: `src/hooks/useMGNREGAData.js`

**Current Implementation** (fetches from government API directly):
```javascript
const fetchData = async () => {
  const response = await fetch(
    `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=...&filters[state]=${state}`
  );
  const data = await response.json();
  // ... process and cache in localStorage
};
```

**New Implementation** (fetches from your backend):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fetchData = async () => {
  const response = await fetch(
    `${API_URL}/api/data/${encodeURIComponent(state)}?finYear=${finYear}&month=${month}`
  );
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch data');
  }
  
  // Backend already returns processed data, no need for additional processing
  return result.data;
};
```

### 3. Update `calculateStats` Function

The backend provides a `/api/stats/:stateName` endpoint that calculates statistics using the same logic as your frontend.

**Option A**: Use backend's stats endpoint (recommended)
```javascript
const fetchStats = async (state, finYear) => {
  const response = await fetch(
    `${API_URL}/api/stats/${encodeURIComponent(state)}?finYear=${finYear}`
  );
  const result = await response.json();
  return result.data; // Already calculated stats
};
```

**Option B**: Keep frontend calculation (for flexibility)
```javascript
// Keep your existing calculateStats function
// Backend sends raw data via /api/data endpoint
// Frontend calculates stats as before
```

### 4. Remove Direct Government API Calls

Find and replace all instances of:
```javascript
'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722'
```

With:
```javascript
`${API_URL}/api/data`
```

### 5. Update Caching Strategy (Optional)

Since backend already caches for 4 hours, you can either:

**Option A**: Remove frontend caching (trust backend cache)
```javascript
// Remove localStorage.setItem calls
// Always fetch from backend (it's cached there)
```

**Option B**: Keep double caching (faster but redundant)
```javascript
// Keep localStorage for offline support
// Backend cache ensures server performance
```

Recommendation: **Keep frontend caching** for offline PWA support.

## Complete Updated Hook Example

**File**: `src/hooks/useMGNREGAData.js`

```javascript
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export function useMGNREGAData(state, finYear = '2024-2025', month = 4) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check localStorage cache first
        const cacheKey = `mgnrega_${state}_${finYear}_${month}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_DURATION) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        // Fetch from backend API
        const response = await fetch(
          `${API_URL}/api/data/${encodeURIComponent(state)}?finYear=${finYear}&month=${month}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch data');
        }

        // Cache in localStorage
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result.data,
          timestamp: Date.now(),
          source: result.source, // 'cache' or 'database'
        }));

        setData(result.data);
      } catch (err) {
        console.error('Error fetching MGNREGA data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (state) {
      fetchData();
    }
  }, [state, finYear, month]);

  return { data, loading, error };
}
```

## Testing Integration

### 1. Start Backend Locally
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run init-db
npm run sync-data  # Takes 5-10 minutes
npm start
```

Backend runs at: `http://localhost:5000`

### 2. Update Frontend Environment
```bash
cd ..  # Back to root
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 3. Start Frontend
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Test API Calls

Open browser DevTools Network tab and verify:
- Requests go to `http://localhost:5000/api/data/...`
- Response includes `"source": "cache"` or `"source": "database"`
- Data structure matches what frontend expects

### 5. Test Offline Support

1. Load the app (data cached)
2. Stop backend server
3. Refresh page
4. Should still work (using localStorage cache)

## Production Deployment

### 1. Deploy Backend to VPS

See `backend/DEPLOYMENT.md` for complete guide.

Quick steps:
```bash
# SSH into VPS
ssh ubuntu@your-vps-ip

# Run deployment script
curl -fsSL https://raw.githubusercontent.com/your-repo/backend/deploy.sh | bash

# Configure .env
cd /home/ubuntu/desh-lekha/backend
nano .env  # Update DB_PASSWORD, CORS_ORIGIN

# Restart
pm2 restart mgnrega-backend
```

Backend URL: `http://your-vps-ip:5000` or `https://api.yourdomain.com`

### 2. Deploy Frontend to Netlify/Vercel

**Netlify**:
```bash
npm run build
netlify deploy --prod
```

Set environment variable in Netlify dashboard:
- `VITE_API_URL` = `https://api.yourdomain.com`

**Vercel**:
```bash
npm run build
vercel --prod
```

Set environment variable in Vercel dashboard:
- `VITE_API_URL` = `https://api.yourdomain.com`

### 3. Update Backend CORS

In backend `.env`:
```env
CORS_ORIGIN=https://your-app.netlify.app,https://your-app.vercel.app
```

Restart backend:
```bash
pm2 restart mgnrega-backend
```

### 4. Test Production

Visit your frontend URL and verify:
1. Data loads correctly
2. No CORS errors in console
3. Network tab shows requests to backend
4. Caching works (check `source` field in response)

## API Response Format

All backend endpoints return consistent format:

```json
{
  "success": true,
  "source": "cache",
  "count": 500,
  "data": [
    {
      "district_name": "AGAR MALWA",
      "total_job_cards_issued": 12345,
      "total_workers": 23456,
      // ... 24 total fields
    }
  ]
}
```

Error response:
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

## Migration Checklist

- [ ] Backend deployed to VPS
- [ ] PostgreSQL database initialized
- [ ] Initial data synced (500 records for Madhya Pradesh)
- [ ] Backend health check passes: `curl http://your-backend/health`
- [ ] Frontend `.env` updated with `VITE_API_URL`
- [ ] `useMGNREGAData.js` hook updated to use backend API
- [ ] All government API URLs replaced with backend URLs
- [ ] Frontend deployed to Netlify/Vercel
- [ ] Backend CORS configured with frontend domain
- [ ] End-to-end test: Frontend → Backend → Database
- [ ] Offline PWA test: Works with localStorage fallback
- [ ] Caching test: Second page load uses cache (source: "cache")
- [ ] Auto-sync test: Wait 4 hours, data updates automatically

## Troubleshooting

### CORS Error
```
Access to fetch at 'http://backend' from origin 'http://frontend' has been blocked by CORS policy
```

**Solution**: Update backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
```

### Network Error
```
Failed to fetch: TypeError: NetworkError
```

**Solution**: 
1. Check backend is running: `curl http://localhost:5000/health`
2. Check firewall allows port 5000
3. Check `VITE_API_URL` is correct

### Empty Data
```
data: []
```

**Solution**:
1. Check backend has synced data: `npm run sync-data`
2. Check database has records: `psql -c "SELECT COUNT(*) FROM mgnrega_data;"`
3. Check API returns data: `curl http://localhost:5000/api/data/MADHYA%20PRADESH`

### Slow Response
```
Request taking >5 seconds
```

**Solution**:
1. Check cache is working: Response should have `"source": "cache"`
2. Check database indexes: Run `ANALYZE` command
3. Increase backend VPS RAM to 4GB

## Performance Comparison

| Metric | Government API (Direct) | Backend API |
|--------|------------------------|-------------|
| First Load | 3-5 seconds | 2-3 seconds |
| Cached Load | 50ms (localStorage) | 100ms (backend cache) |
| Offline Support | ✅ (localStorage) | ✅ (localStorage fallback) |
| Data Freshness | Manual refresh | Auto-sync every 4 hours |
| Rate Limits | 100/day (government) | Unlimited (your server) |
| Custom Metrics | Calculate on frontend | Pre-calculated on backend |

## Next Steps

1. **Test locally** - Start backend + frontend, verify data flows
2. **Deploy backend** - Follow DEPLOYMENT.md guide
3. **Deploy frontend** - Netlify/Vercel with backend URL
4. **Monitor** - Check PM2 logs, PostgreSQL stats
5. **Record Loom** - Show all features working with backend

---

**Need help?** Check backend logs: `pm2 logs mgnrega-backend`
