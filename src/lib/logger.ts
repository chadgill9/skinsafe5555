/**
 * SkinSafe Logger Utility
 *
 * Centralized logging with consistent formatting.
 * In production, this could be extended to send logs to a service.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogMeta {
  [key: string]: unknown;
}

function formatLog(level: LogLevel, tag: string, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] [${tag}] ${message}${metaStr}`;
}

/**
 * Log informational message
 */
export function logInfo(tag: string, message: string, meta?: LogMeta): void {
  console.log(formatLog('INFO', tag, message, meta));
}

/**
 * Log warning message
 */
export function logWarn(tag: string, message: string, meta?: LogMeta): void {
  console.warn(formatLog('WARN', tag, message, meta));
}

/**
 * Log error message
 */
export function logError(tag: string, message: string, meta?: LogMeta): void {
  console.error(formatLog('ERROR', tag, message, meta));
}
