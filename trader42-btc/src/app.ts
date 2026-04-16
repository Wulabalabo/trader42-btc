import { buildServer } from './server/buildServer.js';
import { buildEnv } from './config/env.js';
import { initDb } from './lib/db.js';
import { StepSnapshotRepository } from './lib/repositories/stepSnapshotRepository.js';

const env = buildEnv(process.env);
const db = initDb(env.DB_PATH);
const stepSnapshotRepository = new StepSnapshotRepository(db);

const server = await buildServer({ stepSnapshotRepository });

server.listen({ port: env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`trader42-btc listening on ${address}`);
});
