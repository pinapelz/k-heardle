import React from "react";

import HeatMap, { type HeatMapValue } from "@uiw/react-heat-map";

export interface HeatmapProps {
  value: HeatMapValue[];
  startDate?: Date;
  endDate?: Date;
}

const PANEL_COLORS = [
  "var(--cl-gray-2)",
  "var(--cl-cyan-7)",
  "var(--cl-cyan-6)",
  "hsl(160, 60%, 50%)",
  "hsl(160, 70%, 42%)",
];


const formatTooltip = (dateStr: string, count: number) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return `${dateStr}: ${count}`;
 const formatted = d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${formatted} ${count === 1 ? " COMPLETED" : " MISSED"}`;
};

const Heatmap = React.forwardRef<HTMLDivElement, HeatmapProps>(
  ({ value, startDate, endDate }, ref) => {
    const resolvedStartDate =
      startDate ?? (value.length > 0 ? new Date(value[0].date) : new Date());

    const resolvedEndDate = endDate ?? new Date();
    const startOfWeek = new Date(resolvedStartDate);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const daysInRange = Math.max(
      1,
      Math.floor(
        (resolvedEndDate.getTime() - startOfWeek.getTime()) / (24 * 60 * 60 * 1000)
      ) + 1
    );
    const heatmapWidth = Math.ceil(daysInRange / 7) * 22 + 28;

    const rectRender = React.useCallback<
      (
        props: React.SVGProps<SVGRectElement>,
        item: HeatMapValue & { column: number; row: number; index: number }
      ) => React.ReactElement | void
    >(
      (props, item) => {
        return (
          <rect {...props}>
            <title>{formatTooltip(item.date, item.count || 0)}</title>
          </rect>
        );
      },
      []
    );

    return (
      <div ref={ref} style={{ width: "100%", overflowX: "auto" }}>
        <HeatMap
          style={{ color: "#ffffff", width: `${heatmapWidth}px`, maxWidth: "none" }}
          value={value}
          startDate={resolvedStartDate}
          endDate={endDate}
          panelColors={PANEL_COLORS}
          rectSize={20}
          legendCellSize={0}
          rectRender={rectRender}
        />
      </div>
    );
  }
);

Heatmap.displayName = "Heatmap";

export { Heatmap };
export default Heatmap;
