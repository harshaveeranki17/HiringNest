# Deploy HiringNest to Azure App Service

Complete guide to deploy your Next.js HiringNest application to Microsoft Azure App Service.

## 📋 Prerequisites

1. **Azure Account** - Sign up at https://azure.microsoft.com/free/
2. **Azure CLI** - Download from https://learn.microsoft.com/cli/azure/install-azure-cli
3. **Git** - Already installed
4. **Node.js 18+** - Already installed

## 🔧 Step 1: Set Up Azure Resources

### 1.1 Login to Azure
```bash
az login
```
This opens a browser window for authentication.

### 1.2 Create a Resource Group
```bash
az group create --name hiringnest-rg --location eastus
```

Replace `eastus` with your preferred region:
- `eastus` - East US
- `westus` - West US
- `northeurope` - North Europe
- `westeurope` - West Europe

### 1.3 Create App Service Plan
```bash
az appservice plan create \
  --name hiringnest-plan \\
  --resource-group hiringnest-rg \\
  --sku B2 \
  --is-linux
```

**SKU Options:**
- `B1` - Basic (shared, cheaper)
- `B2` - Standard (recommended for development)
- `S1` - Standard (production)
- `P1V2` - Premium (high performance)

### 1.4 Create Azure Web App
```bash
az webapp create \
  --resource-group jobsphere-rg \
  --plan hiringnest-plan \\
  --name hiringnest-app \\
  --runtime "node|18-lts"
```

Replace `hiringnest-app` with your desired app name (must be globally unique).

### 1.5 Create Azure Database for PostgreSQL
```bash
az postgres server create \
  --resource-group jobsphere-rg \
  --name hiringnest-db \\
  --location eastus \
  --admin-user dbadmin \
  --admin-password YourSecurePassword123! \
  --sku-name B_Gen5_1 \
  --storage-size 51200
```

**Save your password** - you'll need it for DATABASE_URL.

### 1.6 Create Database
```bash
az postgres db create \
  --resource-group jobsphere-rg \
  --server-name hiringnest-db \\
  --name jobsphere
```

### 1.7 Configure Database Firewall
Allow Azure services to access the database:
```bash
az postgres server firewall-rule create \
  --resource-group jobsphere-rg \
  --server hiringnest-db \\
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Allow your IP for local development:
```bash
az postgres server firewall-rule create \
  --resource-group jobsphere-rg \
  --server jobsphere-db \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

Replace `YOUR_IP` with your public IP address.

## 🔐 Step 2: Configure Environment Variables

### 2.1 Get Database Connection String
```bash
az postgres server show-connection-string \
  --server-name jobsphere-db \
  --admin-user dbadmin \
  --admin-password YourSecurePassword123!
```

Or manually construct:
```
postgresql://dbadmin:YourSecurePassword123!@jobsphere-db.postgres.database.azure.com:5432/jobsphere
```

### 2.2 Set App Configuration
```bash
az webapp config appsettings set \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --settings \
    DATABASE_URL="postgresql://dbadmin:YourSecurePassword123!@jobsphere-db.postgres.database.azure.com:5432/jobsphere" \
    NEXTAUTH_URL="https://jobsphere-app.azurewebsites.net" \
    NEXTAUTH_SECRET="your-generated-secret-key" \
    NODE_ENV="production" \
    GOOGLE_CLIENT_ID="your-google-client-id" \
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2.3 Enable Managed Identity (Optional but Recommended)
```bash
az webapp identity assign \
  --resource-group jobsphere-rg \
  --name jobsphere-app
```

## 📦 Step 3: Prepare Application for Deployment

### 3.1 Create .azure/config.json
```json
{
  "defaults": {
    "group": "jobsphere-rg",
    "appservice_plan": "jobsphere-plan",
    "web": "jobsphere-app",
    "location": "eastus"
  }
}
```

### 3.2 Update package.json
Ensure build script is present:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### 3.3 Create production.env
Copy `.env.local` and update for production:
```env
DATABASE_URL="postgresql://dbadmin:Password@jobsphere-db.postgres.database.azure.com:5432/jobsphere"
NEXTAUTH_URL="https://jobsphere-app.azurewebsites.net"
NEXTAUTH_SECRET="your-secret-from-openssl"
NODE_ENV="production"
```

### 3.4 Add web.config for IIS (Windows) or Deployment Script
Create `web.config`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{PATH_INFO}" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <add segment="node_modules" />
        </hiddenSegments>
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

### 3.5 Create Azure Deployment Script
Create `.deployment`:
```bash
#!/bin/bash

# Install dependencies
npm install

# Build application
npm run build

# Run Prisma migrations
npx prisma db push --skip-generate

# Start application
npm start
```

## 🚀 Step 4: Deploy Application

### Option A: Deploy via Git (Recommended)

#### 4A.1 Configure Local Git Remote
```bash
az webapp deployment user set \
  --user-name deployment-user \
  --password your-deployment-password
```

#### 4A.2 Get Git URL
```bash
az webapp deployment source config-local-git \
  --resource-group jobsphere-rg \
  --name jobsphere-app
```

This returns a URL like: `https://jobsphere-deployment-user@jobsphere-app.scm.azurewebsites.net:443/jobsphere-app.git`

#### 4A.3 Add Azure Remote
```bash
git remote add azure <your-git-url>
```

#### 4A.4 Push to Azure
```bash
git push azure main
```

### Option B: Deploy via Azure DevOps

1. Go to https://dev.azure.com
2. Create new project
3. Create pipeline from GitHub repository
4. Select "Node.js with Next.js" template
5. Configure and save

### Option C: Deploy via ZIP File

```bash
# Build locally
npm run build

# Create deployment package
Compress-Archive -Path * -DestinationPath app.zip -Force

# Deploy
az webapp deployment source config-zip \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --src-path app.zip
```

### Option D: Deploy via Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

# Start app
EXPOSE 3000
CMD ["npm", "start"]
```

Create `azure-container.json`:
```json
{
  "location": "eastus",
  "name": "jobsphere-registry",
  "adminUserEnabled": true,
  "sku": "Basic"
}
```

Deploy:
```bash
# Create container registry
az acr create \
  --resource-group jobsphere-rg \
  --name jobsphereregistry \
  --sku Basic

# Build and push image
az acr build \
  --registry jobsphereregistry \
  --image jobsphere:latest .

# Deploy to App Service
az webapp create \
  --resource-group jobsphere-rg \
  --plan jobsphere-plan \
  --name jobsphere-app \
  --deployment-container-image-name jobsphereregistry.azurecr.io/jobsphere:latest \
  --deployment-container-registry-url https://jobsphereregistry.azurecr.io
```

## 🗄️ Step 5: Initialize Database

### 5.1 Connect to Production Database
```bash
# Using psql client
psql -h jobsphere-db.postgres.database.azure.com \
  -U dbadmin@jobsphere-db \
  -d jobsphere
```

Or use Azure Cloud Shell from Portal.

### 5.2 Run Migrations
Via SSH into the app:
```bash
# SSH into web app
az webapp create-remote-connection \
  --resource-group jobsphere-rg \
  --name jobsphere-app

# In the SSH session
cd /home/site/wwwroot
npx prisma db push
npx prisma db seed
```

Or run locally with production DATABASE_URL:
```bash
# Locally (with access)
npx prisma db push --skip-generate
npx prisma db seed
```

## 🔍 Step 6: Verify Deployment

### 6.1 Check App Status
```bash
az webapp show \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --query "state"
```

### 6.2 View Logs
```bash
az webapp log tail \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --provider azurefilesystemlogs
```

### 6.3 Test Application
Visit: `https://jobsphere-app.azurewebsites.net`

### 6.4 Check Deployment History
```bash
az webapp deployment list \
  --resource-group jobsphere-rg \
  --name jobsphere-app
```

## 🔒 Step 7: Security Configuration

### 7.1 Enable HTTPS Only
```bash
az webapp update \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --set httpsOnly=true
```

### 7.2 Add Custom Domain (Optional)
```bash
az webapp config hostname add \
  --resource-group jobsphere-rg \
  --webapp-name jobsphere-app \
  --hostname yourdomain.com
```

### 7.3 Configure SSL Certificate
```bash
az webapp config ssl bind \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --certificate-name jobsphere-cert \
  --ssl-type SNI
```

### 7.4 Enable Azure WAF (Web Application Firewall)
```bash
# Create WAF policy
az network waf-policy create \
  --resource-group jobsphere-rg \
  --name jobsphere-waf-policy
```

## 📊 Step 8: Monitoring & Performance

### 8.1 Enable Application Insights
```bash
az monitor app-insights component create \
  --resource-group jobsphere-rg \
  --app jobsphere-insights \
  --location eastus \
  --kind web
```

### 8.2 Set Up Alerts
```bash
az monitor metrics alert create \
  --resource-group jobsphere-rg \
  --name cpu-alert \
  --scopes /subscriptions/{subscription-id}/resourceGroups/jobsphere-rg/providers/Microsoft.Web/serverfarms/jobsphere-plan \
  --condition "avg Percentage CPU > 80"
```

### 8.3 Configure Auto-Scale
```bash
az monitor auto-scale create \
  --resource-group jobsphere-rg \
  --resource-type microsoft.web/serverfarms \
  --resource jobsphere-plan \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

## 🔧 Troubleshooting

### Issue: "npm not found"
**Solution**: Ensure Node runtime is set in App Service settings:
```bash
az webapp config appsettings set \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --settings WEBSITE_NODE_DEFAULT_VERSION="18.17.1"
```

### Issue: Database Connection Failed
**Solution**: 
1. Check firewall rules allow Azure services
2. Verify DATABASE_URL format
3. Test connection locally first

### Issue: Prisma Migrations Fail
**Solution**: Run migrations after deployment:
```bash
# In app SSH session
npx prisma db push --force
```

### Issue: Out of Memory
**Solution**: Scale up to larger plan:
```bash
az appservice plan update \
  --name jobsphere-plan \
  --resource-group jobsphere-rg \
  --sku S1
```

### Issue: Application Slow
**Solution**:
1. Enable Application Insights monitoring
2. Check database performance
3. Enable caching
4. Scale up compute

## 📝 Environment Variables Checklist

```env
✅ DATABASE_URL - PostgreSQL connection string
✅ NEXTAUTH_URL - Your app URL (https://jobsphere-app.azurewebsites.net)
✅ NEXTAUTH_SECRET - Generated secret for sessions
✅ NODE_ENV - Set to "production"
✅ GOOGLE_CLIENT_ID - From Google Cloud Console
✅ GOOGLE_CLIENT_SECRET - From Google Cloud Console
✅ SMTP_HOST - Email service (if configured)
✅ AZURE_STORAGE_CONNECTION_STRING - For file uploads (if used)
```

## 💰 Cost Estimation (USD/month)

- **App Service Plan (B2)**: ~$50
- **PostgreSQL (B_Gen5_1)**: ~$85
- **Storage**: ~$2
- **Data Transfer**: Variable (usually <$5)
- **Total**: ~$140-150/month

**To reduce costs:**
- Use App Service Free Tier for testing
- Use PostgreSQL Single Server (cheaper than Flexible Server)
- Enable auto-shutdown for dev environments

## 🚀 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run build
      run: npm run build
    
    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v3
      with:
        name: node-app
        path: .
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'jobsphere-app'
        slot-name: 'production'
        publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
        package: .
```

## 📚 Additional Resources

- [Azure App Service Documentation](https://learn.microsoft.com/azure/app-service/)
- [Deploying Next.js to Azure](https://nextjs.org/docs/deployment/azure)
- [Prisma Azure Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-azure)
- [Azure CLI Reference](https://learn.microsoft.com/cli/azure/reference-index)

## ✨ Post-Deployment Checklist

- [ ] Application is running (site loads without errors)
- [ ] Database migrations are complete
- [ ] Authentication works (login/register)
- [ ] API endpoints are functional
- [ ] HTTPS is enabled
- [ ] Monitoring/alerts are configured
- [ ] Backups are enabled
- [ ] Custom domain is configured (if applicable)
- [ ] Email notifications are working
- [ ] File uploads are working (if applicable)

---

**Deployment Status**: Ready for Production  
**Estimated Time**: 30-45 minutes for complete setup  
**Support**: Check Azure Portal → App Service → Logs for debugging
