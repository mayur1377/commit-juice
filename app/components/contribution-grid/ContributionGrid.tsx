import { CELL_SIZE, CELL_GAP, CELL_COLUMN_WIDTH, WEEKDAY_LABEL_WIDTH, GRID_ROWS, renderTextOnGrid, getMonthLabels } from "@/app/lib/grid-utils";

interface ContributionGridProps {
  message: string;
  offset: number;
  startDate: Date;
  endDate: Date;
  selectedYear: number | null;
  totalCols: number;
}

export function ContributionGrid({ message, offset, startDate, endDate, selectedYear, totalCols }: ContributionGridProps) {
  // No weekday offset, grid always starts from Sunday
  const grid = renderTextOnGrid(message, offset);
  const months = getMonthLabels(startDate, totalCols, selectedYear || undefined);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate weekday offset for the first date
  const weekdayOffset = startDate.getDay();

  // Calculate the total grid width in px
  const gridWidth = totalCols * CELL_COLUMN_WIDTH;

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: gridWidth + WEEKDAY_LABEL_WIDTH + 'px' }}>
        {/* Month Labels */}
        <div
          className="flex text-xs text-muted-foreground font-mono"
          style={{ paddingLeft: `${WEEKDAY_LABEL_WIDTH}px` }}
        >
          {months.map((m, idx) => {
            const startCol = m.col;
            const endCol = idx < months.length - 1 ? months[idx + 1].col : totalCols;
            const widthInPx = (endCol - startCol) * CELL_COLUMN_WIDTH;
            return (
              <div key={m.label + m.col} style={{ width: `${widthInPx}px` }}>
                {m.label}
              </div>
            );
          })}
        </div>
        <div className="flex mt-1">
          {/* Weekday Labels */}
          <div
            className="flex flex-col text-xs text-muted-foreground font-mono"
            style={{ width: `${WEEKDAY_LABEL_WIDTH}px`, paddingRight: '5px' }}
          >
            {weekdays.map((day, i) => (
              <div key={i} style={{ height: `${CELL_SIZE}px`, marginBottom: i === GRID_ROWS - 1 ? '0' : `${CELL_GAP}px` }} className="flex items-center">
                {i % 2 !== 0 ? day : ''}
              </div>
            ))}
          </div>
          {/* Contribution Grid */}
          <div className={`grid grid-flow-col grid-rows-7`} style={{ gap: `${CELL_GAP}px` }}>
            {Array.from({ length: totalCols }).map((_, colIdx) => (
              Array.from({ length: GRID_ROWS }).map((_, rowIdx) => {
                // Calculate the date for this cell
                const cellIndex = colIdx * GRID_ROWS + rowIdx;
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + (cellIndex - weekdayOffset));
                // Only render cells for dates within the range
                if (colIdx === 0 && rowIdx < weekdayOffset) {
                  // Pad the first week with empty cells
                  return <div key={`pad-${rowIdx}`} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }} className="rounded-[2px] border bg-transparent" />;
                }
                if (date < startDate || date > endDate) {
                  return <div key={`empty-${colIdx}-${rowIdx}`} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }} className="rounded-[2px] border bg-transparent" />;
                }
                const isCellActive = grid[rowIdx] && grid[rowIdx][colIdx];
                return (
                  <div
                    key={`cell-${colIdx}-${rowIdx}`}
                    style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                    className={`rounded-[2px] border ${isCellActive ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  />
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}