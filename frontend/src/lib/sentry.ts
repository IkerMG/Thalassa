import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  // No inicializar si no hay DSN configurado (dev sin Sentry, o variable no definida)
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      // Session Replay: solo graba la sesión completa cuando hay un error
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Muestrear el 10% de las transacciones para performance monitoring
    tracesSampleRate: 0.1,
    // Replay: 0% sesiones normales, 100% sesiones con error
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
  });
}
