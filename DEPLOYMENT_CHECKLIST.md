# Azure Deployment Checklist

Complete this checklist before deploying JobSphere to Azure App Service.

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Azure subscription active
- [ ] Azure CLI installed (`az --version`)
- [ ] Git configured with SSH keys (optional but recommended)
- [ ] Node.js 18+ installed locally
- [ ] npm/yarn available
- [ ] Docker installed (if using container deployment)

### Code Quality
- [ ] Run `npm run lint` - all linting issues resolved
- [ ] Run TypeScript compiler: `npx tsc --noEmit` - no errors
- [ ] All environment variables documented in `.env.production.example`
- [ ] Check `.gitignore` contains all sensitive files
- [ ] No hardcoded secrets in codebase
- [ ] No console.log() statements (or configured for production)

### Testing
- [ ] Local development server runs: `npm run dev`
- [ ] Authentication flows tested (login, register, forgot password)
- [ ] Database queries tested
- [ ] API endpoints tested with Postman/curl
- [ ] Search and filter functionality verified
- [ ] Mobile responsiveness checked
- [ ] All links and navigation working

### Git
- [ ] All changes committed
- [ ] Code pushed to GitHub (`git push origin main`)
- [ ] Branch protection rules configured (if using GitHub)
- [ ] Commit history clean
- [ ] No uncommitted changes (`git status`)

---

## 🏗️ Azure Infrastructure Checklist

### Resource Group
- [ ] Resource group created in desired region
- [ ] Resource group name documented
- [ ] Access controls configured

### App Service Plan
- [ ] Plan created with appropriate SKU
- [ ] Linux selected as OS
- [ ] Node.js 18 LTS runtime selected
- [ ] Auto-scaling configured (if needed)

### Web App (App Service)
- [ ] Web app created with unique name
- [ ] App name verified globally unique
- [ ] Application type set to "Web"
- [ ] Managed Identity enabled (recommended)

### PostgreSQL Database
- [ ] PostgreSQL server created
- [ ] PostgreSQL version 11+ selected
- [ ] Database "jobsphere" created
- [ ] Admin credentials saved securely
- [ ] Firewall rules configured:
  - [ ] AllowAzureServices rule created (0.0.0.0 - 0.0.0.0)
  - [ ] Your IP allowed (for local development)

### DNS & SSL
- [ ] HTTPS enforced on App Service
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate configured (auto or manual)
- [ ] URL reachable via HTTPS

---

## 🔐 Security Checklist

### Environment Variables
- [ ] NEXTAUTH_SECRET generated: `openssl rand -base64 32`
- [ ] DATABASE_URL set to PostgreSQL connection string
- [ ] NEXTAUTH_URL set to production URL
- [ ] NODE_ENV set to "production"
- [ ] All secrets stored in Azure Key Vault (recommended)
- [ ] Secrets never committed to git

### OAuth Configuration
- [ ] Google OAuth credentials obtained from Google Cloud Console
- [ ] Redirect URI set to: `https://jobsphere-app.azurewebsites.net/api/auth/callback/google`
- [ ] OAuth credentials stored in Azure Key Vault
- [ ] OAuth endpoints tested in production

### Database Security
- [ ] Strong password for database admin (12+ chars, mixed case, numbers, symbols)
- [ ] Admin password stored in secure location (not in code)
- [ ] Database backups enabled
- [ ] SSL connection enforced for database
- [ ] Minimal required permissions assigned to app user

### Application Security
- [ ] Security headers configured in `web.config`
- [ ] CORS properly configured
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma ORM used)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented (NextAuth provides this)

### Network Security
- [ ] Firewall rules restrictive
- [ ] VNet integration considered (for enterprise)
- [ ] DDoS protection standard enabled
- [ ] WAF (Web Application Firewall) configured
- [ ] Secrets not logged

---

## 🚀 Deployment Checklist

### Using PowerShell Script (Windows)
- [ ] Execute deployment script: `.\deploy-azure.ps1 -AppName jobsphere-app`
- [ ] Script completes without errors
- [ ] Resources appear in Azure Portal

### Using Bash Script (macOS/Linux)
- [ ] Make script executable: `chmod +x deploy-azure.sh`
- [ ] Execute script: `./deploy-azure.sh jobsphere-app`
- [ ] Script completes successfully

### Manual Azure CLI Deployment
- [ ] Resource group created
- [ ] App Service plan created
- [ ] Web app created
- [ ] PostgreSQL server created
- [ ] Database created
- [ ] Firewall rules configured
- [ ] Environment variables set

### Git Push Deployment
- [ ] Local git remote added: `git remote add azure <url>`
- [ ] Code pushed to Azure: `git push azure main`
- [ ] Deployment logs monitored in Azure Portal
- [ ] Build completed successfully
- [ ] Application started without errors

### Docker Deployment
- [ ] Dockerfile created and tested locally
- [ ] `.dockerignore` file created
- [ ] Docker image builds successfully: `docker build -t jobsphere .`
- [ ] Image runs locally: `docker run -p 3000:3000 jobsphere`
- [ ] Container registry created in Azure
- [ ] Image pushed to registry
- [ ] Container instance created from image
- [ ] App accessible via container endpoint

---

## 🗄️ Database Initialization Checklist

### Prisma Migrations
- [ ] Connect to production database via SSH
- [ ] Run: `npx prisma db push --skip-generate`
- [ ] No migration errors
- [ ] All tables created
- [ ] Indexes created

### Database Seeding
- [ ] Seed script created (`prisma/seed.ts`)
- [ ] Run: `npx prisma db seed`
- [ ] Demo data loaded successfully
- [ ] Demo users created with test credentials
- [ ] Test companies created
- [ ] Test jobs created
- [ ] Verify data in database:
  ```sql
  SELECT COUNT(*) FROM "User";
  SELECT COUNT(*) FROM "Job";
  SELECT COUNT(*) FROM "Company";
  ```

### Data Validation
- [ ] All tables have data
- [ ] Relationships are intact
- [ ] Foreign keys working
- [ ] Constraints enforced
- [ ] Indexes created for performance

---

## ✅ Post-Deployment Checklist

### Application Testing
- [ ] App loads without errors: `https://jobsphere-app.azurewebsites.net`
- [ ] Navigation works
- [ ] Login page renders
- [ ] Register page works
- [ ] Job search functional
- [ ] Dashboard accessible after login
- [ ] API endpoints responding (check in console)
- [ ] Database queries working
- [ ] File uploads working (if applicable)
- [ ] Email notifications sent (if configured)

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Database queries optimized
- [ ] API response time < 1 second
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Network tab shows no 404/500 errors

### Error Handling
- [ ] Check Application Insights for errors
- [ ] View App Service logs: `az webapp log tail --resource-group jobsphere-rg --name jobsphere-app`
- [ ] Handle 404 errors gracefully
- [ ] 500 errors logged and visible
- [ ] User-friendly error messages displayed

### Monitoring & Alerts
- [ ] Application Insights configured
- [ ] Alerts set up for:
  - [ ] High CPU usage (>80%)
  - [ ] High memory usage (>80%)
  - [ ] Slow response times (>2s)
  - [ ] Application errors
- [ ] Email notifications enabled for alerts
- [ ] Log aggregation configured
- [ ] Dashboard created for monitoring

### Backups & Recovery
- [ ] Database backups enabled (automatic)
- [ ] Backup retention set to 7+ days
- [ ] App Service backup configured
- [ ] Recovery plan tested (optional)
- [ ] Backup location documented

---

## 🔧 Configuration Verification

### Environment Variables
- [ ] DATABASE_URL working
- [ ] NEXTAUTH_SECRET set
- [ ] NEXTAUTH_URL matches deployment URL
- [ ] NODE_ENV set to "production"
- [ ] Google OAuth credentials working
- [ ] Other integrations configured

### Application Settings
- [ ] Node version correct: `node -v`
- [ ] npm modules installed: `npm list`
- [ ] Build output correct size
- [ ] Static files served from `/public`
- [ ] API routes responding
- [ ] WebSocket connections (if used) working

### Azure Settings
- [ ] App Service always-on enabled (if not on free tier)
- [ ] HTTP/2 enabled
- [ ] HTTPS enforced
- [ ] Managed identity enabled
- [ ] Application settings synced
- [ ] Connection strings correct

---

## 📊 Documentation Checklist

- [ ] Deployment guide created and reviewed
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] User roles and permissions documented
- [ ] Troubleshooting guide created
- [ ] Team members informed of deployment
- [ ] Release notes prepared
- [ ] README updated with production URL
- [ ] Architecture diagrams updated

---

## 🎯 Final Verification

### URLs to Test
- [ ] Production URL: `https://jobsphere-app.azurewebsites.net`
- [ ] Health check: `/api/health` (if implemented)
- [ ] Login: `/login`
- [ ] Register: `/register`
- [ ] Jobs Search: `/jobs/search`
- [ ] Dashboard: `/dashboard`

### User Testing
- [ ] Create test account as Job Seeker
- [ ] Create test account as Employer
- [ ] Test complete user flow
- [ ] Test admin functionalities
- [ ] Verify email notifications
- [ ] Test OAuth login (Google)

### Notification
- [ ] Alert team to production deployment
- [ ] Share production URL with stakeholders
- [ ] Monitor for first 24 hours
- [ ] Prepare rollback plan if needed

---

## 📝 Sign-Off

- **Deployed by**: ___________________
- **Date**: ___________________
- **Verified by**: ___________________
- **Status**: ✅ Ready for Production / ⚠️ Needs Changes

### Notes
```
[Add any important notes, issues encountered, or improvements needed]




```

---

## Quick Links
- Azure Portal: https://portal.azure.com
- App Service: https://portal.azure.com/jobsphere-app
- GitHub Repository: https://github.com/harshaveeranki17/JobSphere
- Documentation: See AZURE_DEPLOYMENT.md

---

**Last Updated**: February 12, 2026  
**Version**: 1.0
