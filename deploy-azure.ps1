# Azure App Service Deployment Script for Windows PowerShell
# This script automates the setup of Azure resources for JobSphere

param(
    [Parameter(Mandatory = $true)]
    [string]$AppName,
    
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "jobsphere-rg",
    
    [Parameter(Mandatory = $false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory = $false)]
    [string]$AppServicePlan = "jobsphere-plan",
    
    [Parameter(Mandatory = $false)]
    [string]$DbName = "jobsphere-db",
    
    [Parameter(Mandatory = $false)]
    [string]$DbAdminUser = "dbadmin",
    
    [Parameter(Mandatory = $false)]
    [string]$Sku = "B2"
)

# Color output
$ErrorColor = 'Red'
$SuccessColor = 'Green'
$InfoColor = 'Cyan'

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $SuccessColor
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $ErrorColor
}

# Check if logged in to Azure
Write-Info "Checking Azure CLI login status..."
$azureUser = az account show --query user.name -o tsv 2>$null

if (-not $azureUser) {
    Write-Error "Not logged into Azure. Please run 'az login' first."
    exit 1
}

Write-Success "Logged in as: $azureUser"

# Generate secure password for database
Write-Info "Generating secure database password..."
$bytes = New-Object byte[] 16
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$rng.GetBytes($bytes)
$dbPassword = [Convert]::ToBase64String($bytes)
Write-Success "Password generated (save this): $dbPassword"

# Create Resource Group
Write-Info "Creating resource group: $ResourceGroup..."
az group create --name $ResourceGroup --location $Location
if ($LASTEXITCODE -eq 0) {
    Write-Success "Resource group created successfully"
}

# Create App Service Plan
Write-Info "Creating App Service Plan: $AppServicePlan..."
az appservice plan create `
    --name $AppServicePlan `
    --resource-group $ResourceGroup `
    --sku $Sku `
    --is-linux

if ($LASTEXITCODE -eq 0) {
    Write-Success "App Service Plan created successfully"
}

# Create Web App
Write-Info "Creating Web App: $AppName..."
az webapp create `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --name $AppName `
    --runtime "node|18-lts"

if ($LASTEXITCODE -eq 0) {
    Write-Success "Web App created successfully"
}

# Create PostgreSQL Server
Write-Info "Creating PostgreSQL Database Server: $DbName..."
$dbServerName = "$DbName"

az postgres server create `
    --resource-group $ResourceGroup `
    --name $dbServerName `
    --location $Location `
    --admin-user $DbAdminUser `
    --admin-password $dbPassword `
    --sku-name B_Gen5_1 `
    --storage-size 51200 `
    --version 11

if ($LASTEXITCODE -eq 0) {
    Write-Success "PostgreSQL Server created successfully"
}

# Create database
Write-Info "Creating database..."
az postgres db create `
    --resource-group $ResourceGroup `
    --server-name $dbServerName `
    --name "jobsphere"

if ($LASTEXITCODE -eq 0) {
    Write-Success "Database created successfully"
}

# Configure firewall to allow Azure services
Write-Info "Configuring firewall..."
az postgres server firewall-rule create `
    --resource-group $ResourceGroup `
    --server $dbServerName `
    --name "AllowAzureServices" `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

Write-Success "Firewall rule created"

# Get connection string
Write-Info "Retrieving database connection string..."
$connectionString = az postgres server show-connection-string `
    --server-name $dbServerName `
    --admin-user $DbAdminUser `
    --admin-password $dbPassword `
    -o tsv

Write-Success "Connection String (for .env.local):"
Write-Host $connectionString -ForegroundColor Yellow

# Generate NEXTAUTH_SECRET
Write-Info "Generating NEXTAUTH_SECRET..."
$secret = [Convert]::ToBase64String((New-Object byte[] 32 | % { [byte](Get-Random 256) }))
Write-Success "NEXTAUTH_SECRET generated (save this):"
Write-Host $secret -ForegroundColor Yellow

# Configure Web App settings
Write-Info "Configuring Web App environment variables..."
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings `
    NODE_ENV="production" `
    WEBSITE_NODE_DEFAULT_VERSION="18.17.1"

Write-Success "Web App configured"

# Display summary
Write-Host "`n" + ("=" * 60)
Write-Success "DEPLOYMENT SETUP COMPLETE!"
Write-Host ("=" * 60) + "`n"

Write-Info "Summary:"
Write-Host "  Resource Group: $ResourceGroup"
Write-Host "  Web App: $AppName"
Write-Host "  App Service Plan: $AppServicePlan"
Write-Host "  Database Server: $dbServerName"
Write-Host "  Database: jobsphere"
Write-Host "  Location: $Location"

Write-Info "`nNext Steps:"
Write-Host "1. Save this information securely!"
Write-Host "2. Add these to your .env.local file:"
Write-Host "   DATABASE_URL=$connectionString"
Write-Host "   NEXTAUTH_SECRET=$secret"
Write-Host "3. Go to Azure Portal and configure:"
Write-Host "   - GOOGLE_CLIENT_ID"
Write-Host "   - GOOGLE_CLIENT_SECRET"
Write-Host "   - NEXTAUTH_URL=https://$AppName.azurewebsites.net"
Write-Host "4. Deploy your application:"
Write-Host "   git remote add azure https://$AppName.scm.azurewebsites.net:443/$AppName.git"
Write-Host "   git push azure main"
Write-Host "5. Run migrations:"
Write-Host "   npx prisma db push"

Write-Host "`nResources created in Azure. Visit: https://portal.azure.com"
