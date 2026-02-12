# Azure Deployment - Quick Reference Guide

Fast-track deployment instructions for JobSphere to Azure App Service.

---

## ⚡ 5-Minute Setup (PowerShell - Windows)

```powershell
# 1. Login to Azure
az login

# 2. Run automated setup script
.\deploy-azure.ps1 -AppName jobsphere-app

# 3. Note the outputs:
#    - Database password
#    - Connection string
#    - NEXTAUTH_SECRET

# 4. Configure environment variables in Azure Portal
# 5. Deploy code: git push azure main
# 6. Run migrations and seed: SSH into app and run npx prisma db push
```

---

## ⚡ 5-Minute Setup (Bash - macOS/Linux)

```bash
# 1. Login to Azure
az login

# 2. Make script executable and run
chmod +x deploy-azure.sh
./deploy-azure.sh jobsphere-app

# 3. Follow the same steps 3-6 as PowerShell
```

---

## 🚀 Fastest Deployment: GitHub Actions

### Step 1: Generate Azure Publish Profile
```bash
# In Azure Portal → App Service → Deployment Center
# Download: "Get publish profile"
# This will download a .PublishSettings file
```

### Step 2: Add GitHub Secret
```bash
# Go to GitHub Repo → Settings → Secrets → New repository secret
# Name: AZURE_PUBLISH_PROFILE
# Paste: Contents of the .PublishSettings file
```

### Step 3: Push to Main
```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

**Done!** GitHub Actions automatically builds and deploys on every push to main.

---

## 📋 Manual Deployment Steps (15 minutes)

### Create Resources
```bash
# Set variables
RESOURCE_GROUP="jobsphere-rg"
APP_NAME="jobsphere-app"
LOCATION="eastus"

# Login
az login

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan
az appservice plan create \
  --name jobsphere-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B2 --is-linux

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan jobsphere-plan \
  --name $APP_NAME \
  --runtime "node|18-lts"

# Create PostgreSQL
az postgres server create \
  --resource-group $RESOURCE_GROUP \
  --name jobsphere-db \
  --location $LOCATION \
  --admin-user dbadmin \
  --admin-password "YourSecure@Password123"

# Create database
az postgres db create \
  --resource-group $RESOURCE_GROUP \
  --server-name jobsphere-db \
  --name jobsphere

# Allow Azure services
az postgres server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server jobsphere-db \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Get Connection String
```bash
az postgres server show-connection-string \
  --server-name jobsphere-db \
  --admin-user dbadmin \
  --admin-password "YourSecure@Password123"

# Output format: 
# postgresql://dbadmin:YourSecure@Password123@jobsphere-db.postgres.database.azure.com:5432/jobsphere
```

### Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Save this output - add to Azure App Service settings
```

### Set Environment Variables
```bash
az webapp config appsettings set \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --settings \
    DATABASE_URL="postgresql://dbadmin:Password@jobsphere-db.postgres.database.azure.com:5432/jobsphere" \
    NEXTAUTH_URL="https://jobsphere-app.azurewebsites.net" \
    NEXTAUTH_SECRET="your-secret-here" \
    NODE_ENV="production" \
    GOOGLE_CLIENT_ID="your-google-id" \
    GOOGLE_CLIENT_SECRET="your-google-secret"
```

### Deploy Code
```bash
# Add Azure remote
az webapp deployment source config-local-git \
  --resource-group jobsphere-rg \
  --name jobsphere-app

# Get the URL from output, then:
git remote add azure <URL-from-above>

# Push code
git push azure main
```

### Initialize Database
```bash
# SSH into app
az webapp create-remote-connection \
  --resource-group jobsphere-rg \
  --name jobsphere-app

# In SSH session:
cd /home/site/wwwroot
npx prisma db push
npx prisma db seed
```

---

## 🐳 Docker Deployment (20 minutes)

### Build & Push Docker Image
```bash
# Login to Azure
az acr login --name jobsphereregistry

# Build image
docker build -t jobsphereregistry.azurecr.io/jobsphere:latest .

# Push to registry
docker push jobsphereregistry.azurecr.io/jobsphere:latest

# Deploy to App Service
az webapp create \
  --resource-group jobsphere-rg \
  --plan jobsphere-plan \
  --name jobsphere-app \
  --deployment-container-image-name jobsphereregistry.azurecr.io/jobsphere:latest \
  --deployment-container-registry-url https://jobsphereregistry.azurecr.io
```

---

## 🔍 Verify Deployment

### Check Application Status
```bash
# Check if running
az webapp show --resource-group jobsphere-rg --name jobsphere-app \
  --query "state"

# View logs
az webapp log tail --resource-group jobsphere-rg --name jobsphere-app

# Visit application
# https://jobsphere-app.azurewebsites.net
```

### Test API Endpoints
```bash
# Health check
curl https://jobsphere-app.azurewebsites.net/

# Login
curl -X POST https://jobsphere-app.azurewebsites.net/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get jobs
curl https://jobsphere-app.azurewebsites.net/api/jobs
```

---

## 🚨 Common Issues & Quick Fixes

### No "node" command found
```bash
az webapp config appsettings set \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --settings WEBSITE_NODE_DEFAULT_VERSION="18.17.1"
```

### Database connection timeout
- Check PostgreSQL firewall rule includes Azure (0.0.0.0)
- Verify DATABASE_URL format
- Test locally first with `npx prisma db push`

### Prisma migrations fail
```bash
# In app SSH:
npx prisma db push --force --skip-generate
```

### App shows 500 error
```bash
# Check logs
az webapp log tail --resource-group jobsphere-rg --name jobsphere-app

# Check environment variables set correctly
az webapp config appsettings list \
  --resource-group jobsphere-rg \
  --name jobsphere-app
```

### Slow application
- Scale up: `az appservice plan update --sku S1`
- Check database queries
- Enable caching
- Review Application Insights

---

## 💾 Useful Commands

### View All Resources
```bash
az resource list --resource-group jobsphere-rg -o table
```

### View Web App Configuration
```bash
az webapp config show --resource-group jobsphere-rg --name jobsphere-app
```

### View Environment Variables
```bash
az webapp config appsettings list \
  --resource-group jobsphere-rg \
  --name jobsphere-app
```

### Scale Up App Service
```bash
az appservice plan update \
  --name jobsphere-plan \
  --resource-group jobsphere-rg \
  --sku S1
```

### Enable HTTPS Only
```bash
az webapp update \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --set httpsOnly=true
```

### Delete Everything (Clean Up)
```bash
# WARNING: This deletes all resources!
az group delete --resource-group jobsphere-rg
```

---

## 📱 Access Your App

- **Production URL**: `https://jobsphere-app.azurewebsites.net`
- **Azure Portal**: `https://portal.azure.com`
- **GitHub Actions**: `https://github.com/harshaveeranki17/JobSphere/actions`
- **Application Insights**: Portal → App Service → Application Insights

---

## 🔐 Security Checklist (Quick)

- [ ] HTTPS enforced
- [ ] Secrets in environment variables (not hardcoded)
- [ ] PostgreSQL firewall configured
- [ ] Managed Identity enabled
- [ ] Application Insights monitoring enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented

---

## 💰 Cost Optimization

```
Production Setup:
- App Service (B2): $50/month
- PostgreSQL (B_Gen5_1): $85/month
- Storage: ~$2/month
- Total: ~$140/month

To Reduce Costs:
- Use B1 instead of B2: saves $20/month
- Use Single Server instead of Flexible: saves $30/month
- Enable auto-shutdown for dev: saves on unused resources
```

---

## 📞 Support

- **Azure Support**: https://support.microsoft.com/azure
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **GitHub Issues**: https://github.com/harshaveeranki17/JobSphere/issues

---

## ✨ Pro Tips

1. **Use GitHub Actions for CI/CD** - Automates rebuilds and deployments
2. **Enable Application Insights** - Monitor performance and errors in real-time
3. **Configure auto-scale** - Handles traffic spikes automatically
4. **Use Key Vault** - Store secrets securely instead of app settings
5. **Enable backups** - Database backups run automatically
6. **Monitor costs** - Set up budget alerts in Azure

---

**Last Updated**: February 12, 2026  
**Status**: Ready for Production Deployment
