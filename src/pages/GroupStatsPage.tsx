import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heatmap } from "../components/Heatmap";
import {
  getGroupSolveHistory,
  getGroupDailyStatus,
  getGroupDayStats,
  getStoredGroupMembership,
  type GroupStatusMode,
  type GroupDailyStatus,
  type GroupDaySolve,
} from "../helpers/group";
import * as Styles from "../styles/group-stats-styles";


function getUtcDate(): string {
  return new Date().toISOString().split("T")[0];
}

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function historyDateRange(solvedDates: string[]): {
  startDate?: Date;
  endDate?: Date;
} {
  if (solvedDates.length === 0) return {};
  const startDate = new Date(solvedDates[0].replace(/-/g, "/"));
  const today = new Date();
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return { startDate, endDate };
}


export function GroupStatsPage() {
  const navigate = useNavigate();
  const params = useParams<{ groupName: string }>();
  const rawGroupIdentifier = params.groupName ?? "";
  const groupIdentifier = decodeURIComponent(rawGroupIdentifier);
  const membership = React.useMemo(() => getStoredGroupMembership(), []);
  const groupId = React.useMemo(() => {
    if (!membership) return groupIdentifier;
    if (
      membership.groupId === groupIdentifier ||
      membership.groupName === groupIdentifier
    ) {
      return membership.groupId;
    }
    return groupIdentifier;
  }, [groupIdentifier, membership]);
  const displayGroupName = membership?.groupName ?? groupIdentifier;

  const [mode, setMode] = React.useState<GroupStatusMode>("daily");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [solvedDates, setSolvedDates] = React.useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(getUtcDate());
  const [groupStatus, setGroupStatus] = React.useState<GroupDailyStatus | null>(null);
  const [daySolves, setDaySolves] = React.useState<GroupDaySolve[]>([]);

  const loadHistory = React.useCallback(
    async (targetMode: GroupStatusMode) => {
      if (!groupId.trim()) {
        setError("No group id provided in the URL.");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const history = await getGroupSolveHistory(groupId, targetMode);
        setSolvedDates(history.solvedDates);
      } catch (err) {
        setSolvedDates([]);
        setError(
          err instanceof Error ? err.message : "Unable to load solve history."
        );
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    },
    [groupId]
  );

  const loadGroupStatus = React.useCallback(
    async (targetMode: GroupStatusMode, targetDate: string) => {
      if (!groupId.trim()) {
        setGroupStatus(null);
        return;
      }

      try {
        const status = await getGroupDailyStatus(groupId, targetDate, targetMode);
        setGroupStatus(status);
      } catch {
        setGroupStatus(null);
      }
    },
    [groupId]
  );

  const loadDayStats = React.useCallback(
    async (targetMode: GroupStatusMode, targetDate: string) => {
      if (!groupId.trim()) {
        setDaySolves([]);
        return;
      }

      try {
        const stats = await getGroupDayStats(groupId, targetDate, targetMode);
        setDaySolves(stats.solves);
      } catch {
        setDaySolves([]);
      }
    },
    [groupId]
  );

  React.useEffect(() => {
    loadHistory(mode);
  }, [mode, loadHistory]);

  React.useEffect(() => {
    loadGroupStatus(mode, selectedDate);
    loadDayStats(mode, selectedDate);
  }, [mode, selectedDate, loadGroupStatus, loadDayStats]);

  const heatmapValue = React.useMemo(
    () =>
      solvedDates.map((date) => ({
        date: date.replace(/-/g, "/"),
        count: 1,
      })),
    [solvedDates]
  );

  const { startDate, endDate } = historyDateRange(solvedDates);

  return (
    <Styles.Container>
      <Styles.BackLink onClick={() => navigate("/")}>← Back</Styles.BackLink>

      <Styles.Header>
        <Styles.Title>{displayGroupName || "Unknown Group"}</Styles.Title>
        <Styles.Subtitle>Group Statistics</Styles.Subtitle>
      </Styles.Header>

      <Styles.Controls>
        <Styles.ControlField>
          <Styles.ControlLabel>Mode</Styles.ControlLabel>
          <Styles.ModeSelect
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as GroupStatusMode)
            }
          >
            <option value="daily">Daily</option>
            <option value="dailyMV">Daily MV</option>
          </Styles.ModeSelect>
        </Styles.ControlField>

        <Styles.LoadButton
          onClick={() => {
            loadHistory(mode);
            loadGroupStatus(mode, selectedDate);
            loadDayStats(mode, selectedDate);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Reload"}
        </Styles.LoadButton>
      </Styles.Controls>

      {error && <Styles.Error>{error}</Styles.Error>}

      {!error && hasLoaded && solvedDates.length === 0 && (
        <Styles.Status>No solves recorded for this group.</Styles.Status>
      )}
      <Styles.StreakCard>
        <Styles.StreakLabel>Current Streak</Styles.StreakLabel>
        <Styles.StreakValue>{groupStatus?.currentStreak ?? 0} {(groupStatus?.currentStreak ?? 0) === 1 ? "day" : "days"}</Styles.StreakValue>
      </Styles.StreakCard>
      {!error && hasLoaded && (
        <Styles.HeatmapCard>

          <Heatmap
            value={heatmapValue}
            startDate={startDate}
            endDate={endDate}
            selectedDate={new Date(selectedDate.replace(/-/g, "/"))}
            onDateClick={(date) => setSelectedDate(toDayKey(date))}
          />

          <Styles.DayTableWrap>
            <Styles.DayTableTitle>Daily stats for {new Date(selectedDate.replace(/-/g, "/")).toLocaleDateString()}</Styles.DayTableTitle>
            {daySolves.length === 0 ? (
              <Styles.Status>No attempts recorded for this date.</Styles.Status>
            ) : (
              <Styles.DayTable>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Attempts</th>
                    <th>Solved</th>
                    <th>Missed</th>
                  </tr>
                </thead>
                <tbody>
                  {daySolves.map((entry) => {
                    const missed = entry.attempts >= 6 && !entry.solved;
                    return (
                      <tr key={entry.username}>
                        <td>{entry.username}</td>
                        <td>{entry.attempts}</td>
                        <td>{entry.solved ? "Yes" : "No"}</td>
                        <td>{missed ? "Yes" : "No"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Styles.DayTable>
            )}
          </Styles.DayTableWrap>
        </Styles.HeatmapCard>
      )}
    </Styles.Container>
  );
}
