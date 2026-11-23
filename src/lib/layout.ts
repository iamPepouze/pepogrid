/** The grid's smallest size at normal text, in CSS px. */
export const MIN_BOARD = 200

/**
 * The stacked layout's grid size: the largest square that fits the height left under the header,
 * controls and pad, but never below a minimum that grows with the text size, and never wider than the column.
 * At large text the minimum reaches the column's width, so the grid keeps it and the page scrolls
 * vertically instead of shrinking the grid (UX_STANDARDS.md U19).
 * @param width the column's available width
 * @param height the page's available height
 * @param others the height of everything in the column but the grid
 * @param textScale the root font size over the browser's default of 16px
 */
export function boardSize(width: number, height: number, others: number, textScale: number) {
  const minimum = Math.min(width, MIN_BOARD * Math.max(1, textScale))
  return Math.floor(Math.max(minimum, Math.min(width, height - others)))
}
