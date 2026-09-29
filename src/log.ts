const PREFIX = "[MORKOV]";

export interface Logger {
  info(message: string, ...details: unknown[]): void;
  warn(message: string, ...details: unknown[]): void;
  error(message: string, ...details: unknown[]): void;
  /** Written only when debug logs are enabled in settings. */
  debug(message: string, ...details: unknown[]): void;
}

export interface LogSink {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export function createLogger(isDebugEnabled: () => boolean, sink: LogSink = console): Logger {
  return {
    info: (message, ...details) => sink.log(PREFIX, message, ...details),
    warn: (message, ...details) => sink.warn(PREFIX, message, ...details),
    error: (message, ...details) => sink.error(PREFIX, message, ...details),
    debug: (message, ...details) => {
      if (isDebugEnabled()) sink.log(PREFIX, "[debug]", message, ...details);
    },
  };
}
