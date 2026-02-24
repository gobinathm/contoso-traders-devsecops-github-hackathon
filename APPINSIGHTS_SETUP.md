# Application Insights Configuration Guide

This guide explains how to configure Azure Application Insights monitoring for the Contoso Traders application (both frontend and backend).

## Prerequisites

1. Azure subscription with Application Insights resource created
2. Your Application Insights **Connection String** (format below)
3. Your Application Insights **Instrumentation Key** (optional for React)

### Getting Your Connection String

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Application Insights resource
3. Click **Overview** in the left menu
4. Copy the **Connection String** (you'll see it on the right side)

**Format:**
```
InstrumentationKey=XXXX-XXXX-XXXX-XXXX;IngestionEndpoint=https://REGION-NUMBER.in.applicationinsights.azure.com/;LiveEndpoint=https://REGION.livediagnostics.monitor.azure.com/;ApplicationId=XXXX-XXXX-XXXX-XXXX
```

---

## Backend (.NET/C#) Configuration

### 1. Set Environment Variable (Recommended for Secrets)

**Windows (PowerShell):**
```powershell
[Environment]::SetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING", "your-connection-string-here", "User")
```

**Windows (Command Prompt):**
```cmd
setx APPLICATIONINSIGHTS_CONNECTION_STRING "your-connection-string-here"
```

**Linux/macOS:**
```bash
export APPLICATIONINSIGHTS_CONNECTION_STRING="your-connection-string-here"
```

**Docker/GitHub Actions:**
Add to `.env` file or set as a secret in your CI/CD pipeline:
```yaml
env:
  APPLICATIONINSIGHTS_CONNECTION_STRING: ${{ secrets.APPLICATIONINSIGHTS_CONNECTION_STRING }}
```

### 2. Alternative: Configure via appsettings.json

Edit `backend/appsettings.json`:
```json
{
  "ApplicationInsights": {
    "ConnectionString": "your-connection-string-here"
  }
}
```

⚠️ **Security Note:** Do NOT commit connection strings to version control. Use environment variables instead.

### 3. Usage in Backend

The Application Insights SDK is already configured in `Program.cs`. It will automatically:
- Track HTTP requests and responses
- Log application events
- Monitor performance metrics
- Track exceptions and errors

**Optional: Track Custom Events**

Inject `TelemetryClient` in your controllers:

```csharp
using Microsoft.ApplicationInsights;

[ApiController]
public class OrderController : ControllerBase
{
    private readonly TelemetryClient _telemetryClient;

    public OrderController(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }

    [HttpPost]
    public IActionResult CreateOrder(Order order)
    {
        _telemetryClient.TrackEvent("OrderCreated", new Dictionary<string, string>
        {
            { "OrderId", order.Id.ToString() },
            { "Amount", order.Total.ToString() }
        });

        return Ok(order);
    }
}
```

---

## Frontend (React) Configuration

### 1. Install Dependencies

```bash
cd frontend
npm install
```

> Note: `@microsoft/applicationinsights-web` and `@microsoft/applicationinsights-react-js` are already in `package.json`

### 2. Create `.env` File

Copy settings from `.env.example`:

```bash
# Frontend root directory
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_APPINSIGHTS_CONNECTIONSTRING=your-connection-string-here
REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key-here
```

⚠️ **Important:**
- `.env` is in `.gitignore` and won't be committed
- Environment variables must start with `REACT_APP_` to be accessible in React
- For **GitHub Actions**, add secrets via Settings → Secrets and variables → Actions

### 3. Usage in Frontend

Application Insights is automatically initialized in `src/index.js`. 

**Track Custom Events:**

```javascript
import { trackEvent, trackPageView, trackException } from './services/applicationInsights';

// Track a custom event
trackEvent('user_signup', {
  source: 'email',
  email_domain: 'example.com'
});

// Track page view
trackPageView('Products Page', '/products');

// Track exception
try {
  riskyOperation();
} catch (error) {
  trackException(error);
}
```

**Available Methods:**

```javascript
// Track events
trackEvent(eventName, properties)

// Page views
trackPageView(name, url)

// Exceptions
trackException(error, severityLevel)

// Custom metrics
trackMetric(name, value, properties)

// User context
setAuthenticatedUser(userId, accountId)
clearAuthenticatedUser()
```

### 4. Development Mode

When `REACT_APP_APPINSIGHTS_CONNECTIONSTRING` is not set:
- App Insights is disabled with a warning
- Application continues to work normally
- Useful for local development

---

## GitHub Actions Configuration

### 1. Add Single Secret

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add this ONE secret:
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** Your connection string from Azure

### 2. Update Workflow

Your `.github/workflows/ci-cd.yml` already supports this. Reference the single secret with different env var names:

```yaml
env:
  # Backend uses connection string directly
  APPLICATIONINSIGHTS_CONNECTION_STRING: ${{ secrets.APPLICATIONINSIGHTS_CONNECTION_STRING }}
  # Frontend also uses the same connection string
  REACT_APP_APPINSIGHTS_CONNECTIONSTRING: ${{ secrets.APPLICATIONINSIGHTS_CONNECTION_STRING }}
```

That's it! ✅ One secret, used by both backend and frontend.

---

## Azure DevOps / Pipeline Configuration

### Set Secrets in Pipeline

```yaml
variables:
  APPLICATIONINSIGHTS_CONNECTION_STRING: $(APPLICATIONINSIGHTS_CONNECTION_STRING)
  REACT_APP_APPINSIGHTS_CONNECTIONSTRING: $(REACT_APP_APPINSIGHTS_CONNECTIONSTRING)
```

Then add these as **Pipeline Secrets** in Azure DevOps:
1. Go to your pipeline
2. Click **Edit** → **Variables**
3. Click **+ Add** and make it secret
4. Add the connection strings

---

## Docker Configuration

### Backend Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 as build
WORKDIR /src
COPY backend/backend.csproj .
RUN dotnet restore backend.csproj
COPY backend/ .
RUN dotnet build backend.csproj -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/build .

# Set environment variable for App Insights
ENV APPLICATIONINSIGHTS_CONNECTION_STRING=${APPLICATIONINSIGHTS_CONNECTION_STRING}

EXPOSE 80
ENTRYPOINT ["dotnet", "backend.dll"]
```

### Docker Compose

```yaml
services:
  backend:
    build: ./backend
    environment:
      APPLICATIONINSIGHTS_CONNECTION_STRING: ${APPLICATIONINSIGHTS_CONNECTION_STRING}
    ports:
      - "5000:80"

  frontend:
    build: ./frontend
    environment:
      REACT_APP_APPINSIGHTS_CONNECTIONSTRING: ${REACT_APP_APPINSIGHTS_CONNECTIONSTRING}
      REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY: ${REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY}
    ports:
      - "3000:3000"
```

Then run with `.env` file:
```bash
docker-compose --env-file .env up
```

---

## Viewing Telemetry in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Open your Application Insights resource
3. Check these sections:
   - **Performance**: Request response times
   - **Availability**: Uptime monitoring
   - **Failures**: Errors and exceptions
   - **Users**: User analytics
   - **Custom metrics**: Your tracked events
   - **Logs**: Query all telemetry data

---

## Troubleshooting

### Data Not Appearing in Portal

1. **Check connection string is correct**
   ```bash
   # Backend: Verify environment variable
   echo $APPLICATIONINSIGHTS_CONNECTION_STRING
   
   # Frontend: Check browser console for warnings
   # Should see: "Application Insights initialized successfully"
   ```

2. **Network Issues**
   - Ensure your firewall allows outbound HTTPS to `*.applicationinsights.azure.com`
   - Check browser network tab for failed requests

3. **Wait for Data**
   - Allow 2-3 minutes for initial data to appear in portal
   - Real-time metrics dashboard may take longer

### Frontend Showing Warnings

If you see: *"Application Insights connection string not configured"*

This is normal in development. Either:
- Create a `.env` file with connection string, OR
- Ignore for local development

---

## Security Best Practices

✅ **DO:**
- Store connection strings in **environment variables**
- Use **GitHub Secrets** for CI/CD
- Rotate connection strings periodically
- Use **User Managed Identities** in production (Azure)
- Enable **diagnostic settings** in App Insights

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode connection strings in code
- Share connection strings via email
- Use same connection string for dev/prod
- Disable HTTPS

---

## Production Deployment

### Azure App Service

Set connection string via App Service Configuration:
1. Azure Portal → App Service → **Configuration**
2. Click **+ New application setting**
3. Name: `APPLICATIONINSIGHTS_CONNECTION_STRING`
4. Value: Your connection string

### AWS Elastic Beanstalk

Add to `.ebextensions/environment.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    APPLICATIONINSIGHTS_CONNECTION_STRING: your-connection-string
```

---

## References

- [Azure Application Insights Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Application Insights for ASP.NET Core](https://learn.microsoft.com/en-us/azure/azure-monitor/app/asp-net-core)
- [JavaScript SDK for Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript)
- [React Plugin for Application Insights](https://github.com/microsoft/ApplicationInsights-JS/blob/main/extensions/applicationinsights-react-js)

---

## Support

For issues or questions:
1. Check Azure Application Insights diagnostic logs
2. Review the [troubleshooting guide](https://learn.microsoft.com/en-us/azure/azure-monitor/app/troubleshoot-missing-data)
3. Enable debug logging in Application Insights SDK
