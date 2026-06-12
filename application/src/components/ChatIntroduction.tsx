
import type { ChatTarget } from '@shared/types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useAuth } from '../providers/AuthProvider.tsx';

type ChatIntroductionProps = {
  target: ChatTarget;
};

export default function ChatIntroduction({ target }: ChatIntroductionProps) {
  const { passport } = useAuth()

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
        </Stack>
      );
    }
  };
}
