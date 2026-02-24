# Azure App Service & Static Web App Setup Guide

This guide explains how to create the Azure resources needed for deploying Contoso Traders.

## Prerequisites

- Azure Subscription (with Owner or Contributor role)
- Azure CLI installed (optional, but recommended)

---

## Part 1: Create Azure App Service (Backend .NET Deployment)

The App Service will host your .NET 9 backend API.

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **+ Create a resource**
3. Search for **App Service** and click it
4. Click **Create**

**Fill in the form:**

| Field | Value | Example |
|--|--|--|
| **Subscription** | Select your subscription | (your subscription) |
| **Resource Group** | Click "Create new" | `contoso-traders-rg` |
| **Name** | Your app service name | `contoso-traders-api` |
| **Publish** | Code | (select Code) |
| **Runtime stack** | .NET 9 (LTS) | (select from dropdown) |
| **Operating System** | Linux | (recommended) |
| **Region** | Closest to you | `East US` |
| **App Service Plan** | Create new (Free or B1 tier) | (new) |

5. Click **Review + create** → **Create**
6. **Wait 2-3 minutes** for deployment

**After Creation:**
1. Go to the newly created App Service resource
2. Copy the URL from the top (e.g., `https://contoso-traders-api.azurewebsites.net`)
3. **Save this for later** → use as `AZURE_APPSERVICE_NAME`: `contoso-traders-api`

### Option B: Using Azure CLI

```bash
# Set variables
RESOURCE_GROUP="contoso-traders-rg"
APP_SERVICE_NAME="contoso-traders-api"
REGION="eastus"

# Login to Azure
az login

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $REGION

# Create App Service Plan (Free tier for testing)
az appservice plan create \
  --name "${APP_SERVICE_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku FREE \
  --is-linux

# Create App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_SERVICE_NAME}-plan" \
  --name $APP_SERVICE_NAME \
  --runtime "DOTNETCORE|9.0"

echo "✅ App Service created: $APP_SERVICE_NAME"
echo "URL: https://${APP_SERVICE_NAME}.azurewebsites.net"
```

---

## Part 2: Create Azure Static Web App (Frontend React Deployment)

Azure Static Web Apps is perfect for hosting your React frontend.

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **+ Create a resource**
3. Search for **Static Web App** and click it
4. Click **Create**

**Fill in the form:**

| Field | Value | Example |
|--|--|--|
| **Subscription** | Select your subscription | (your subscription) |
| **Resource Group** | Select existing or create | `contoso-traders-rg` |
| **Name** | Your static app name | `contoso-traders-web` |
| **Region** | Closest to you | `East US` |
| **Hosting plan** | Free | (Free tier) |

5. Click **Next: Deployment details**

**GitHub Connection (if deploying from GitHub):**
- Click **Sign in with GitHub** (optional - can skip for now)
- Or click **Skip for now**

6. Click **Review + create** → **Create**
7. **Wait 1-2 minutes** for deployment

**After Creation:**
1. Go to the newly created Static Web App
2. Click **Overview** → Copy the URL (e.g., `https://happy-ocean-123.azurewebsites.net`)
3. Click on **Manage deployment token** (in the right sidebar)
4. **Copy the token** → Save as `AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN` secret in GitHub

### Option B: Using Azure CLI

```bash
# Set variables
RESOURCE_GROUP="contoso-traders-rg"
STATIC_APP_NAME="contoso-traders-web"
REGION="eastus"

# Create Static Web App (without GitHub integration for now)
az staticwebapp create \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $REGION \
  --sku Free

echo "✅ Static Web App created: $STATIC_APP_NAME"

# Get deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" -o tsv)

echo "Deployment token: $DEPLOYMENT_TOKEN"
echo "Save this as AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN in GitHub Secrets"
```

---

## Part 3: Gather All Required Secrets

From the steps above, collect these values:

### Already have from OIDC Setup:
```
AZURE_CLIENT_ID=<from Entra ID app>
AZURE_TENANT_ID=<from Entra ID>
AZURE_SUBSCRIPTION_ID=<your subscription>
```

### New from App Service:
```
AZURE_APPSERVICE_NAME=contoso-traders-api
```

### New from Static Web App:
```
AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN=<token from static web app>
```

---

## Part 4: Add Resource Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value | From |
|--|--|--|
| `AZURE_CLIENT_ID` | Your Entra ID app ID | AZURE_OIDC_SETUP.md |
| `AZURE_TENANT_ID` | Your Entra ID Tenant ID | AZURE_OIDC_SETUP.md |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | AZURE_OIDC_SETUP.md |
| `AZURE_APPSERVICE_NAME` | `contoso-traders-api` | Part 1 above |
| `AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN` | Your deployment token | Part 2 above |

---

## Part 5: Configure Application Insights (Optional but Recommended)

If you want monitoring, add these secrets too:

```
APPLICATIONINSIGHTS_CONNECTION_STRING=<your connection string>
REACT_APP_APPINSIGHTS_CONNECTIONSTRING=<same connection string>
```

See `APPINSIGHTS_SETUP.md` for details.

---

## Part 6: Test the Resources

### Test App Service (Backend)

```bash
# Get the App Service URL
az webapp show \
  --resource-group contoso-traders-rg \
  --name contoso-traders-api \
  --query "defaultHostName" -o tsv

# Should output: contoso-traders-api.azurewebsites.net
```

Visit `https://contoso-traders-api.azurewebsites.net` in browser (should show "Hello World" or app startup page).

### Test Static Web App (Frontend)

```bash
# Get the Static Web App URL
az staticwebapp show \
  --resource-group contoso-traders-rg \
  --name contoso-traders-web \
  --query "properties.defaultHostname" -o tsv

# Should output: happy-ocean-123.azurewebsites.net
```

Visit that URL in browser (should be accessible, but empty until deployed).

---

## Part 7: Deploy Backend to App Service

Your workflow already has deployment configured. To deploy manually:

```bash
# From your local machine
cd backend

# Publish the app
dotnet publish -c Release -o ./publish

# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group contoso-traders-rg \
  --name contoso-traders-api \
  --src-path ./publish.zip
```

Or let GitHub Actions do it automatically when you push to `main`!

---

## Part 8: Deploy Frontend to Static Web App

Your workflow already has deployment configured. To deploy manually:

```bash
# From your local machine
cd frontend

# Build the app
npm install
npm run build

# Deploy (using Azure CLI)
az staticwebapp upload \
  --name contoso-traders-web \
  --source-path ./build \
  --login-with-github=false
```

Or let GitHub Actions do it automatically when you push to `main`!

---

## Quick Start Summary

### 1️⃣ Create Resources
```bash
# App Service
az webapp create \
  --resource-group contoso-traders-rg \
  --plan contoso-traders-plan \
  --name contoso-traders-api \
  --runtime "DOTNETCORE|9.0"

# Static Web App
az staticwebapp create \
  --name contoso-traders-web \
  --resource-group contoso-traders-rg \
  --location eastus \
  --sku Free
```

### 2️⃣ Get Deployment Token
```bash
az staticwebapp secrets list \
  --name contoso-traders-web \
  --resource-group contoso-traders-rg \
  --query "properties.apiKey" -o tsv
```

### 3️⃣ Add GitHub Secrets
```
AZURE_CLIENT_ID=...
AZURE_TENANT_ID=...
AZURE_SUBSCRIPTION_ID=...
AZURE_APPSERVICE_NAME=contoso-traders-api
AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN=...
```

### 4️⃣ Push to GitHub
```bash
git add .
git commit -m "Add Azure deployment configuration"
git push origin main
```

### 5️⃣ Watch Deployment
- Go to **Actions** tab in GitHub
- Click the running workflow
- Watch the `deploy-backend` and `deploy-frontend` jobs

---

## Monitoring & Management

### View App Service Logs
```bash
az webapp log tail \
  --resource-group contoso-traders-rg \
  --name contoso-traders-api
```

### Check Static Web App Deployment Status
```bash
az staticwebapp environment list \
  --name contoso-traders-web \
  --resource-group contoso-traders-rg
```

### Scale App Service (if needed)
```bash
# Upgrade from Free to B1 tier
az appservice plan update \
  --resource-group contoso-traders-rg \
  --name contoso-traders-plan \
  --sku B1
```

---

## Troubleshooting

### "App Service deployment failed"
1. Check App Service is created: `az webapp list -o table`
2. Verify app name in GitHub secrets matches exactly
3. Check workflow logs for detailed error
4. Manual deploy test:
   ```bash
   az webapp deployment source config-zip \
     --resource-group contoso-traders-rg \
     --name contoso-traders-api \
     --src-path path/to/publish.zip
   ```

### "Static Web App deployment token invalid"
1. Get new token:
   ```bash
   az staticwebapp secrets list --name contoso-traders-web \
     --resource-group contoso-traders-rg
   ```
2. Update GitHub secret `AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN`

### "OIDC authentication failed"
1. Verify federated credential is set up correctly (see `AZURE_OIDC_SETUP.md`)
2. Check app has Contributor role: `az role assignment list --assignee <CLIENT_ID>`
3. Test OIDC locally:
   ```bash
   az login --service-principal -u <CLIENT_ID> -t <TENANT_ID> --allow-no-subscriptions
   ```

---

## Cost Estimates (as of Feb 2026)

| Resource | Tier | Monthly Cost | Notes |
|--|--|--|--|
| App Service | Free | $0 | Limited, great for testing |
| App Service | B1 | ~$10-15 | Recommended for production |
| Static Web App | Free | $0 | Excellent for frontend |
| Application Insights | Free | $0 | First 1GB/month free |

---

## Next Steps

1. ✅ Create App Service (backend)
2. ✅ Create Static Web App (frontend)
3. ✅ Get deployment token
4. ✅ Add GitHub secrets
5. ✅ Complete OIDC setup (see `AZURE_OIDC_SETUP.md`)
6. ✅ Push to `main` branch
7. ✅ Watch GitHub Actions deploy!

---

## References

- [App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)
- [GitHub Actions Azure Integration](https://github.com/Azure/actions)

---
