#!/bin/bash

# Azure App Service Deployment Script for macOS/Linux
# This script automates the setup of Azure resources for JobSphere

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
APP_NAME="${1:-}"
RESOURCE_GROUP="${2:-jobsphere-rg}"
LOCATION="${3:-eastus}"
APP_SERVICE_PLAN="${4:-jobsphere-plan}"
DB_NAME="${5:-jobsphere-db}"
DB_ADMIN="${6:-dbadmin}"
SKU="${7:-B2}"

# Function to print colored messages
print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Validate required parameters
if [ -z "$APP_NAME" ]; then
    print_error "App name is required"
    echo "Usage: ./deploy-azure.sh <app-name> [resource-group] [location] [app-service-plan] [db-name] [db-admin] [sku]"
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Visit: https://learn.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
print_info "Checking Azure CLI login status..."
if ! az account show &> /dev/null; then
    print_error "Not logged into Azure. Please run 'az login' first."
    exit 1
fi

AZURE_USER=$(az account show --query user.name -o tsv)
print_success "Logged in as: $AZURE_USER"

# Generate secure password for database
print_info "Generating secure database password..."
DB_PASSWORD=$(openssl rand -base64 16)
print_success "Password generated (save this): $DB_PASSWORD"

# Create Resource Group
print_info "Creating resource group: $RESOURCE_GROUP..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" > /dev/null
print_success "Resource group created"

# Create App Service Plan
print_info "Creating App Service Plan: $APP_SERVICE_PLAN..."
az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --sku "$SKU" \
    --is-linux > /dev/null
print_success "App Service Plan created"

# Create Web App
print_info "Creating Web App: $APP_NAME..."
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$APP_NAME" \
    --runtime "node|18-lts" > /dev/null
print_success "Web App created"

# Create PostgreSQL Server
print_info "Creating PostgreSQL Database Server: $DB_NAME..."
az postgres server create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DB_NAME" \
    --location "$LOCATION" \
    --admin-user "$DB_ADMIN" \
    --admin-password "$DB_PASSWORD" \
    --sku-name "B_Gen5_1" \
    --storage-size 51200 \
    --version 11 > /dev/null
print_success "PostgreSQL Server created"

# Create database
print_info "Creating database..."
az postgres db create \
    --resource-group "$RESOURCE_GROUP" \
    --server-name "$DB_NAME" \
    --name "jobsphere" > /dev/null
print_success "Database created"

# Configure firewall to allow Azure services
print_info "Configuring firewall..."
az postgres server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --server "$DB_NAME" \
    --name "AllowAzureServices" \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 > /dev/null
print_success "Firewall rule created"

# Get connection string
print_info "Retrieving database connection string..."
CONNECTION_STRING=$(az postgres server show-connection-string \
    --server-name "$DB_NAME" \
    --admin-user "$DB_ADMIN" \
    --admin-password "$DB_PASSWORD" \
    -o tsv)
print_success "Connection string retrieved"

# Generate NEXTAUTH_SECRET
print_info "Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
print_success "NEXTAUTH_SECRET generated"

# Configure Web App settings
print_info "Configuring Web App environment variables..."
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --settings \
    NODE_ENV="production" \
    WEBSITE_NODE_DEFAULT_VERSION="18.17.1" > /dev/null
print_success "Web App configured"

# Display summary
echo ""
echo "========================================================="
print_success "DEPLOYMENT SETUP COMPLETE!"
echo "========================================================="
echo ""

print_info "Summary:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Web App URL: https://$APP_NAME.azurewebsites.net"
echo "  App Service Plan: $APP_SERVICE_PLAN"
echo "  Database Server: $DB_NAME"
echo "  Database: jobsphere"
echo "  Location: $LOCATION"
echo ""

print_info "Database Credentials:"
echo "  Admin User: $DB_ADMIN"
echo "  Password: $DB_PASSWORD"
echo ""

print_info "Add these to your .env.local file:"
echo "  DATABASE_URL=$CONNECTION_STRING"
echo "  NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "  NEXTAUTH_URL=https://$APP_NAME.azurewebsites.net"
echo ""

print_info "Next Steps:"
echo "1. Save database password and secrets securely!"
echo "2. Add the above environment variables to your .env.local"
echo "3. Configure in Azure Portal:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "4. Deploy your application:"
echo "   git remote add azure https://$APP_NAME.scm.azurewebsites.net:443/$APP_NAME.git"
echo "   git push azure main"
echo "5. Run migrations from app SSH:"
echo "   npx prisma db push"
echo ""

print_success "Resources created in Azure. Visit: https://portal.azure.com"
