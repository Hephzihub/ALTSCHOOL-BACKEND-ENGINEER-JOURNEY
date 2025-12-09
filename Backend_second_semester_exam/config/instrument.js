import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://0f5e4dae6a5700c30e2691fff1bac528@o4510471537164288.ingest.us.sentry.io/4510471540310016",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  tracesSampleRate: 1.0,
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  enableLogs: true,
  sendDefaultPii: true,
});

// export default Sentry;
