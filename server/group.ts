import { Router } from "express";
import {
  createGroup,
  getGroupDailyStatus,
  getGroupByJoinCode,
  recordGroupJoin,
} from "./db/groups";
import { getUtcDate } from "./shared";

export const groupRouter = Router();

groupRouter.post("/create-group", (req, res) => {
  const body = req.body as {
    name?: unknown;
    username?: unknown;
  };

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    res.status(400).json({ error: "Group name is required." });
    return;
  }

  try {
    const group = createGroup(body.name);

    if (typeof body.username === "string" && body.username.trim()) {
      recordGroupJoin(group.id, body.username);
    }

    res.json({
      group: {
        id: group.id,
        name: group.name,
        joinToken: group.joinCode,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Group already exists, choose a different name" });
  }
});

groupRouter.post("/join-group", (req, res) => {
  const body = req.body as {
    joinToken?: unknown;
    username?: unknown;
  };

  // validate request
  if (typeof body.joinToken !== "string" || body.joinToken.trim().length === 0) {
    res.status(400).json({ error: "joinToken is required." });
    return;
  }
  if (typeof body.username !== "string" || body.username.trim().length === 0) {
    res.status(400).json({ error: "username is required." });
    return;
  }
  const group = getGroupByJoinCode(body.joinToken);
  if (!group) {
    res.status(404).json({ error: "Group not found for that token." });
    return;
  }
  try {
    recordGroupJoin(group.id, body.username);
  } catch {
    res.status(500).json({ error: "Unable to join group." });
    return;
  }

  res.json({
    groupId: group.id,
    groupName: group.name,
    joinToken: group.joinCode,
    username: body.username.trim(),
  });
});

groupRouter.get("/group-status", (req, res) => {
  const groupId = req.query.groupId;
  const date = req.query.date;
  const mode = req.query.mode;

  if (typeof groupId !== "string" || groupId.trim().length === 0) {
    res.status(400).json({ error: "groupId is required." });
    return;
  }

  const targetDate = typeof date === "string" && date.trim() ? date : getUtcDate();
  const normalizedMode = mode === "mv" ? "mv" : "daily";
  const status = getGroupDailyStatus(groupId, targetDate, normalizedMode);

  if (!status) {
    res.status(404).json({ error: "Group not found." });
    return;
  }

  res.json(status);
});
