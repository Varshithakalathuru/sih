const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'monitor.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const raw = new DatabaseSync(DB_PATH);
raw.exec('PRAGMA journal_mode = WAL;');
raw.exec('PRAGMA foreign_keys = ON;');

const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
raw.exec(schema);

// Thin adapter so the rest of the codebase can keep using the
// better-sqlite3-style db.prepare(sql).get/all/run(...) API.
const db = {
  prepare(sql) {
    const stmt = raw.prepare(sql);
    return {
      get: (...params) => stmt.get(...params),
      all: (...params) => stmt.all(...params),
      run: (...params) => {
        const info = stmt.run(...params);
        return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
      },
    };
  },
  exec(sql) {
    return raw.exec(sql);
  },
};

module.exports = db;
