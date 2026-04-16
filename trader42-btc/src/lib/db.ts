import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let db: Database.Database | null = null;

export type SqliteDatabase = Database.Database;

export function getDb(dbPath: string): SqliteDatabase {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(dbPath: string): SqliteDatabase {
  const database = getDb(dbPath);
  const schemaPath = resolve(import.meta.dirname, '../../db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  database.exec(schema);
  return database;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
