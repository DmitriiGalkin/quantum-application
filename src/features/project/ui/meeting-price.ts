export function meetingPrice(price: number | null): string {
  return price == null ? 'Стоимость уточняется' : price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽ за встречу`;
}
