import os from 'os';
import fs from 'fs';
import path from 'path';
import Log4js from 'log4js';

const logsPath = path.join(os.homedir(), '.wsjoy/logs');

if (!fs.existsSync(logsPath)) {
  fs.mkdirSync(logsPath, {recursive: true});
}

Log4js.configure({
  appenders: {
    ruleConsole: { type: 'console' },
    ruleFile: {
      type: 'dateFile',
      filename: path.resolve(logsPath, './e'),
      pattern: 'yyyy-MM-dd.log',
      maxLogSize: 10 * 1000 * 1000,
      numBackups: 10,
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['ruleConsole', 'ruleFile'], level: 'info' },
  },
});

const log4js = Log4js.getLogger();

export const logger = {
  debug(message: any, ...args: any[]) {
    log4js.debug(message, ...args);
  },
  info(message: any, ...args: any[]) {
    log4js.info(message, ...args);
  },
  warn(message: any, ...args: any[]) {
    log4js.warn(message, ...args);
  },
  error(message: any, ...args: any[]) {
    log4js.error(message, ...args);
  },
};

export default logger;
