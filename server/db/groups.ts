import { db } from "./index";
import crypto from "node:crypto";

export function createGroup(name: string) {
    const id = crypto.randomUUID();
    const joinCode = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    db.prepare(`
        INSERT INTO groups
        (id, name, join_code, created_at)
        VALUES (?, ?, ?, ?)
    `).run(
        id,
        name,
        joinCode,
        Date.now()
    );

    return {
        id,
        name,
        joinCode
    };
}
