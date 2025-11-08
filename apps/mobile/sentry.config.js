/**
 * Sentry Configuration - Mobile App
 *
 * Configuração para Sentry no Expo
 */

module.exports = {
  dsn: process.env.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: process.env.NODE_ENV === 'development',
  // Release tracking
  release: process.env.EAS_BUILD_ID || 'local',
  environment: process.env.NODE_ENV || 'development',
  // Source maps
  enableNativeCrashHandling: true,
  enableAutoSessionTracking: true,
  // Performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // --- Sentry Enhanced Error Reporting ---
  // The 'beforeSend' hook allows you to modify or drop an event before it's sent to Sentry.
  // This is useful for scrubbing sensitive data, filtering out uninteresting errors,
  // or adding static context.
  beforeSend(event, hint) {
    // IMPORTANT: Dynamic context (like current user, device details, etc.) should be added
    // from *within your application code* using Sentry SDK's runtime APIs, as this static
    // configuration file cannot access runtime application state.
    // Example: import * as Sentry from '@sentry/react-native'; Sentry.setUser({ id: 'user-id' });

    // Example 1: Filter out non-critical network errors.
    // This prevents Sentry from being flooded with transient issues that may not be bugs.
    // We inspect the original exception from the 'hint' object for more reliability.
    const exception = hint.originalException;
    if (exception && typeof exception.message === 'string' && exception.message.includes('Network request failed')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry: Dropping a "Network request failed" event.');
      }
      return null; // Drop the event
    }

    // Example 2: Scrub sensitive data from the event payload.
    // NOTE: For PII, it's strongly recommended to use Sentry's server-side data scrubbing
    // features in your project settings. This client-side scrubbing is a good second layer of defense.
    if (event.request && event.request.data) {
      // This is a simplified example. A more robust solution might involve a recursive
      // function to scrub nested objects or using an allow/deny list of keys.
      if (typeof event.request.data === 'string') {
        event.request.data = event.request.data
          .replace(/password=([^&]*)/gi, 'password=[REDACTED]')
          .replace(/auth_token=([^&]*)/gi, 'auth_token=[REDACTED]');
      } else if (typeof event.request.data === 'object' && event.request.data !== null) {
        const sensitiveKeys = ['password', 'authToken', 'auth_token', 'creditCardNumber'];
        for (const key in event.request.data) {
          if (sensitiveKeys.includes(key)) {
            event.request.data[key] = '[REDACTED]';
          }
        }
      }
    }

    // Always return the event (modified or original) if it should be sent.
    return event;
  },
};