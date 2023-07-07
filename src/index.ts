import os from 'os';
import express from 'express';
import { parseArgs } from './args';
import { logger } from './logger';
import { handling } from './rpc';
import { jsmon } from './joystick';
import pkg from '../package.json';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ', err.toString());
  if (err.stack) {
    logger.error(err.stack);
  }
});

const args = parseArgs({
  port: {
    type: 'number',
    alias: 'p',
    description: '指定服务器端口，默认为随机端口',
  }
});

/** express */
const expr = express();

/** config express */
expr.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.end('OK');
  } else {
    next();
  }
});

async function main() {
  await jsmon();
  const app = expr.listen(args.port || 8152, () => {
    app.on('upgrade', handling);
  
    const { port } = app.address() as any;
  
    process.stdout.write(`[port=${port}]\n`);
  
    app.setTimeout(120000);
    const interfaces: any = [];
    Object.values(os.networkInterfaces()).forEach((e) => {
      if (!e) {
        return;
      }
      e.filter(detail => detail.family === 'IPv4').forEach((detail) => {
        interfaces.push(detail);
      });
    });
  
    logger.info(`${pkg.name} started, open link to access : ${interfaces.map((e: { address: any; }) => `http://${e.address}:${port}/`).join(', ')}`);
  });
  
}

main();