import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Hero from 'components/Hero.tsx';
import { FeatureCard } from 'components/FeatureCard.tsx';
import { useAuth } from '../../providers/auth-context.ts';
import { usePostAuthAction } from '../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../shared/lib/useRunPostAuthAction.ts';
import { useState } from 'react';
import { CreateProjectDialog } from '../../features/project/ui/CreateProjectDialog.tsx';

const CREATE_TEACHER_TYPE = 'create-teacher';

export function LandingTeacherPage() {
  const { authHandler, passport } = useAuth();
  const { setAction } = usePostAuthAction();
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);

  const onCreate = () => {
    if (!passport) {
      setAction({
        type: CREATE_TEACHER_TYPE,
      });

      return authHandler();
    }

    setIsCreateProjectDialogOpen(true);
  };

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_TEACHER_TYPE) {
      setIsCreateProjectDialogOpen(true);
    }
  }, action => action.type === CREATE_TEACHER_TYPE);

  return (
    <>
      <Hero chip={<Chip label="Для преподавателей" color="primary" />}>
        <Typography variant="h2" sx={{ mt: 3, fontWeight: 700 }}>
          Делитесь знаниями и развивайте учеников
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 720, mx: 'auto' }}>
          Присоединяйтесь к образовательным центрам, проводите занятия, отслеживайте расписание и сопровождайте учеников на протяжении всего обучения.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={onCreate}>
            Стать преподавателем
          </Button>

          <CreateProjectDialog open={isCreateProjectDialogOpen} onClose={() => setIsCreateProjectDialogOpen(false)} />

          <Button variant="outlined" size="large" href="#how-it-works">
            Подробнее
          </Button>
        </Stack>
      </Hero>

      <Container id="how-it-works" maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={10}>
          <Grid container spacing={4}>
            {[
              {
                icon: <EventAvailableIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Создать профессиональный профиль',
                description: 'Представить себя, Устроиться в центр.',
              },
              {
                icon: <GroupsIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Превратите образовательную идею в готовый проект',
                description: 'Создать идеи и проекты, управлять образовательными проектами.',
              },
              {
                icon: <MenuBookIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Открыть набор учеников и начать проводить занятия',
                description: 'Подбирать места проведения и время проведения встреч по проектам.',
              },
              {
                icon: <MenuBookIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Управление расписанием и посещаемостью',
                description: 'Отслеживать расписание, оплаты, возвраты, уведомлять об изменениях.',
              },
              {
                icon: <MenuBookIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Поддерживать доверие родителей',
                description: 'Вести общение с родителями, предоставлять актуальную информацию об участии ученика.',
              },
              {
                icon: <MenuBookIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Управление финансами',
                description: 'Ослеживание прибыли по проектам.',
              },
            ].map(item => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <FeatureCard icon={item.icon} title={item.title} description={item.description} />
              </Grid>
            ))}
          </Grid>

          <Box>
            <Typography variant="h3" sx={{ mb: 5, textAlign: 'center' }}>
              Как начать
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  title: '1. Авторизуйтесь',
                  description: 'Создайте аккаунт преподавателя. Укажите направления и увлечения.',
                },
                {
                  title: '2. Формируйте проекты',
                  description: 'Подхватывайте идеи детских проектов. Выбирайте места проведения встреч.',
                },
                {
                  title: '3. Присоединитесь к центру',
                  description: 'Дополнительно получите приглашения от образовательных центров.',
                },
                {
                  title: '4. Начните проводить занятия',
                  description: 'Работайте с учениками и развивайте проекты.',
                },
              ].map(item => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <SchoolIcon color="primary" />

                      <Typography variant="h6" sx={{ mt: 2 }}>
                        {item.title}
                      </Typography>

                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ mb: 5, textAlign: 'center' }}>
              Возможности преподавателя
            </Typography>

            <Grid container spacing={2}>
              {['Мои занятия', 'Расписание', 'Проекты', 'Ученики', 'Посещаемость', 'Домашние задания', 'Сообщения', 'Достижения'].map(item => (
                <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <TaskAltIcon color="success" />
                        <Typography>{item}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <EmojiEventsIcon color="primary" sx={{ fontSize: 60 }} />

              <Typography variant="h3" sx={{ mt: 2 }}>
                Станьте частью образовательного сообщества
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Найдите образовательный центр, проводите занятия и помогайте ученикам достигать новых результатов.
              </Typography>

              <Button variant="contained" size="large" sx={{ mt: 4 }} onClick={onCreate}>
                Создать аккаунт преподавателя
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
