import type { SqliteDatabase } from '../db.js';
import type { ModuleState } from '../status.js';

export type StepSnapshotRecord = {
  stepKey: string;
  moduleState: ModuleState;
  lastUpdatedAt: string | null;
  payloadJson: string | null;
};

type StepSnapshotRow = {
  step_key: string;
  module_state: ModuleState;
  last_updated_at: string | null;
  payload_json: string | null;
};

export class StepSnapshotRepository {
  constructor(private readonly db: SqliteDatabase) {}

  save(snapshot: StepSnapshotRecord): void {
    this.db
      .prepare(
        `INSERT INTO step_snapshots (step_key, module_state, last_updated_at, payload_json)
         VALUES (@step_key, @module_state, @last_updated_at, @payload_json)
         ON CONFLICT(step_key) DO UPDATE SET
           module_state = excluded.module_state,
           last_updated_at = excluded.last_updated_at,
           payload_json = excluded.payload_json`,
      )
      .run({
        step_key: snapshot.stepKey,
        module_state: snapshot.moduleState,
        last_updated_at: snapshot.lastUpdatedAt,
        payload_json: snapshot.payloadJson,
      });
  }

  listLatest(): StepSnapshotRecord[] {
    const rows = this.db
      .prepare('SELECT step_key, module_state, last_updated_at, payload_json FROM step_snapshots ORDER BY step_key ASC')
      .all() as StepSnapshotRow[];

    return rows.map((row) => ({
      stepKey: row.step_key,
      moduleState: row.module_state,
      lastUpdatedAt: row.last_updated_at,
      payloadJson: row.payload_json,
    }));
  }
}
