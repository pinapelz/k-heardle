import React from "react";
import styled from "styled-components";
import HeatMap, { type HeatMapValue } from "@uiw/react-heat-map";

export interface HeatmapProps {
  value: HeatMapValue[];
  startDate?: Date;
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
  ({ value, startDate }, ref) => {
    const resolvedStartDate =
      startDate ?? (value.length > 0 ? new Date(value[0].date) : new Date());

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
          <HeatMap
            style={{ color: '#fffffff' }}
            value={value}
            startDate={resolvedStartDate}
            panelColors={PANEL_COLORS}
            rectSize={20}
            legendCellSize={0}
            rectRender={rectRender}
          />
    );
  }
);

Heatmap.displayName = "Heatmap";

export { Heatmap };
export default Heatmap;
