import { db } from "./index";

db.exec(`
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    current_streak INTEGER NOT NULL DEFAULT 0,
    last_completed TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL,
    username TEXT NOT NULL,
    joined_at INTEGER NOT NULL,

    PRIMARY KEY (group_id, username),

    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_solves (
    group_id TEXT NOT NULL,
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    solved INTEGER NOT NULL,
    attempts INTEGER NOT NULL,
    PRIMARY KEY (group_id, username, date),
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mv_solves (
    group_id TEXT NOT NULL,
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    solved INTEGER NOT NULL,
    attempts INTEGER NOT NULL,
    PRIMARY KEY (group_id, username, date),
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE
);
`);
