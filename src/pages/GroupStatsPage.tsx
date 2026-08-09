import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heatmap } from "../components/Heatmap";
import {
  getGroupSolveHistoryByName,
  type GroupStatusMode,
} from "../helpers/group";
import * as Styles from "../styles/group-stats-styles";

function currentUtcMonth(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStartDate(month: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return undefined;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return undefined;
  return new Date(Date.UTC(year, monthIndex, 1));
}

function monthEndDate(month: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return undefined;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return undefined;
  // Last day of the month = day 0 of the next month.
  return new Date(Date.UTC(year, monthIndex + 1, 0));
}

// Range that includes the selected month with padding (3 months on each side)
function monthRangeWithPadding(month: string): {
  startDate?: Date;
  endDate?: Date;
} {
  const start = monthStartDate(month);
  const end = monthEndDate(month);
  if (!start || !end) return {};
  const startDate = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 3, 1)
  );
  const endDate = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 4, 0)
  );
  return { startDate, endDate };
}

function formatMonthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function GroupStatsPage() {
  const navigate = useNavigate();
  const params = useParams<{ groupName: string }>();
  const rawGroupName = params.groupName ?? "";
  const groupName = decodeURIComponent(rawGroupName);

  const [month, setMonth] = React.useState(currentUtcMonth());
  const [mode, setMode] = React.useState<GroupStatusMode>("daily");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [solvedDates, setSolvedDates] = React.useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const loadHistory = React.useCallback(
    async (targetMonth: string, targetMode: GroupStatusMode) => {
      if (!groupName.trim()) {
        setError("No group name provided in the URL.");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const history = await getGroupSolveHistoryByName(
          groupName,
          targetMonth,
          targetMode
        );
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
    [groupName]
  );

  // Initial load.
  React.useEffect(() => {
    loadHistory(month, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload whenever month or mode changes.
  React.useEffect(() => {
    if (!hasLoaded) return;
    loadHistory(month, mode);
  }, [month, mode, hasLoaded, loadHistory]);

  const heatmapValue = React.useMemo(
    () =>
      solvedDates.map((date) => ({
        date: date.replace(/-/g, "/"),
        count: 1,
      })),
    [solvedDates]
  );

  const { startDate, endDate } = monthRangeWithPadding(month);

  return (
    <Styles.Container>
      <Styles.BackLink onClick={() => navigate("/")}>← Back</Styles.BackLink>

      <Styles.Header>
        <Styles.Title>{groupName || "Unknown Group"}</Styles.Title>
        <Styles.Subtitle>Group Statistics</Styles.Subtitle>
      </Styles.Header>

      <Styles.Controls>
        <Styles.ControlField>
          <Styles.ControlLabel>Month</Styles.ControlLabel>
          <Styles.MonthInput
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </Styles.ControlField>

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
          onClick={() => loadHistory(month, mode)}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Reload"}
        </Styles.LoadButton>
      </Styles.Controls>

      {error && <Styles.Error>{error}</Styles.Error>}

      {!error && hasLoaded && solvedDates.length === 0 && (
        <Styles.Status>No solves recorded for {formatMonthLabel(month)}.</Styles.Status>
      )}

      {heatmapValue.length > 0 && startDate && endDate && (
        <Styles.HeatmapCard>
          <Heatmap value={heatmapValue} startDate={startDate} endDate={endDate} />
        </Styles.HeatmapCard>
      )}
    </Styles.Container>
  );
}
