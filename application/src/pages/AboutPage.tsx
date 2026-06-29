import { Avatar, Box, Container, Grid, Paper, Stack, Typography } from '@mui/material';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Hero from '../shared/ui/Hero.tsx';
import { FeatureCard } from '../shared/ui/FeatureCard.tsx';

export default function AboutPage() {
  return (
    <Box>
      <Hero>
        <Typography variant="h2">О Quantum</Typography>
        <Typography variant="h5" sx={{ maxWidth: 900 }}>
          Мы создаём AI-навигатор детского развития, который помогает семьям находить занятия, проекты и наставников, соответствующих интересам
          ребёнка.
        </Typography>
      </Hero>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper sx={{ p: 5 }}>
          <Typography variant="h4" gutterBottom>
            Почему появился Quantum
          </Typography>

          <Typography gutterBottom>
            Современным родителям приходится самостоятельно искать кружки, секции, лагеря и проекты, сравнивать десятки организаций и надеяться, что
            выбранное направление действительно понравится ребёнку.
          </Typography>

          <Typography gutterBottom>Мы решили создать сервис, который поможет сделать этот выбор осознанным и персональным.</Typography>

          <Typography>
            Quantum объединяет возможности искусственного интеллекта, современные технологии и образовательную экосистему, чтобы поиск занятий стал
            простым, понятным и полезным.
          </Typography>
        </Paper>

        <Box sx={{ mt: 8 }} />

        {/* Что мы создаём */}

        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          Что мы создаём
        </Typography>

        <Grid container spacing={4} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<AutoAwesomeIcon color="primary" sx={{ fontSize: 42 }} />}
              title="AI-рекомендации"
              description="Персональные рекомендации на основе интересов ребёнка, возраста и целей семьи."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<RocketLaunchIcon color="primary" sx={{ fontSize: 42 }} />}
              title="Проекты"
              description="Не только кружки, но и исследовательские, инженерные, творческие проекты, конкурсы и лагеря."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<PsychologyIcon color="primary" sx={{ fontSize: 42 }} />}
              title="Развитие ребёнка"
              description="Мы хотим помогать ребёнку открывать свои сильные стороны и постепенно строить собственный путь развития."
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 10 }} />

        {/* Наш подход */}

        <Paper sx={{ p: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Наш подход
          </Typography>

          <Stack spacing={3} sx={{ mt: 4 }}>
            <Stack direction="row" spacing={2}>
              <LightbulbIcon color="primary" />
              <Typography>Мы считаем, что интерес ребёнка — лучшая отправная точка для развития.</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <GroupsIcon color="primary" />
              <Typography>Родители, педагоги и организации являются партнёрами в развитии ребёнка.</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <AutoAwesomeIcon color="primary" />
              <Typography>Искусственный интеллект помогает принимать решения, но никогда не заменяет родителей.</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ mt: 7 }} />

        {/* Команда */}

        <Typography variant="h4" sx={{ fontWeight: 700, align: 'center' }} gutterBottom>
          Кто стоит за проектом
        </Typography>

        <Paper sx={{ p: 6 }}>
          <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: 'primary.main',
                fontSize: 36,
              }}
            >
              Q
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Quantum — независимый технологический проект
            </Typography>

            <Typography
              sx={{
                maxWidth: 850,
              }}
              color="text.secondary"
            >
              Мы постепенно создаём платформу, которая объединит семьи, образовательные организации, наставников и современные AI-технологии в единую
              экосистему детского развития.
            </Typography>
          </Stack>
        </Paper>

        <Box sx={{ mt: 10 }} />

        {/* Финал */}

        <Paper
          sx={{
            p: 6,
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Мы только начинаем
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 850,
              mx: 'auto',
            }}
          >
            Если вы разделяете нашу идею, развиваете детские проекты, образовательные программы или хотите помочь семьям находить лучшие возможности
            для развития детей — будем рады сотрудничеству.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
