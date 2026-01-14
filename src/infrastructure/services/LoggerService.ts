import { ILogger } from "../../application/Interfaces/ILogger";

export class LoggerService implements ILogger {
  info(message: string): void {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`);
  }
  error(message: string, trace?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, trace);
  }
  warn(message: string): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  }
  debug(message: string): void {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
  }
}
