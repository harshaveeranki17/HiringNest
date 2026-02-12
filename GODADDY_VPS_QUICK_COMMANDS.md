# GoDaddy VPS Deployment - Quick Reference

Step-by-step commands to deploy JobSphere on GoDaddy VPS.

---

## ⚡ 60-Second Overview

```bash
# 1. SSH to VPS
ssh root@your-vps-ip

# 2. Install everything (auto)
curl -O https://yourscript.sh/godaddy-setup.sh && bash godaddy-setup.sh

# 3. Clone repo
git clone https://github.com/yourusername/JobSphere.git
cd JobSphere

# 4. Configure
cp .env.example .env.local
# Edit NEXTAUTH_SECRET, DATABASE_URL

# 5. Deploy
npm install && npm run build
npx prisma db push
npx prisma db seed
pm2 start npm --name "jobsphere" -- start

# 6. Point domain
# GoDaddy DNS: A record @ = VPS IP

# DONE! 🎉
```

---

## 📋 Detailed Commands

### Step 1: Get VPS IP

After purchasing GoDaddy VPS:
```bash
# Check email from GoDaddy
# Format: root@123.45.67.89
# Password: [provided in email]

# SSH into VPS
ssh root@123.45.67.89
# Enter password when prompted
```

### Step 2: Update System & Install Node.js

```bash
#!/bin/bash
# Run as root on VPS

# Update everything
apt update && apt upgrade -y

# Install curl & git
apt install -y curl git

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install npm packages manager
npm install -g npm@latest

# Verify
node --version
npm --version
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start service
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE jobsphere;
CREATE USER jobsphereuser WITH PASSWORD 'YourSecurePassword123!';
ALTER ROLE jobsphereuser SET client_encoding TO 'utf8';
ALTER ROLE jobsphereuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE jobsphereuser SET default_transaction_deferrable TO on;
ALTER ROLE jobsphereuser SET default_transaction_deferrable TO on;
ALTER ROLE jobsphereuser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE jobsphere TO jobsphereuser;
\c jobsphere
GRANT ALL PRIVILEGES ON SCHEMA public TO jobsphereuser;
EOF

# Verify
psql -U jobsphereuser -d jobsphere -c "\dt"
```

### Step 4: Install Application

```bash
# Create directory
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/yourusername/JobSphere.git
cd JobSphere

# Install dependencies
npm install

# Build application
npm run build
```

### Step 5: Configure Environment

```bash
# Create .env file
nano .env.local
```

**Paste this** (update values):
```env
# Database
DATABASE_URL="postgresql://jobsphereuser:YourSecurePassword123!@localhost:5432/jobsphere"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://yourdomain.com"

# Node
NODE_ENV="production"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
```

**Save:** `Ctrl + X` → `Y` → `Enter`

### Step 6: Setup Database

```bash
# Install Prisma globally
npm install -g prisma

# Run migrations
npx prisma db push

# Seed database
npx prisma db seed

# Verify
psql -U jobsphereuser -d jobsphere -c "SELECT COUNT(*) FROM \"User\";"
```

### Step 7: Install PM2 (Keep App Running)

```bash
# Install PM2
npm install -g pm2

# Start application
cd /var/www/JobSphere
pm2 start npm --name "jobsphere" -- start

# Configure auto-restart
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs jobsphere
```

### Step 8: Install & Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Backup original config
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# Create new config
cat > /etc/nginx/sites-available/jobsphere << 'EOF'
upstream jobsphere_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    client_max_body_size 20M;

    location / {
        proxy_pass http://jobsphere_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/jobsphere /etc/nginx/sites-enabled/jobsphere
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

### Step 9: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew setup
systemctl start certbot.timer
systemctl enable certbot.timer
```

### Step 10: Update Nginx for HTTPS

```bash
# Create HTTPS config
cat > /etc/nginx/sites-available/jobsphere << 'EOF'
upstream jobsphere_backend {
    server localhost:3000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    client_max_body_size 20M;

    # SSL Certificate Paths
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://jobsphere_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test and restart
nginx -t
systemctl restart nginx
```

### Step 11: Setup GoDaddy DNS

1. **GoDaddy Dashboard** → Your Domain → **Manage DNS**
2. Find existing **A record** for `@`
3. **Change Value** to your VPS IP (e.g., `123.45.67.89`)
4. **TTL**: 600
5. Click **Save**

**Optional: Setup www**
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 600
```

### Step 12: Test Everything

```bash
# Check services
systemctl status nginx
systemctl status postgresql
pm2 status

# Test application
curl -I https://yourdomain.com
# Should show: HTTP/2 200

# Monitor logs
tail -f /var/log/nginx/error.log
pm2 logs jobsphere

# Check SSL certificate
curl -I https://yourdomain.com | grep SSL
```

---

## 🔄 Ongoing Maintenance

### Daily Tasks

```bash
# Check application is running
pm2 status

# View logs
pm2 logs jobsphere --lines 100

# Check disk space
df -h
```

### Weekly Tasks

```bash
# Backup database
pg_dump -U jobsphereuser jobsphere > /backup/jobsphere_$(date +%Y%m%d).sql

# Check Nginx
curl https://yourdomain.com

# Monitor system
free -h  # Memory usage
top -b -n1 | head -20  # CPU usage
```

### Monthly Tasks

```bash
# Update system
apt update && apt upgrade -y

# Check certificate expiry
certbot certificates

# Review logs
grep ERROR /var/log/nginx/error.log
```

---

## 🚨 Common Issues & Fixes

### App Won't Start

```bash
# Check PM2 logs
pm2 logs jobsphere

# If database error:
psql -U jobsphereuser -d jobsphere -c "SELECT 1"

# Restart everything
pm2 restart jobsphere
```

### Port 3000 Already in Use

```bash
# Find what's using port
lsof -i :3000

# Kill process
kill -9 PID

# Restart app
pm2 restart jobsphere
```

### Nginx Won't Start

```bash
# Test config
nginx -t

# Check error
systemctl status nginx

# View error log
tail -50 /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate
certbot certificates

# Renew manually
certbot renew --force-renewal

# Force cert update in Nginx
certbot renew --nginx --non-interactive
```

### Database Connection Fails

```bash
# Check PostgreSQL
systemctl status postgresql

# Test connection
psql -U jobsphereuser -d jobsphere -c "SELECT 1"

# Restart PostgreSQL
systemctl restart postgresql
```

---

## 📊 Performance Monitoring

### Real-time Monitoring

```bash
# Watch PM2
pm2 monit

# Watch Nginx
tail -f /var/log/nginx/access.log | grep -E "^[^#]" | awk '{print $(NF)}'

# Memory usage
watch free -h
```

### Check Application Health

```bash
# Response time
time curl https://yourdomain.com > /dev/null

# Database query time
time psql -U jobsphereuser -d jobsphere -c "SELECT COUNT(*) FROM \"Job\";"

# Server uptime
uptime
```

---

## 🔐 Security Hardening

### Enable Firewall

```bash
# Install UFW (Uncomplicated Firewall)
apt install -y ufw

# Allow SSH (IMPORTANT!)
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Deny everything else
ufw enable

# Check rules
ufw status
```

### Secure SSH

```bash
# Generate SSH key (on your computer)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/godaddy_vps

# Copy to server
ssh-copy-id -i ~/.ssh/godaddy_vps root@123.45.67.89

# Disable password login (on server)
sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```

---

## 📈 Upgrade Procedure (When Needed)

```bash
# Stop application
pm2 stop jobsphere

# Backup database
pg_dump -U jobsphereuser jobsphere > /backup/jobsphere_backup_$(date +%Y%m%d_%H%M%S).sql

# Pull latest code
cd /var/www/JobSphere
git pull origin main

# Reinstall & rebuild
npm install
npm run build

# Run migrations
npx prisma db push

# Restart
pm2 restart jobsphere

# Verify
pm2 logs jobsphere
```

---

## 🝐 Useful Commands Summary

```bash
# View app logs
pm2 logs jobsphere

# Restart app
pm2 restart jobsphere

# Check services
systemctl status postgresql
systemctl status nginx
systemctl status application (if .service created)

# Update system
apt update && apt upgrade -y

# Monitor
pm2 monit
htop

# Database
psql -U jobsphereuser -d jobsphere

# SSL check
curl -I https://yourdomain.com

# Disk usage
df -h
du -sh /var/www/JobSphere/

# Backup
pg_dump -U jobsphereuser jobsphere > backup.sql

# Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
pm2 logs --raw | tee app.log
```

---

**Total Setup Time**: ~45 minutes
**Maintenance**: ~5 minutes/week
**Cost**: $19.99-99.99/month

**Last Updated**: February 12, 2026
