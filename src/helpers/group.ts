const API_URL = import.meta.env.VITE_HEARDLE_API_URL ?? "http://localhost:3001";

export const GROUP_MEMBERSHIP_STORAGE_KEY = "groupMembership";

export interface GroupMembership {
  groupId: string;
  groupName: string;
  username: string;
  joinToken?: string;
}

export interface GroupDailyStatus {
  groupId: string;
  groupName: string;
  currentStreak: number;
  finishedUsers: string[];
}

export type GroupStatusMode = "daily" | "dailyMV";

export function getStoredGroupMembership(): GroupMembership | null {
  const raw = localStorage.getItem(GROUP_MEMBERSHIP_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<GroupMembership>;
    if (
      typeof parsed.groupId !== "string" ||
      typeof parsed.groupName !== "string" ||
      typeof parsed.username !== "string"
    ) {
      localStorage.removeItem(GROUP_MEMBERSHIP_STORAGE_KEY);
      return null;
    }

    return {
      groupId: parsed.groupId,
      groupName: parsed.groupName,
      username: parsed.username,
      joinToken: typeof parsed.joinToken === "string" ? parsed.joinToken : undefined,
    };
  } catch {
    localStorage.removeItem(GROUP_MEMBERSHIP_STORAGE_KEY);
    return null;
  }
}

export function saveGroupMembership(membership: GroupMembership) {
  localStorage.setItem(GROUP_MEMBERSHIP_STORAGE_KEY, JSON.stringify(membership));
}

export function removeGroupMembership() {
  localStorage.removeItem(GROUP_MEMBERSHIP_STORAGE_KEY);
  window.location.reload();
}

export async function createGroup(
  name: string,
  username: string
): Promise<GroupMembership> {
  const response = await fetch(`${API_URL}/create-group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, username }),
  });

  if (!response.ok) {
    const fallback = `Failed to create group: ${response.statusText}`;
    try {
      const payload = (await response.json()) as { error?: unknown };
      throw new Error(typeof payload.error === "string" ? payload.error : fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  const payload = (await response.json()) as {
    group: {
      id: string;
      name: string;
      joinToken: string;
    };
  };

  return {
    groupId: payload.group.id,
    groupName: payload.group.name,
    username,
    joinToken: payload.group.joinToken,
  };
}

export async function joinGroupByToken(
  joinToken: string,
  username: string
): Promise<GroupMembership> {
  const response = await fetch(`${API_URL}/join-group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ joinToken, username }),
  });

  if (!response.ok) {
    const fallback = `Failed to join group: ${response.statusText}`;
    try {
      const payload = (await response.json()) as { error?: unknown };
      throw new Error(typeof payload.error === "string" ? payload.error : fallback);
    } catch {
      throw new Error(fallback);
    }
  }

  const payload = (await response.json()) as {
    groupId: string;
    groupName: string;
    username: string;
    joinToken: string;
  };

  return {
    groupId: payload.groupId,
    groupName: payload.groupName,
    username: payload.username,
    joinToken: payload.joinToken,
  };
}

export async function getGroupDailyStatus(
  groupId: string,
  date: string,
  mode: GroupStatusMode = "daily"
): Promise<GroupDailyStatus> {
  const response = await fetch(
    `${API_URL}/group-status?groupId=${encodeURIComponent(groupId)}&date=${encodeURIComponent(date)}&mode=${encodeURIComponent(mode)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch group status: ${response.statusText}`);
  }

  return (await response.json()) as GroupDailyStatus;
}

export interface GroupSolveHistory {
  groupId: string;
  month: string;
  mode: "daily" | "mv";
  solvedDates: string[];
}

export async function getGroupSolveHistory(
  groupId: string,
  mode: GroupStatusMode = "daily"
): Promise<GroupSolveHistory> {
  const response = await fetch(
    `${API_URL}/group-statistics?groupId=${encodeURIComponent(groupId)}&mode=${encodeURIComponent(mode)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch solve history: ${response.statusText}`);
  }

  return (await response.json()) as GroupSolveHistory;
}

export async function getGroupSolveHistoryByName(
  name: string,
  mode: GroupStatusMode = "daily"
): Promise<GroupSolveHistory> {
  const response = await fetch(
    `${API_URL}/group-statistics?name=${encodeURIComponent(name)}&mode=${encodeURIComponent(mode)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch solve history: ${response.statusText}`);
  }

  return (await response.json()) as GroupSolveHistory;
}
