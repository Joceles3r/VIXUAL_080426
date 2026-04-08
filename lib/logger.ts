/**
 * VIXUAL - Logger centralise
 * 
 * En production : JSON structure pour ingestion par un service de logs
 * En dev : format lisible pour la console
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "vixual",
    message,
    ...context,
  };
  
  if (IS_PRODUCTION) {
    // En production : JSON structure pour ingestion par un service de logs
    if (level === "error" || level === "critical") {
      console.error(JSON.stringify(entry));
    } else if (level !== "debug") {
      console.log(JSON.stringify(entry));
    }
  } else {
    // En dev : lisible
    const logFn = level === "critical" ? console.error : console[level];
    logFn(`[VIXUAL ${level.toUpperCase()}]`, message, context || "");
  }
}

// Shortcuts
export const logDebug = (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx);
export const logInfo = (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx);
export const logWarn = (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx);
export const logError = (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx);
export const logCritical = (msg: string, ctx?: Record<string, unknown>) => log("critical", msg, ctx);
