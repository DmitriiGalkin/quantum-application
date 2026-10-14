import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
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
import { useNavigate } from 'react-router-dom';


export function LandingParentPage() {

  const navigate = useNavigate();
  const onCreate = () => navigate("/");

  return (
    <>
      <Hero chip={<Chip label="Для родителей" color="primary" />}>
        <Typography variant="h2" sx={{ mt: 3, fontWeight: 700 }}>
          Найдите интересный проект для ребёнка
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 720, mx: 'auto' }}>
          Выберите образовательный проект, познакомьтесь с преподавателем и запишитесь на встречу.
          Расписание, место и стоимость помогут выбрать подходящий вариант.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5, justifyContent: 'center' }}>
          <Button variant="contained" size="large" onClick={onCreate}>
            Выбрать проект
          </Button>

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
                icon: <TipsAndUpdatesIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Проекты по интересам',
                description: 'Посмотрите, что ребёнок сможет сделать и чему научиться на встречах проекта.',
              },
              {
                icon: <GroupsIcon color="primary" sx={{ fontSize: 42 }} />,
                title: 'Единомышленники',
                description: 'Совместная работа над проектом под руководством преподавателя.',
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
                  Выбрать проект
                </Button>

              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
