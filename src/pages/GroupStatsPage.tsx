import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heatmap } from "../components/Heatmap";
import {
  getGroupSolveHistoryByName,
  type GroupStatusMode,
} from "../helpers/group";
import * as Styles from "../styles/group-stats-styles";


// Display the complete history without shifting date-only values across time zones.
function historyDateRange(solvedDates: string[]): {
  startDate?: Date;
  endDate?: Date;
} {
  if (solvedDates.length === 0) return {};

  // Use local date constructors because the heatmap library treats date-only
  // values as local dates. Using Date.UTC here can shift the first day back
  // one day in time zones west of UTC.
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
  const rawGroupName = params.groupName ?? "";
  const groupName = decodeURIComponent(rawGroupName);

  const [mode, setMode] = React.useState<GroupStatusMode>("daily");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [solvedDates, setSolvedDates] = React.useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const loadHistory = React.useCallback(
    async (targetMode: GroupStatusMode) => {
      if (!groupName.trim()) {
        setError("No group name provided in the URL.");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const history = await getGroupSolveHistoryByName(groupName, targetMode);
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
    loadHistory(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload whenever the selected mode changes.
  React.useEffect(() => {
    if (!hasLoaded) return;
    loadHistory(mode);
  }, [mode, hasLoaded, loadHistory]);

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
        <Styles.Title>{groupName || "Unknown Group"}</Styles.Title>
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
          onClick={() => loadHistory(mode)}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Reload"}
        </Styles.LoadButton>
      </Styles.Controls>

      {error && <Styles.Error>{error}</Styles.Error>}

      {!error && hasLoaded && solvedDates.length === 0 && (
        <Styles.Status>No solves recorded for this group.</Styles.Status>
      )}

      {heatmapValue.length > 0 && startDate && endDate && (
        <Styles.HeatmapCard>
          <Heatmap value={heatmapValue} startDate={startDate} endDate={endDate} />
        </Styles.HeatmapCard>
      )}
    </Styles.Container>
  );
}
