import crypto from "node:crypto";
import { getUtcDate } from "../shared";
import { db } from "./index";

type GroupMode = "daily" | "mv";

function previousUtcDate(date: string): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function getSolveTableName(mode: GroupMode): "daily_solves" | "mv_solves" {
  return mode === "mv" ? "mv_solves" : "daily_solves";
}

function getStreakColumns(mode: GroupMode): {
  currentStreak: "current_streak" | "mv_current_streak";
  lastCompleted: "last_completed" | "mv_last_completed";
} {
  if (mode === "mv") {
    return {
      currentStreak: "mv_current_streak",
      lastCompleted: "mv_last_completed",
    };
  }

  return {
    currentStreak: "current_streak",
    lastCompleted: "last_completed",
  };
}

function isGroupSolvedOnDate(groupId: string, date: string, mode: GroupMode): boolean {
  const tableName = getSolveTableName(mode);
  const solvedCount = db
    .prepare(
      `
      SELECT COUNT(DISTINCT username) as count
      FROM ${tableName}
      WHERE group_id = ? AND date = ?
        AND solved = 1
    `
    )
    .get(groupId, date) as { count: number };

  return !!solvedCount && solvedCount.count >= 1;
}

function getStoredGroupStreak(
  groupId: string,
  mode: GroupMode
): {
  currentStreak: number;
  lastCompleted: string | null;
} {
  const columns = getStreakColumns(mode);
  const row = db
    .prepare(
      `
      SELECT ${columns.currentStreak} as current_streak, ${columns.lastCompleted} as last_completed
      FROM groups
      WHERE id = ?
    `
    )
    .get(groupId) as
    | { current_streak: number; last_completed: string | null }
    | undefined;

  if (!row) {
    return { currentStreak: 0, lastCompleted: null };
  }

  return {
    currentStreak: row.current_streak,
    lastCompleted: row.last_completed,
  };
}

function getActiveGroupStreak(
  groupId: string,
  mode: GroupMode,
  today = getUtcDate()
): {
  currentStreak: number;
  lastCompleted: string | null;
} {
  const stored = getStoredGroupStreak(groupId, mode);
  const columns = getStreakColumns(mode);

  if (!stored.lastCompleted) {
    if (stored.currentStreak !== 0) {
      db.prepare(
        `
        UPDATE groups
        SET ${columns.currentStreak} = 0
        WHERE id = ?
      `
      ).run(groupId);
    }

    return { currentStreak: 0, lastCompleted: null };
  }

  const yesterday = previousUtcDate(today);
  if (stored.lastCompleted === today || stored.lastCompleted === yesterday) {
    return stored;
  }

  if (stored.currentStreak !== 0) {
    db.prepare(
      `
      UPDATE groups
      SET ${columns.currentStreak} = 0
      WHERE id = ?
    `
    ).run(groupId);
  }

  return {
    currentStreak: 0,
    lastCompleted: stored.lastCompleted,
  };
}

function updateGroupStreakForToday(
  groupId: string,
  mode: GroupMode,
  today = getUtcDate()
): {
  currentStreak: number;
  lastCompleted: string | null;
} {
  const stored = getActiveGroupStreak(groupId, mode, today);
  const columns = getStreakColumns(mode);

  if (!isGroupSolvedOnDate(groupId, today, mode)) {
    return stored;
  }

  if (stored.lastCompleted === today) {
    return stored;
  }

  const yesterday = previousUtcDate(today);
  const nextStreak = stored.lastCompleted === yesterday ? stored.currentStreak + 1 : 1;

  db.prepare(
    `
    UPDATE groups
    SET ${columns.currentStreak} = ?, ${columns.lastCompleted} = ?
    WHERE id = ?
  `
  ).run(nextStreak, today, groupId);

  return {
    currentStreak: nextStreak,
    lastCompleted: today,
  };
}

export function createGroup(name: string) {
  const normalizedName = name.trim().slice(0, 64);
  if (!normalizedName) {
    throw new Error("Group name is required");
  }

  const existingGroup = db
    .prepare(
      `
      SELECT id FROM groups WHERE name = ?
    `
    )
    .get(normalizedName) as { id: string } | undefined;

  if (existingGroup) {
    throw new Error("Group already exists");
  }

  const id = crypto.randomUUID();
  const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase();

  db.prepare(
    `
    INSERT INTO groups (id, name, join_code, created_at)
    VALUES (?, ?, ?, ?)
  `
  ).run(id, normalizedName, joinCode, Date.now());

  return {
    id,
    name: normalizedName,
    joinCode,
  };
}

export function getGroupByName(
  name: string
): { id: string; name: string; joinCode: string } | null {
  const normalizedName = name.trim();
  if (!normalizedName) return null;

  const group = db
    .prepare(
      `
      SELECT id, name, join_code
      FROM groups
      WHERE name = ?
    `
    )
    .get(normalizedName) as
    | { id: string; name: string; join_code: string }
    | undefined;

  if (!group) return null;

  return {
    id: group.id,
    name: group.name,
    joinCode: group.join_code,
  };
}

export function getGroupByJoinCode(
  joinCode: string
): { id: string; name: string; joinCode: string } | null {
  const normalizedCode = joinCode.trim().toUpperCase();

  const group = db
    .prepare(
      `
      SELECT id, name, join_code
      FROM groups
      WHERE join_code = ?
    `
    )
    .get(normalizedCode) as
    | { id: string; name: string; join_code: string }
    | undefined;

  if (!group) return null;

  return {
    id: group.id,
    name: group.name,
    joinCode: group.join_code,
  };
}

export function recordGroupJoin(groupId: string, username: string) {
  const normalizedUsername = username.trim().slice(0, 32);
  if (!normalizedUsername) {
    throw new Error("Username is required");
  }

  // Check if the user is already a member of the group
  const existingJoin = db
    .prepare(
      `
      SELECT group_id
      FROM group_members
      WHERE group_id = ? AND username = ?
    `
    )
    .get(groupId, normalizedUsername) as { group_id: string } | undefined;
  if (existingJoin) return;

  // add the user to the group
  db.prepare(
    `
    INSERT INTO group_members (group_id, username, joined_at)
    VALUES (?, ?, ?)
  `
  ).run(groupId, normalizedUsername, Date.now());
}

function recordSolve(
  tableName: "daily_solves" | "mv_solves",
  groupId: string,
  username: string,
  date: string,
  attempt: number,
  guessed: boolean
) {
  const today = getUtcDate();
  if (date !== today) {
    throw new Error(`Only today's solves can be recorded. Expected ${today}, got ${date}.`);
  }

  const normalizedUsername = username.trim().slice(0, 32);
  const membership = db
    .prepare(
      `
      SELECT group_id
      FROM group_members
      WHERE group_id = ? AND username = ?
    `
    )
    .get(groupId, normalizedUsername) as { group_id: string } | undefined;

  if (!membership) return;

  const boundedAttempt = Math.max(1, Math.min(6, Math.floor(attempt)));
  db.prepare(
    `
    INSERT INTO ${tableName} (group_id, username, date, solved, attempts)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(group_id, username, date)
    DO UPDATE SET solved = excluded.solved, attempts = excluded.attempts
  `
  ).run(groupId, normalizedUsername, date, guessed ? 1 : 0, boundedAttempt);

  const mode: GroupMode = tableName === "mv_solves" ? "mv" : "daily";
  updateGroupStreakForToday(groupId, mode, today);
}

export function recordDailySolve(
  groupId: string,
  username: string,
  date: string,
  attempt: number,
  guessed: boolean
) {
  recordSolve("daily_solves", groupId, username, date, attempt, guessed);
}

export function recordMvSolve(
  groupId: string,
  username: string,
  date: string,
  attempt: number,
  guessed: boolean
) {
  recordSolve("mv_solves", groupId, username, date, attempt, guessed);
}

export function getGroupDailyStatus(
  groupId: string,
  date: string,
  mode: GroupMode = "daily"
): {
  groupId: string;
  groupName: string;
  currentStreak: number;
  finishedUsers: string[];
} | null {
  const group = db
    .prepare(
      `
      SELECT id, name
      FROM groups
      WHERE id = ?
    `
    )
    .get(groupId) as { id: string; name: string } | undefined;
  if (!group) return null;

  const streak = getActiveGroupStreak(groupId, mode, date);
  const solveTable = getSolveTableName(mode);
  const finishedRows = db
    .prepare(
      `
      SELECT username
      FROM ${solveTable}
      WHERE group_id = ? AND date = ?
        AND (solved = 1 OR attempts >= 6)
      ORDER BY username ASC
    `
    ).all(groupId, date) as Array<{ username: string }>;

  return {
    groupId: group.id,
    groupName: group.name,
    currentStreak: streak.currentStreak,
    finishedUsers: finishedRows.map((row) => row.username),
  };
}

export function getGroupSolveHistory(
  groupId: string,
  dateString: string,
  mode: GroupMode = "daily"
): string[] {
  const tableName = getSolveTableName(mode);
  const rows = db
    .prepare(
      `
        SELECT DISTINCT date
        FROM ${tableName}
        WHERE group_id = ? AND solved = 1 AND strftime('%Y-%m', date) = ?
        ORDER BY date ASC
      `
    )
    .all(groupId, dateString) as Array<{ date: string }>;
  return rows.map((row) => row.date);
}
