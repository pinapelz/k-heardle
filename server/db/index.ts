import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "k-heardle.db");

export const db = new Database(dbPath);

db.pragma("foreign_keys = ON");
