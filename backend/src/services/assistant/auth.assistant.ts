import { ChatTarget } from '@shared/types';

export async function authAssistant() {
  return {
    content: 'Для продолжения, пожалуйста авторизуйтесь:',
    target: 'auth' as ChatTarget,
  };
}
