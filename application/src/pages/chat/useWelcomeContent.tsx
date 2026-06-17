import type { Target } from '@shared/types';
import { useAuth } from '../../providers/AuthProvider.tsx';

export const useWelcomeContent = (target: Target, ideaId?: number) => {
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
    } else if (target === 'meet') {
      return 'Прежде чем создадим встречу, давайте создадим проект, а для этого узнаем чем вы сами увлекаетесь?';
    }
  }

  if (target === 'idea') {
    return `${user?.title}, какая у тебя новая идея?`;
  } else if (target === 'project' && !ideaId) {
    return `${passport?.title}, какую идею проекта Вы хотели бы реализовать вместе с детьми?`;
  } else if (target === 'project' && ideaId) {
    return `${passport?.title}, где будет проходить новый проект по идее?`;
  } else if (target === 'meet') {
    return `${passport?.title}, когда бы Вы хотели провести встречу?`;
  }

  return '';
};
