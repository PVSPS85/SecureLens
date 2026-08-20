/**
 * Re-export Shreshta Labs live ingestion daemon for backward compatibility.
 */
export { startShreshtaDaemon as startNrdDaemon, stopShreshtaDaemon as stopNrdDaemon } from './shreshtaIngestion.service.js';
export { default } from './shreshtaIngestion.service.js';
