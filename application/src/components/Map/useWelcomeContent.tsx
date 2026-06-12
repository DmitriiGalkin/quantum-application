import type { ChatTarget } from '@shared/types';
import { useAuth } from '../../providers/AuthProvider.tsx';

export const useWelcomeContent = (target: ChatTarget) => {
  const { passport, user } = useAuth();

  if (!passport) {
    if (target === 'idea') {
      return (
        'Прежде чем мы сформируем идею Вашего ребенка и загрузим ее в проект, расскажите сперва немного о ребенке: как его зовут, возраст,\n' +
        '              парочку слов о его увлечениях?'
      );
    } else if (target === 'project') {
      return (
        'Прежде чем мы сформируем и создадим Ваш проект на базе детских идей, расскажите сперва немного о себе: ваш профессионалный род\n' +
        '              деятельности и интересы, которые бы Вы могли разделить вместе с детьми?'
      );
    }
  }

  if (target === 'idea') {
    return `${user?.title}, какая у тебя новая идея?`;
  } else if (target === 'project') {
    return `${passport?.title}, какую идею проекта Вы хотели бы реализовать вместе с детьми?`;
  }

  return ''
}
