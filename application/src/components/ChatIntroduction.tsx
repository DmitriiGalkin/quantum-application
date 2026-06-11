
import type { ChatTarget } from '@shared/types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Message from '../components/Message.tsx';
import { useAuth } from '../providers/AuthProvider.tsx';

type ChatIntroductionProps = {
  target: ChatTarget;
};

export default function ChatIntroduction({ target }: ChatIntroductionProps) {
  const { passport, user } = useAuth()

  if (!passport) {
    if (target === 'idea') {
      return (
        <Stack spacing={2}>
          <Box
            component="img"
            src="/parent.svg"
            alt="example"
            sx={{
              width: '100%',
              maxWidth: 350,
              objectFit: 'contain', // важно!
              alignItems: 'center',
            }}
          />
          <Typography>
            Воплощаем идеи детских проектов Даем возможность придумать свой собственный проект. Помогаем подбирать для ребенка интересные проекты,
            секции, кружки и мастер классы.
          </Typography>
          <Message role="assistant">
            <Typography>
              Прежде чем мы сформируем идею Вашего ребенка и загрузим ее в проект, расскажите сперва немного о ребенке: как его зовут, возраст,
              парочку слов о его увлечениях?
            </Typography>
          </Message>
        </Stack>
      );
    } else if (target === 'project') {
      return (
        <Stack spacing={2}>
          <Box
            component="img"
            src="/teacher.svg"
            alt="example"
            sx={{
              width: '100%',
              maxWidth: 350,
              objectFit: 'contain', // важно!
              alignItems: 'center',
            }}
          />
          <Typography>
            Помогаем привлекать учеников. Даем возможность мастерам и педагогам развивать детские идеи проектов. Помогаем наполнять группы, подбирать
            оптимальное время и место проведения встреч.
          </Typography>
          <Message role="assistant">
            <Typography>
              Прежде чем мы сформируем и создадим Ваш проект на базе детских идей, расскажите сперва немного о себе: ваш профессионалный род
              деятельности и интересы, которые бы Вы могли разделить вместе с детьми?
            </Typography>
          </Message>
        </Stack>
      );
    }
  };

  if (target === 'idea') {
    return (
      <Message role="assistant">
        <Typography>{user?.title}, какая у тебя новая идея?</Typography>
      </Message>
    );
  } else if (target === 'project') {
    return (
      <Message role="assistant">
        <Typography>{passport?.title}, какую идею проекта Вы хотели бы реализовать вместе с детьми?</Typography>
      </Message>
    );
  }
}
