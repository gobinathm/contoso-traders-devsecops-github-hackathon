import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { AngularPlugin } from '@microsoft/applicationinsights-angularjs-loader';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

let appInsights;

/**
 * Initialize Application Insights for monitoring and diagnostics
 * Connection string should be set via environment variable: REACT_APP_APPINSIGHTS_CONNECTIONSTRING
 */
export const initializeApplicationInsights = () => {
  const connectionString = process.env.REACT_APP_APPINSIGHTS_CONNECTIONSTRING;

  if (!connectionString) {
    console.warn(
      'Application Insights connection string not configured. ' +
        'Set REACT_APP_APPINSIGHTS_CONNECTIONSTRING environment variable to enable monitoring.'
    );
    return null;
  }

  const reactPlugin = new ReactPlugin();

  const config = {
    connectionString,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: {
        history: {},
        trackScrollPerformance: true,
      },
    },
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableCorsCorrelation: true,
    correlationHeaderExcludedDomains: ['*.queue.core.windows.net'],
  };

  appInsights = new ApplicationInsights({
    config,
  });

  appInsights.loadAppInsights();
  appInsights.trackPageView();

  console.log('Application Insights initialized successfully');

  return appInsights;
};

/**
 * Get the initialized Application Insights instance
 */
export const getAppInsights = () => {
  if (!appInsights) {
    console.warn('Application Insights not initialized');
    return null;
  }
  return appInsights;
};

/**
 * Track custom event
 * Usage: trackEvent('user_signup', { source: 'email' })
 */
export const trackEvent = (eventName, properties = {}) => {
  if (!appInsights) return;
  appInsights.trackEvent({ name: eventName }, properties);
};

/**
 * Track page view
 * Usage: trackPageView('About', '/about')
 */
export const trackPageView = (name, url) => {
  if (!appInsights) return;
  appInsights.trackPageView({
    name,
    uri: url,
  });
};

/**
 * Track exception/error
 * Usage: trackException(error)
 */
export const trackException = (error, severityLevel = 2) => {
  if (!appInsights) return;
  appInsights.trackException({
    exception: error,
    severityLevel,
  });
};

/**
 * Track custom metric
 * Usage: trackMetric('button_clicks', 5)
 */
export const trackMetric = (name, value, properties = {}) => {
  if (!appInsights) return;
  appInsights.trackMetric(
    {
      name,
      average: value,
    },
    properties
  );
};

/**
 * Set authenticated user context
 * Usage: setAuthenticatedUser('user123', 'user@example.com')
 */
export const setAuthenticatedUser = (userId, accountId) => {
  if (!appInsights) return;
  appInsights.setAuthenticatedUserContext(userId, accountId);
};

/**
 * Clear authenticated user context (on logout)
 */
export const clearAuthenticatedUser = () => {
  if (!appInsights) return;
  appInsights.clearAuthenticatedUserContext();
};

export default appInsights;
