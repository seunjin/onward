export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
