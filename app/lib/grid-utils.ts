import { FONT_5x7 } from "@/lib/font5x7";

export const GRID_ROWS = 7;
export const GRID_COLS = 53;

// --- Layout Constants for Perfect Alignment ---
export const CELL_SIZE = 12;
export const CELL_GAP = 2;
export const CELL_COLUMN_WIDTH = CELL_SIZE + CELL_GAP;
export const WEEKDAY_LABEL_WIDTH = 30;

export function renderTextOnGrid(text: string, offset: number = 0): boolean[][] {
  const maxChars = Math.floor(GRID_COLS / 6);
  const chars = text.split("").slice(0, maxChars);
  const grid: boolean[][] = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));

  let colOffset = offset;
  for (const char of chars) {
    const font = FONT_5x7[char] || FONT_5x7[char.toUpperCase()] || FONT_5x7[' '];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < 5; col++) {
        const week = colOffset + col;
        if (week < GRID_COLS && row < GRID_ROWS && week >= 0) {
          grid[row][week] = !!font[row][col];
        }
      }
    }
    colOffset += 6;
    if (colOffset >= GRID_COLS) break;
  }
  return grid;
}

export function getMonthLabels(startDate: Date, totalCols: number, year?: number) {
  const months: { label: string; col: number }[] = [];
  let lastMonth = -1;

  for (let col = 0; col < totalCols; col++) {
    const dateInWeek = new Date(startDate);
    dateInWeek.setDate(startDate.getDate() + col * 7);
    // Only consider months in the selected year (if year is provided)
    if (year !== undefined && dateInWeek.getFullYear() !== year) continue;
    // Check if the 1st of a new month falls within this week
    let newMonthInWeek = -1;
    for (let i = 0; i < 7; i++) {
      const dayInIteration = new Date(dateInWeek);
      dayInIteration.setDate(dateInWeek.getDate() + i);
      if (dayInIteration.getDate() === 1 && (year === undefined || dayInIteration.getFullYear() === year)) {
        newMonthInWeek = dayInIteration.getMonth();
        break;
      }
    }
    const currentMonth = dateInWeek.getMonth();
    const displayMonth = newMonthInWeek !== -1 ? newMonthInWeek : currentMonth;
    if (displayMonth !== lastMonth) {
      // Don't add Jan of next year if grid ends in Dec
      if (year !== undefined && displayMonth === 0 && lastMonth === 11) break;
      months.push({ label: new Date(dateInWeek.getFullYear(), displayMonth, 1).toLocaleString('en-US', { month: 'short' }), col });
      lastMonth = displayMonth;
    }
  }
  // The first label might be for padding (e.g. previous Dec). If so, remove it.
  const firstDayInGrid = new Date(startDate);
  const firstMonthInGrid = firstDayInGrid.getMonth();
  if (months.length > 0 && firstDayInGrid.getDate() !== 1 && months[0].label === new Date(firstDayInGrid.getFullYear(), firstMonthInGrid, 1).toLocaleString('en-US', { month: 'short' })) {
    if (firstDayInGrid.getMonth() !== new Date(firstDayInGrid.getFullYear(), firstMonthInGrid + 1, 0).getMonth()) {
      // Check if the month actually starts in the first week.
      const tempDate = new Date(startDate);
      tempDate.setDate(tempDate.getDate() + 6);
      if (tempDate.getMonth() !== firstMonthInGrid) {
        months.shift();
      }
    }
  }
  return months;
} 