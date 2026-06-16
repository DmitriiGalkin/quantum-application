import { Target } from '@shared/types';
import { useAuth } from '../../providers/AuthProvider.tsx';

export const useWelcomeContent = (target: Target) => {
  const { passport, user } = useAuth();

  if (!passport) {
    if (target === Target.IDEA) {
      return (
        'Прежде чем мы сформируем идею Вашего ребенка и загрузим ее в проект, расскажите сперва немного о ребенке: как его зовут, возраст,\n' +
        '              парочку слов о его увлечениях?'
      );
    } else if (target === Target.PROJECT) {
      return (
        'Прежде чем мы сформируем и создадим Ваш проект на базе детских идей, расскажите сперва немного о себе: ваш профессионалный род\n' +
        '              деятельности и интересы, которые бы Вы могли разделить вместе с детьми?'
      );
    } else if (target === Target.MEET) {
      return (
        'Прежде чем создадим встречу, давайте создадим проект, а для этого узнаем чем вы сами увлекаетесь?'
      );
    }
  }

  if (target === Target.IDEA) {
    return `${user?.title}, какая у тебя новая идея?`;
  } else if (target === Target.PROJECT) {
    return `${passport?.title}, какую идею проекта Вы хотели бы реализовать вместе с детьми?`;
  } else if (target === Target.MEET) {
    return `${passport?.title}, когда бы Вы хотели провести встречу?`;
  }

  return ''
}
