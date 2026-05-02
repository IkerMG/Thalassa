// React 18 ships useSyncExternalStore natively.
// use-sync-external-store v1.6+ dropped its own shim files.
// This re-export satisfies react-i18next v17's import of 'use-sync-external-store/shim'.
export { useSyncExternalStore } from 'react';
