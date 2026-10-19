/** Round the cost of a meeting to the nearest kopeck. */
export function venuePriceForDuration(hourlyRate: number, durationMinutes: number): number {
  const hourlyKopecks = Math.round(hourlyRate * 100);
  return Math.round(hourlyKopecks * durationMinutes / 60) / 100;
}
