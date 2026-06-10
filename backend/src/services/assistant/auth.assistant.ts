export async function authAssistant() {
  return {
    content: 'Для продолжения, пожалуйста авторизуйтесь:',
    metadata: JSON.stringify({
      target: 'auth',
      data: ['google', 'yandex'],
    }),
  };
}
