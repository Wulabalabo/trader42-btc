import { buildServer } from './server/buildServer.js';
import { buildEnv } from './config/env.js';
import { initDb } from './lib/db.js';

const env = buildEnv(process.env);
initDb(env.DB_PATH);

const server = buildServer();

server.listen({ port: env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`trader42-btc listening on ${address}`);
});
