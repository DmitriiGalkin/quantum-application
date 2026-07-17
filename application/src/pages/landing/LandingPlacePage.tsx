import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { usePostAuthAction } from '../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../shared/lib/useRunPostAuthAction.ts';
import Hero from '../../shared/ui/Hero.tsx';
import { FeatureCard } from '../../shared/ui/FeatureCard.tsx';

const CREATE_PLACE_TYPE = 'create-place';

export function LandingPlacePage() {
  const navigate = useNavigate();
  const { authHandler, passport } = useAuth();
  const { setAction } = usePostAuthAction();

  const onCreate = () => {
    if(!passport) {
      setAction({
        type: CREATE_PLACE_TYPE,
        payload: { ideaId: 1 },
      });

      return authHandler();
    };

    navigate('/place/create')
  }

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_PLACE_TYPE) {
      navigate('/place/create');
    }
  });

  return (
    <>
      <Hero chip={<Chip label="Для образовательных центров" color="primary" sx={{ width: 200 }} />}>
        <Typography variant="h2">Управляйте обучением в одном месте</Typography>
        <Typography variant="h5" sx={{ maxWidth: 720 }}>
          Создавайте программы, проекты, занятия, приглашайте преподавателей, принимайте учеников и контролируйте оплаты.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={onCreate}>
            Создать образовательный центр
          </Button>

          <Button variant="outlined" size="large" sx={{ color: 'white ' }}>
            Подробнее
          </Button>
        </Stack>
      </Hero>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={10}>
          <Grid container spacing={4}>
            {[
              {
                icon: <GroupsIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Ученики',
                description: 'Храните контакты и историю участия в проектах каждого ученика',
              },
              {
                icon: <CalendarMonthIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Расписание',
                description: 'Создавайте проекты, занятия и управляйте расписанием преподавателей.',
              },
              {
                icon: <WorkspacePremiumIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Оплаты',
                description: 'Принимайте оплату за занятия и образовательные программы прямо с сайта.',
              },
            ].map(item => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <FeatureCard icon={item.icon} title={item.title} description={item.description} />
              </Grid>
            ))}
          </Grid>

          <Box>
            <Typography variant="h3" sx={{ mb: 5, textAlign: 'center' }}>
              Начните за несколько минут
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  title: '1. Создайте центр',
                  description: 'Укажите название и контактные данные.',
                },
                {
                  title: '2. Создайте проект',
                  description: 'Выберите идею проекта и план обучения.',
                },
                {
                  title: '3. Назначьте первую встречу',
                  description: 'Ученики смогут записываться на занятия.',
                },
              ].map(item => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <AutoAwesomeIcon color="primary" />

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
              Всё необходимое для работы
            </Typography>

            <Grid container spacing={2}>
              {['Проекты', 'Занятия', 'Преподаватели', 'Ученики', 'Образовательные паспорта', 'Расписание', 'Оплаты', 'Сообщения'].map(item => (
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
              <SchoolIcon color="primary" sx={{ fontSize: 60 }} />

              <Typography variant="h3" sx={{ mt: 2 }}>
                Готовы начать?
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Создание образовательного центра занимает меньше минуты.
              </Typography>

              <Button variant="contained" size="large" sx={{ mt: 4 }} onClick={onCreate}>
                Создать образовательный центр
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
