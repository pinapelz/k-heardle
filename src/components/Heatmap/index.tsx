import React from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import "react-calendar/dist/Calendar.css";

export interface CalendarValue {
  date: string;
  count?: number;
}

export interface CalendarProps {
  value: CalendarValue[];
  startDate?: Date;
  endDate?: Date;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void;
}

function parseDateOnly(input: string): Date | null {
  const match = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) {
    const fallback = new Date(input);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, y, m, d] = match;
  const parsed = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function clampMonth(date: Date, minDate?: Date, maxDate?: Date): Date {
  const monthDate = startOfMonth(date);
  if (minDate && monthDate < startOfMonth(minDate)) return startOfMonth(minDate);
  if (maxDate && monthDate > startOfMonth(maxDate)) return startOfMonth(maxDate);
  return monthDate;
}

const Wrapper = styled.div`
  width: 100%;

  .react-calendar {
    width: 100%;
    border: 1px solid var(--cl-gray-4, #3a3a3a);
    border-radius: 12px;
    background: var(--cl-gray-1, #151515);
    color: var(--cl-gray-11, #e8e8e8);
    font-family: inherit;
    padding: 8px;
  }

  .react-calendar__navigation button {
    color: var(--cl-gray-11, #e8e8e8);
    min-height: 36px;
    background: transparent;
    border-radius: 8px;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background: var(--cl-gray-3, #222);
  }

  .react-calendar__month-view__weekdays {
    text-transform: uppercase;
    font-size: 0.7rem;
    color: var(--cl-gray-8, #aaa);
  }

  .react-calendar__tile {
    position: relative;
    min-height: 44px;
    background: transparent;
    color: var(--cl-gray-11, #e8e8e8);
    border-radius: 8px;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: var(--cl-gray-3, #232323);
  }

  .react-calendar__tile--now {
    background: var(--cl-gray-2, #1f1f1f);
  }

  .react-calendar__tile--active {
    background: var(--cl-gray-3, #2a2a2a);
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: var(--cl-gray-7, #808080);
  }
`;

const SolvedMarker = styled.span`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--cl-cyan-6, #2dd4bf);
`;

const AttemptedMarker = styled(SolvedMarker)`
  background: var(--cl-gray-7, #808080);
`;

const Heatmap = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ value, startDate, endDate, selectedDate, onDateClick }, ref) => {
    const dayStatusByDate = React.useMemo(() => {
      const map = new Map<string, "solved" | "attempted">();

      for (const entry of value) {
        const parsed = parseDateOnly(entry.date);
        if (!parsed) continue;

        const dayKey = toDayKey(parsed);
        const solvedCount = entry.count ?? 1;

        if (solvedCount > 0) {
          map.set(dayKey, "solved");
          continue;
        }

        if (!map.has(dayKey)) {
          map.set(dayKey, "attempted");
        }
      }

      return map;
    }, [value]);

    const initialMonth = React.useMemo(() => {
      return clampMonth(new Date(), startDate, endDate);
    }, [startDate, endDate]);

    const [activeStartDate, setActiveStartDate] = React.useState<Date>(initialMonth);

    React.useEffect(() => {
      setActiveStartDate(initialMonth);
    }, [initialMonth]);

    return (
      <Wrapper ref={ref}>
        <Calendar
          activeStartDate={activeStartDate}
          value={selectedDate}
          onClickDay={(date) => {
            onDateClick?.(date);
          }}
          onActiveStartDateChange={({ activeStartDate: next }) => {
            if (next) setActiveStartDate(clampMonth(next, startDate, endDate));
          }}
          minDate={startDate}
          maxDate={endDate}
          minDetail="month"
          maxDetail="month"
          showNeighboringMonth={false}
          tileContent={({ date, view }) => {
            if (view !== "month") return null;

            const status = dayStatusByDate.get(toDayKey(date));
            if (!status) return null;

            const formatted = date.toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            if (status === "attempted") {
              return <AttemptedMarker title={`${formatted} attempted`} />;
            }

            return <SolvedMarker title={`${formatted} solved`} />;
          }}
        />
      </Wrapper>
    );
  }
);

Heatmap.displayName = "Heatmap";

export { Heatmap };
export default Heatmap;
