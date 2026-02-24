# Azure OIDC Deployment Setup Guide

This guide explains how to set up OIDC-based GitHub Actions deployments to Azure (no stored credentials needed).

## Why OIDC?

✅ **Advantages:**
- No long-lived credentials stored in GitHub
- Automatic credential rotation
- Secure, industry-standard approach
- Fine-grained access control via Azure RBAC
- Audit trail in Azure

## Prerequisites

1. **Azure Subscription** with Owner or Contributor role
2. **GitHub Repository** with Settings access
3. **Azure CLI** installed locally (optional, for automation)

---

## Step 1: Create Microsoft Entra ID Application (formerly Azure Active Directory)

### Option A: Using Azure Portal (GUI)

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **Microsoft Entra ID** and open it
3. Click **App registrations** → **New registration**
4. Fill in:
   - **Name:** `contoso-traders-github-actions` (or your preference)
   - **Supported account types:** Accounts in this organizational directory only
   - **Redirect URI:** Leave blank
5. Click **Register**
6. **Copy and save these values:**
   - **Application (client) ID** → Will use as `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → Will use as `AZURE_TENANT_ID`

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create app
az ad app create --display-name "contoso-traders-github-actions"

# Get the app ID (this is your CLIENT_ID)
az ad app list --filter "displayName eq 'contoso-traders-github-actions'" --query "[0].appId" -o tsv

# Get your tenant ID (from Entra ID)
az account show --query "tenantId" -o tsv
```

---

## Step 2: Get Your Subscription ID

```bash
# List your subscriptions
az account list --output table

# Or get the current subscription
az account show --query "id" -o tsv
```

This value → **AZURE_SUBSCRIPTION_ID**

---

## Step 3: Grant Permissions to the App

The app needs **Contributor** role on your subscription.

### Option A: Using Azure Portal

1. Go to **Subscriptions**
2. Select your subscription
3. Click **Access control (IAM)**
4. Click **+ Add** → **Add role assignment**
5. **Role:** Select **Contributor**
6. **Members:** Search for your app name (e.g., "contoso-traders-github-actions")
7. **Assign**

### Option B: Using Azure CLI

```bash
# Replace with your actual values
CLIENT_ID="your-client-id"
SUBSCRIPTION_ID="your-subscription-id"

az role assignment create \
  --role Contributor \
  --assignee-object-id $(az ad app show --id $CLIENT_ID --query id -o tsv) \
  --scope /subscriptions/$SUBSCRIPTION_ID
```

---

## Step 4: Configure GitHub Trust (Federated Credentials)

This allows GitHub Actions to authenticate without storing credentials.

### Option A: Using Azure Portal

1. Go to Microsoft Entra ID → **App registrations**
2. Select your app (e.g., "contoso-traders-github-actions")
3. Click **Certificates & secrets**
4. Click **Federated credentials** tab
5. Click **+ Add credential**
6. Fill in:
   - **Federated credential scenario:** Select **GitHub Actions deploying Azure resources**
   - **Organization:** Your GitHub username/org (e.g., `gobinathm`)
   - **Repository:** `contoso-traders-devsecops-github-hackathon`
   - **Entity type:** **Branch**
   - **GitHub branch name:** `main`
7. Click **Add**

### Option B: Using Azure CLI

```bash
# Replace with your values
TENANT_ID="your-tenant-id"  # From Entra ID
CLIENT_ID="your-client-id"
OWNER="gobinathm"
REPO="contoso-traders-devsecops-github-hackathon"

az ad app federated-credential create \
  --id $CLIENT_ID \
  --parameters '{
    "name": "github-deploy-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'"$OWNER"'/'"$REPO"':ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

---

## Step 5: Add Secrets to GitHub

### Actions Secrets Setup

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

| Secret Name | Value |
|--|--|
| `AZURE_CLIENT_ID` | Your app's Application (client) ID from Entra ID |
| `AZURE_TENANT_ID` | Your Entra ID Directory (tenant) ID |
| `AZURE_SUBSCRIPTION_ID` | Your Azure Subscription ID |

**Quick Reference Screenshot Path:**
```
GitHub Repo → Settings → Secrets and variables → Actions → New repository secret
```

---

## Step 6: Add Azure App Service Details (If Deploying to App Service)

If deploying to **Azure App Service**, also add:

| Secret Name | Value | Example |
|--|--|--|
| `AZURE_APPSERVICE_NAME` | Your App Service name | `contoso-traders-api` |
| `AZURE_APPSERVICE_PACKAGE_PATH` | Backend publish output path | `backend/bin/Release/net9.0/publish` |
| `AZURE_FRONTEND_CONTAINER_REGISTRY_NAME` | Container registry name (if using ACR) | `contosotradersacr` |
| `AZURE_FRONTEND_CONTAINER_REGISTRY_USERNAME` | ACR username | (if using ACR) |
| `AZURE_FRONTEND_CONTAINER_REGISTRY_PASSWORD` | ACR password | (if using ACR) |

---

## Step 7: Deploy Backend to Azure App Service

Update `.github/workflows/ci-cd.yml`:

```yaml
  deploy-backend:
    needs: build-backend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      
      - name: Build and publish backend
        run: |
          cd backend
          dotnet publish -c Release -o publish
      
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_APPSERVICE_NAME }}
          package: backend/publish
          clean: true
```

---

## Step 8: Deploy Frontend to Azure Static Web App (Recommended)

For frontend, Azure Static Web Apps is simpler:

```yaml
  deploy-frontend:
    needs: build-frontend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Azure Static Web Apps
        uses: azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "frontend/build"
          output_location: ""
          skip_app_build: true
```

---

## Step 9: (Optional) Add Azure Container Registry Deployment

If deploying containers to ACR:

```yaml
  deploy-container:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: Build and push Docker image
        run: |
          az acr build \
            --registry ${{ secrets.AZURE_REGISTRY_NAME }} \
            --image contoso-traders-api:latest \
            --file ./backend/Dockerfile \
            ./backend
```

---

## Verification

### Check GitHub Trust is Working

```bash
# Get your federated credential
az ad app federated-credential list --id $CLIENT_ID
```

You should see your GitHub configuration.

### Test Deployment

1. Commit and push a change to `main`
2. Go to **Actions** tab in GitHub
3. Watch the workflow run
4. Check logs for Azure Login success

---

## Troubleshooting

### Error: "Invalid audience 'api://AzureADTokenExchange'"

**Fix:** Ensure federated credential has correct audience: `api://AzureADTokenExchange`

### Error: "Insufficient privileges to complete the operation"

**Solution:** 
- Verify app has **Contributor** role assignment
- Check role scope is at subscription level, not resource group
- Wait 2-3 minutes for role assignment to propagate

### Error: "Repository not found or access denied"

**Fix:** 
- Verify GitHub org name in federated credential (use lowercase)
- Ensure repo name is exact match
- Re-create federated credential with correct values

### Workflow runs but doesn't deploy

**Check:**
1. Verify `if: github.ref == 'refs/heads/main'` condition
2. Check `needs:` references correct previous job
3. Verify secrets are set correctly (no typos)
4. Check App Service/Static Web App name and region

---

## Security Best Practices

✅ **DO:**
- Limit app permissions to **Contributor** (not Owner)
- Use federated credentials (not shared keys)
- Set role assignments at **Resource Group** level if possible
- Review and rotate credentials regularly
- Monitor Azure Activity Log for unexpected deployments

❌ **DON'T:**
- Store connection strings in workflow files
- Use shared service principal accounts
- Give app **Owner** role (unnecessary)
- Commit `.env` files with secrets
- Use same credentials for multiple apps

---

## Complete Workflow Example

See the full updated workflow in `.github/workflows/ci-cd.yml` which includes:
- ✅ Azure Login with OIDC
- ✅ Build jobs (frontend + backend)
- ✅ Test jobs
- ✅ CodeQL analysis
- ✅ Deployment jobs (conditional on main branch)

---

## References

- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Azure Login Action](https://github.com/Azure/login)
- [Azure Web Apps Deploy](https://github.com/Azure/webapps-deploy)
- [Azure Static Web Apps Deploy](https://github.com/Azure/static-web-apps-deploy)
- [Federated Credentials for GitHub](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-CLI%2Clinux)

---

## Quick Setup Script

```bash
#!/bin/bash

# Configure these
GITHUB_ORG="gobinathm"
GITHUB_REPO="contoso-traders-devsecops-github-hackathon"
APP_NAME="contoso-traders-github-actions"

# Login to Azure
az login

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Subscription ID: $SUBSCRIPTION_ID"

# Create app
APP=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
CLIENT_ID=$APP
echo "Client ID: $CLIENT_ID"

# Get tenant ID
TENANT_ID=$(az account show --query tenantId -o tsv)
echo "Tenant ID: $TENANT_ID"

# Grant Contributor role
OBJECT_ID=$(az ad app show --id $CLIENT_ID --query id -o tsv)
az role assignment create --role Contributor --assignee-object-id $OBJECT_ID --scope /subscriptions/$SUBSCRIPTION_ID

# Create federated credential
az ad app federated-credential create \
  --id $CLIENT_ID \
  --parameters '{
    "name": "github-main-branch",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'"${GITHUB_ORG}"'/'"${GITHUB_REPO}"':ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

echo ""
echo "✅ Setup complete! Add these secrets to GitHub:"
echo "AZURE_CLIENT_ID=$CLIENT_ID"
echo "AZURE_TENANT_ID=$TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
```

Save as `setup-oidc.sh` and run:
```bash
chmod +x setup-oidc.sh
./setup-oidc.sh
```

---
