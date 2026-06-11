export function addMinutes(timeStr: string, minutes: number) {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

export function extractTime(isoString: string) {
  const match = isoString.match(/\d\d:\d\d/);
  return match ? match[0] : '';
}
