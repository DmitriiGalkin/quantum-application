import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import Hero from 'components/Hero.tsx';
import { FeatureCard } from 'components/FeatureCard.tsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider.tsx';
import { usePostAuthAction } from '../../shared/lib/usePostAuthAction.ts';
import { useRunPostAuthAction } from '../../shared/lib/useRunPostAuthAction.ts';

const CREATE_TEACHER_TYPE = 'create-teacher';

export function LandingParentPage() {

  const navigate = useNavigate();
  const { authHandler, passport } = useAuth();
  const { setAction } = usePostAuthAction();

  const onCreate = () => {
    if (!passport) {
      setAction({
        type: CREATE_TEACHER_TYPE,
        payload: { ideaId: 1 },
      });

      return authHandler();
    }

    navigate('/teacher/projects/create');
  };

  useRunPostAuthAction(passport, action => {
    if (action.type === CREATE_TEACHER_TYPE) {
      navigate('/teacher/projects/create');
    }
  });

  return (
    <>
      <Hero chip={<Chip label="Для родителей" color="primary" />}>
        <Typography variant="h2" sx={{ mt: 3, fontWeight: 700 }}>
          Притвори идею ребенка в жизнь!
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 720, mx: 'auto' }}>
          Создавайте уникальные идеи детских проектов, присоединяйтесь к удивительным проектам единомышленников, участвуйте в живых встречах и
          развивайте навыки Вашего ребенка.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={onCreate}>
            Создать идею
          </Button>

          <Button variant="outlined" size="large">
            Подробнее
          </Button>
        </Stack>
      </Hero>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={10}>
          <Grid container spacing={4}>
            {[
              {
                icon: <TipsAndUpdatesIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Уникальные идеи проектов',
                description: 'Создавайте с детьми проекты на основе их интересов и присоединяйтесь к проектам.',
              },
              {
                icon: <GroupsIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Единомышленники',
                description: 'Детская проектная дейтельность под руководством подобранных наставников.',
              },
              {
                icon: <EventAvailableIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Расписание',
                description: 'Просматривайте проекты, занятия и персональное расписание для ребенка.',
              },
            ].map(item => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <FeatureCard icon={item.icon} title={item.title} description={item.description} />
              </Grid>
            ))}
          </Grid>

          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <EmojiEventsIcon color="primary" sx={{ fontSize: 60 }} />

              <Typography variant="h3" sx={{ mt: 2 }}>
                Станьте частью образовательного сообщества
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Помогите ребенку найти увлечение, проект для раскрытия его внутренних качеств. Сопровождайте его от одного проекта к следующему, совместно исследуйте его новые интересы, развивайте его в проектной деятельности!
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5, justifyContent: 'center' }}>
                <Button variant="contained" size="large" sx={{ mt: 4 }} onClick={onCreate}>
                  Создать идею проекта
                </Button>

                <Button variant="outlined" size="large">
                  Присоединиться к существующим
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
