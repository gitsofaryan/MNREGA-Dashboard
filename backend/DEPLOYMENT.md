# MGNREGA Backend Deployment Guide

## Prerequisites
- VPS/VM with Ubuntu 20.04+ (DigitalOcean, AWS EC2, Azure VM, etc.)
- Minimum 2GB RAM, 20GB storage
- Root or sudo access
- Domain name (optional, but recommended)

---

## Option 1: Automated Deployment (Recommended)

### Step 1: SSH into your VPS
```bash
ssh ubuntu@your-vps-ip
```

### Step 2: Run deployment script
```bash
curl -fsSL https://raw.githubusercontent.com/gitsofaryan/desh-lekha/main/backend/deploy.sh | bash
```

### Step 3: Configure environment variables
```bash
cd /home/ubuntu/desh-lekha/backend
nano .env
```

Update the following:
- `DB_PASSWORD` - Strong password for PostgreSQL
- `CORS_ORIGIN` - Your frontend domain (e.g., https://your-app.netlify.app)
- `GOV_API_KEY` - Government API key (if available)

### Step 4: Restart backend
```bash
pm2 restart mgnrega-backend
```

### Step 5: Verify deployment
```bash
curl http://localhost:5000/health
```

You should see: `{"status":"healthy","timestamp":"..."}`

---

## Option 2: Manual Deployment

### Step 1: Update system
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x.x
```

### Step 3: Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 4: Create database and user
```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE mgnrega_db;
CREATE USER mgnrega_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mgnrega_db TO mgnrega_user;
\q
```

### Step 5: Clone repository
```bash
cd /home/ubuntu
git clone https://github.com/gitsofaryan/desh-lekha.git
cd desh-lekha/backend
```

### Step 6: Install dependencies
```bash
npm install --production
```

### Step 7: Configure environment
```bash
cp .env.example .env
nano .env
```

Update all values (DB credentials, CORS origin, etc.)

### Step 8: Initialize database
```bash
npm run init-db
```

### Step 9: Sync initial data
```bash
npm run sync-data
```

This will take 5-10 minutes to fetch and store government data.

### Step 10: Install PM2 process manager
```bash
sudo npm install -g pm2
```

### Step 11: Start backend with PM2
```bash
pm2 start server.js --name mgnrega-backend
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

### Step 12: Install Nginx (optional, for reverse proxy)
```bash
sudo apt install -y nginx
```

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/mgnrega-backend
```

Paste:
```nginx
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
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/mgnrega-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 13: Configure firewall (optional)
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS (if using SSL)
sudo ufw enable
```

### Step 14: Set up SSL with Let's Encrypt (optional)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Testing Deployment

### 1. Health check
```bash
curl http://your-domain.com/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 2. Get states
```bash
curl http://your-domain.com/api/states
```

Expected response:
```json
{
  "success": true,
  "source": "database",
  "count": 1,
  "data": [{"id":1,"state_name":"MADHYA PRADESH"}]
}
```

### 3. Get districts
```bash
curl http://your-domain.com/api/districts/MADHYA%20PRADESH
```

Should return list of districts.

### 4. Get MGNREGA data
```bash
curl "http://your-domain.com/api/data/MADHYA%20PRADESH?finYear=2024-2025&month=4"
```

Should return 500 records with all metrics.

---

## Monitoring & Maintenance

### View PM2 logs
```bash
pm2 logs mgnrega-backend
```

### View only errors
```bash
pm2 logs mgnrega-backend --err
```

### Check PM2 status
```bash
pm2 status
```

### Restart backend
```bash
pm2 restart mgnrega-backend
```

### Stop backend
```bash
pm2 stop mgnrega-backend
```

### Monitor CPU/Memory usage
```bash
pm2 monit
```

### View backend logs (Winston)
```bash
tail -f /home/ubuntu/desh-lekha/backend/logs/app.log
tail -f /home/ubuntu/desh-lekha/backend/logs/error.log
```

### Check PostgreSQL database
```bash
sudo -u postgres psql -d mgnrega_db
```

In PostgreSQL:
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check record counts
SELECT COUNT(*) FROM states;
SELECT COUNT(*) FROM districts;
SELECT COUNT(*) FROM mgnrega_data;

-- Check latest sync
SELECT district_id, fin_year, month, updated_at
FROM mgnrega_data
ORDER BY updated_at DESC
LIMIT 10;
```

### Manual data sync
```bash
cd /home/ubuntu/desh-lekha/backend
npm run sync-data
```

---

## Troubleshooting

### Backend not starting
```bash
# Check PM2 logs
pm2 logs mgnrega-backend

# Check if port 5000 is already in use
sudo lsof -i :5000

# Check environment variables
cat .env
```

### Database connection errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection manually
psql -h localhost -p 5432 -U mgnrega_user -d mgnrega_db
```

### Nginx errors
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Cron job not running
```bash
# Check PM2 logs for cron execution
pm2 logs mgnrega-backend | grep "Scheduled data sync"

# Manually trigger sync via API
curl -X POST http://localhost:5000/api/sync/MADHYA%20PRADESH
```

### Out of memory
```bash
# Check memory usage
free -h

# Restart PM2
pm2 restart mgnrega-backend

# If persistent, upgrade VPS RAM to 4GB
```

### Disk space full
```bash
# Check disk usage
df -h

# Clear old logs
pm2 flush
rm -rf /home/ubuntu/desh-lekha/backend/logs/*.log

# Clear PostgreSQL old data (optional)
sudo -u postgres psql -d mgnrega_db -c "DELETE FROM mgnrega_data WHERE updated_at < NOW() - INTERVAL '30 days';"
```

---

## Updating Backend

### Pull latest changes
```bash
cd /home/ubuntu/desh-lekha
git pull origin main
cd backend
npm install --production
pm2 restart mgnrega-backend
```

---

## Security Best Practices

1. **Never commit `.env` file** - Always use `.env.example` as template
2. **Use strong database passwords** - At least 16 characters with symbols
3. **Enable firewall** - Only allow necessary ports (22, 80, 443)
4. **Set up SSL certificate** - Use Let's Encrypt for free HTTPS
5. **Regular updates** - `sudo apt update && sudo apt upgrade` weekly
6. **Rotate database passwords** - Change every 3 months
7. **Monitor logs** - Check for suspicious API calls
8. **Rate limiting** - Already configured (100 req/15min per IP)
9. **CORS whitelist** - Only allow your frontend domain
10. **Backup database** - Daily automated backups (see below)

---

## Database Backup & Restore

### Automated daily backups
```bash
# Create backup script
sudo nano /usr/local/bin/backup-mgnrega-db.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump mgnrega_db | gzip > $BACKUP_DIR/mgnrega_db_$DATE.sql.gz
find $BACKUP_DIR -name "mgnrega_db_*.sql.gz" -mtime +7 -delete  # Keep 7 days
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-mgnrega-db.sh
```

Add to crontab:
```bash
sudo crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-mgnrega-db.sh
```

### Manual backup
```bash
sudo -u postgres pg_dump mgnrega_db | gzip > mgnrega_db_backup.sql.gz
```

### Restore from backup
```bash
gunzip mgnrega_db_backup.sql.gz
sudo -u postgres psql mgnrega_db < mgnrega_db_backup.sql
```

---

## Performance Optimization

### PostgreSQL tuning
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Update:
```conf
shared_buffers = 512MB          # 25% of RAM
effective_cache_size = 1536MB   # 75% of RAM
work_mem = 16MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Create additional indexes (if needed)
```sql
-- Index for frequent queries
CREATE INDEX CONCURRENTLY idx_mgnrega_latest
ON mgnrega_data (district_id, fin_year DESC, month DESC);

-- Analyze tables
ANALYZE states;
ANALYZE districts;
ANALYZE mgnrega_data;
```

---

## Cost Estimation

### VPS Costs (per month)
- **DigitalOcean Droplet** (2GB RAM): $12/month
- **AWS EC2 t3.small** (2GB RAM): ~$15/month
- **Azure B2s** (2GB RAM): ~$30/month
- **Linode** (2GB RAM): $12/month

### Recommended for Production
- **4GB RAM VPS**: $24/month (DigitalOcean)
- Handles 10,000+ daily active users
- Includes database, caching, cron jobs

---

## Support

For issues or questions:
1. Check logs: `pm2 logs mgnrega-backend`
2. Review PostgreSQL logs: `sudo tail -f /var/log/postgresql/*.log`
3. Test API endpoints with curl
4. Check GitHub issues: https://github.com/gitsofaryan/desh-lekha/issues

---

## Next Steps After Deployment

1. **Update frontend** - Point API calls to your backend URL
2. **Deploy frontend** - Netlify/Vercel with `VITE_API_URL=http://your-domain.com`
3. **Test end-to-end** - Frontend → Backend → Database
4. **Monitor performance** - Use PM2 monitoring and PostgreSQL logs
5. **Set up alerts** - Email notifications for errors (optional)

---

**Deployment complete! 🎉**

Your backend API is now live at: `http://your-domain.com/api`
