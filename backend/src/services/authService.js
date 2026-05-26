export async function authAssistant() {
  try {
    return {
      content: 'Пожалуйста авторизуйетсь удобным для Вас способом',
      metadata: JSON.stringify({ target: 'auth', data: ['google', 'yandex'] }),
    };
  } catch (error) {
    console.error('Ошибка в authAnswer:', error);

    // Это предотвращает падение всего приложения на клиенте.
    return {
      status: 'error', // Добавляем статус ошибки
      message:
        'Упс! Кажется, наш помощник немного устал и не смог ответить прямо сейчас. Пожалуйста, попробуйте задать вопрос позже.',
      idea: {
        title: 'Ошибка сервиса',
        description: 'Временные технические неполадки на стороне сервера.',
      },
    };
  }
}
