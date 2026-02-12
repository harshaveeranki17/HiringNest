# Deploy HiringNest Entirely on GoDaddy Hosting

Complete guide to deploy your Next.js application directly on GoDaddy servers.

## ⚠️ Important: GoDaddy Hosting Limitations

GoDaddy offers several hosting options, but they have limitations for Node.js applications:

### GoDaddy Hosting Options & Node.js Support

| Hosting Type | Node.js Support | Best For | Cost |
|---|---|---|---|
| **Shared Hosting** | ❌ No | WordPress, PHP | $2.99-6.99/mo |
| **cPanel Hosting** | ⚠️ Limited | Static sites, legacy apps | $3.99-10.99/mo |
| **WordPress Hosting** | ❌ No | WordPress only | $9.99-19.99/mo |
| **Managed WordPress** | ❌ No | WordPress only | $19.99-99.99/mo |
| **VPS (Virtual Private Server)** | ✅ Yes | Node.js apps | $19.99-99.99/mo |
| **Dedicated Server** | ✅ Yes | High-traffic apps | $49.99-299.99/mo |
| **Cloud Hosting** | ✅ Yes | Scalable apps | Varies |

---

## ✅ Recommended: GoDaddy Managed WordPress + External API

For best results with minimal maintenance:

```
GoDaddy Hosting (Frontend via WordPress)
    ↓
External Node.js Server (Azure/AWS/Heroku)
    ↓
PostgreSQL Database (Azure/AWS RDS)
```

But **NOT ideal for Next.js.**

---

## 🚀 Best Solutions for Deploying on GoDaddy

### Option 1: Use GoDaddy VPS (Virtual Private Server) ⭐ RECOMMENDED

VPS allows full Node.js deployment.

#### Step 1: Purchase GoDaddy VPS

1. Visit: https://www.godaddy.com/hosting/vps
2. Choose plan:
   - **Standard VPS**: $19.99/month (2GB RAM - minimum for Node.js)
   - **Deluxe VPS**: $39.99/month (4GB RAM - better)
   - **Ultimate VPS**: $99.99/month (8GB RAM - best)

3. Select **CentOS 8** or **Ubuntu 20.04 LTS** as OS
4. Click **Add to Cart** → Checkout

#### Step 2: SSH into VPS

```bash
# GoDaddy will email you SSH credentials
# Format: ssh root@your-vps-ip-address

ssh root@123.45.67.89
```

#### Step 3: Update System

```bash
apt update
apt upgrade -y
```

#### Step 4: Install Node.js & npm

```bash
# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 5: Install PostgreSQL

```bash
# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Start service
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres createdb jobsphere
sudo -u postgres createuser jobsphereuser

# Set password
sudo -u postgres psql -c "ALTER USER jobsphereuser WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE jobsphere TO jobsphereuser;"
```

#### Step 6: Clone and Deploy Application

```bash
# Install Git
apt-get install -y git

# Clone repository
cd /var/www
git clone https://github.com/yourusername/JobSphere.git
cd JobSphere

# Install dependencies
npm install

# Build application
npm run build

# Create .env file
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://jobsphereuser:yourpassword@localhost:5432/jobsphere"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
EOF

# Run Prisma migrations
npx prisma db push
npx prisma db seed

# Start application
npm start
```

#### Step 7: Setup PM2 Process Manager (Keep App Running)

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start npm --name "jobsphere" -- start

# Configure to restart on reboot
pm2 startup
pm2 save

# Verify it's running
pm2 status
```

#### Step 8: Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt-get install -y nginx

# Create config file
cat > /etc/nginx/sites-available/jobsphere << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/jobsphere /etc/nginx/sites-enabled/

# Test config
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx
```

#### Step 9: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Configure auto-renewal
systemctl start certbot.timer
systemctl enable certbot.timer
```

#### Step 10: Update Nginx for HTTPS

```bash
# Update config
cat > /etc/nginx/sites-available/jobsphere << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Reload Nginx
systemctl reload nginx
```

#### Step 11: Point GoDaddy Domain to VPS

1. GoDaddy Dashboard → Select domain
2. Go to **DNS Management**
3. Update **A Record**:
   ```
   Name: @
   Type: A
   Value: your-vps-ip-address
   ```
4. Update **CNAME** for www:
   ```
   Name: www
   Type: CNAME
   Value: yourdomain.com
   ```

#### Step 12: Test Application

Visit: `https://yourdomain.com` ✅

---

### Option 2: GoDaddy Dedicated Server (For High Traffic)

Similar to VPS but with more resources and better performance.

1. Visit: https://www.godaddy.com/hosting/dedicated-server
2. Choose plan ($49.99-299.99/month)
3. Follow same steps as VPS (Steps 2-12 above)

---

### Option 3: Use GoDaddy for Domain Only + External Hosting

**NOT recommended but possible:**

```
GoDaddy (Domain)
    ↓ Points to
Azure App Service / AWS / Heroku (Application)
```

This is what we started with - better separation of concerns.

---

## 📋 GoDaddy VPS Deployment Checklist

### Prerequisites
- [ ] GoDaddy VPS purchased
- [ ] SSH access confirmed
- [ ] Domain points to VPS IP

### Installation
- [ ] Node.js 18 installed
- [ ] npm working
- [ ] PostgreSQL installed and running
- [ ] Database "jobsphere" created
- [ ] Database user with permissions created

### Application Setup
- [ ] Repository cloned from GitHub
- [ ] `npm install` completed
- [ ] `npm run build` successful
- [ ] `.env.local` configured with correct DATABASE_URL
- [ ] Prisma migrations run: `npx prisma db push`
- [ ] Database seeded: `npx prisma db seed`

### Process Management
- [ ] PM2 installed globally
- [ ] Application started with PM2: `pm2 start npm --name "jobsphere" -- start`
- [ ] PM2 configured for startup: `pm2 startup && pm2 save`
- [ ] `pm2 status` shows app running

### Web Server
- [ ] Nginx installed
- [ ] Nginx config created for proxy
- [ ] Nginx started and enabled
- [ ] `nginx -t` passes validation

### SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate generated
- [ ] Nginx updated with HTTPS
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured

### Domain
- [ ] GoDaddy A record points to VPS IP
- [ ] GoDaddy CNAME configured for www
- [ ] DNS propagated (check whatsmydns.net)
- [ ] `https://yourdomain.com` loads

### Testing
- [ ] Application loads without errors
- [ ] Login works
- [ ] Database queries work
- [ ] SSL certificate shows valid
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔧 VPS Management Commands

### Monitor Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs jobsphere

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart jobsphere
```

### Check Services

```bash
# Nginx status
systemctl status nginx

# PostgreSQL status
systemctl status postgresql

# Node.js process
ps aux | grep node
```

### Database Backup

```bash
# Backup database
pg_dump -U jobsphereuser jobsphere > /backup/jobsphere_$(date +%Y%m%d).sql

# Restore database
psql -U jobsphereuser jobsphere < /backup/jobsphere_20260212.sql
```

### View Disk Usage

```bash
# Check disk space
df -h

# Check folder sizes
du -sh /var/www/JobSphere/*
```

---

## 💰 Cost Comparison

| Option | Monthly Cost | Effort | Best For |
|---|---|---|---|
| **GoDaddy Shared** | $2.99 | Low | NOT suitable for Node.js |
| **GoDaddy VPS** | $19.99+ | Medium | Small-medium apps |
| **GoDaddy Dedicated** | $49.99+ | Medium | Large apps |
| **Azure (Our setup)** | $140/mo | Low | Auto-scaling, managed |
| **AWS EC2** | $15+/mo | Medium | Full control |

---

## ⚠️ Pros & Cons: GoDaddy VPS vs Azure

### GoDaddy VPS

**Pros:**
- ✅ Everything in one place (domain + hosting)
- ✅ Simpler setup visually
- ✅ Cheaper than premium tiers
- ✅ Full server control

**Cons:**
- ❌ Manual database backups
- ❌ Manual SSL renewal (we use Certbot auto-renew)
- ❌ Manual security updates
- ❌ No auto-scaling for traffic spikes
- ❌ Limited support for Node.js
- ❌ Single point of failure

### Azure (Current Setup)

**Pros:**
- ✅ Auto-scaling
- ✅ Auto SSL renewal
- ✅ Automatic backups
- ✅ Better managed security
- ✅ Application Insights monitoring
- ✅ Integrated with GitHub Actions CI/CD

**Cons:**
- ❌ Slightly more expensive
- ❌ Less direct server access
- ❌ Separate domain setup

---

## 🎯 Recommendation

**For JobSphere, I recommend:**

```
✅ Keep: Azure App Service (proven, tested, auto-scaling)
✅ Keep: GoDaddy Domain Hosting (standard practice)
✅ Skip: GoDaddy VPS/Hosting (unnecessary complexity)

This separates concerns:
- Domain registration → GoDaddy
- Application hosting → Azure
- Database → Azure PostgreSQL
```

**If you insist on GoDaddy VPS:**
- Use minimum $39.99/month (Deluxe) plan
- Set up all backup scripts
- Monitor logs regularly
- Manual security updates required
- Performance depends on server load

---

## 🚀 If You Choose GoDaddy VPS

Quick setup script:

```bash
#!/bin/bash

# Run as root on GoDaddy VPS
sudo su -

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

echo "✅ Basic setup complete!"
echo "Next steps:"
echo "1. Configure PostgreSQL"
echo "2. Clone JobSphere repository"
echo "3. Setup Nginx reverse proxy"
echo "4. Install SSL certificate"
echo "5. Configure PM2 for auto-start"
```

---

## 📞 Support

- **GoDaddy Support**: https://www.godaddy.com/help
- **Node.js Hosting**: Consider Heroku, Vercel, or AWS instead
- **Database Performance**: AWS RDS might be better than VPS PostgreSQL

---

**Final Verdict**: Azure + GoDaddy Domain = Best option for JobSphere

**Last Updated**: February 12, 2026
