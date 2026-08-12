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

export function toDateTimeLocal(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const getStartDateTime = (date: Date): number => {
  date.setHours(0, 0, 0, 0); // Обнуляем время для точности до дня
  return date.getTime();
};

export function formatMoney(value: number): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(value);

  const mod100 = Math.abs(value) % 100;
  const mod10 = Math.abs(value) % 10;

  let currency = 'рублей';

  if (mod100 >= 11 && mod100 <= 19) {
    currency = 'рублей';
  } else if (mod10 === 1) {
    currency = 'рубль';
  } else if (mod10 >= 2 && mod10 <= 4) {
    currency = 'рубля';
  }

  return `${formatted} ${currency}`;
}