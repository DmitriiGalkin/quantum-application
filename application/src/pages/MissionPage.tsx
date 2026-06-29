import { Box, Container, Typography, Paper, Grid, Stack, Divider } from '@mui/material';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import Hero from '../shared/ui/Hero.tsx';
import { FeatureCard } from '../shared/ui/FeatureCard.tsx';

export default function MissionPage() {
  return (
    <Box>
      <Hero>
        <Typography variant="h2">Миссия Quantum</Typography>
        <Typography variant="h5" sx={{ maxWidth: 900 }}>
          Помогать каждому ребёнку находить занятия, проекты и наставников, которые раскрывают его интересы, способности и внутреннюю мотивацию.
        </Typography>
      </Hero>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper sx={{ p: 5, mb: 8 }}>
          <Stack spacing={3}>
            <Typography variant="h4">
              Каждый ребёнок талантлив
            </Typography>

            <Typography variant="body1">
              Мы убеждены, что у каждого ребёнка есть сильные стороны. Но далеко не всегда родители знают, где именно их можно раскрыть. Большинство
              кружков выбирается случайно, по совету знакомых или по принципу «рядом с домом».
            </Typography>

            <Typography variant="body1">
              Quantum помогает превратить этот выбор в осознанный путь, основанный на интересах ребёнка, рекомендациях AI и возможностях, доступных
              рядом.
            </Typography>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<FavoriteIcon color="primary" sx={{ fontSize: 42 }} />}
              title="Для детей"
              description="Помогаем находить занятия, которые действительно вдохновляют, развивают способности и позволяют создавать собственные проекты."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<GroupsIcon color="primary" sx={{ fontSize: 42 }} />}
              title="Для родителей"
              description="Помогаем принимать уверенные решения, понимать интересы ребёнка и экономить время на поиске подходящих кружков и проектов."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<SchoolIcon color="primary" sx={{ fontSize: 42 }} />}
              title="Для организаций"
              description=" Помогаем образовательным центрам находить именно тех детей, которым их программы подходят больше всего."
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 8 }} />

        {/* Values */}

        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }} gutterBottom>
          Во что мы верим
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2, color: 'white' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              <Stack direction="row" spacing={2}>
                <PsychologyIcon color="primary" />

                <Box>
                  <Typography sx={{ fontWeight: 600 }}>AI — помощник, а не замена</Typography>

                  <Typography color="text.secondary">
                    Искусственный интеллект помогает увидеть новые возможности, но окончательное решение всегда принимает семья.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <RocketLaunchIcon color="primary" />

                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Проекты важнее оценок</Typography>

                  <Typography color="text.secondary">
                    Настоящее развитие происходит тогда, когда знания превращаются в реальные действия и собственные идеи.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>
              <Stack direction="row" spacing={2}>
                <FavoriteIcon color="primary" />

                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Интерес рождает мотивацию</Typography>

                  <Typography color="text.secondary">
                    Ребёнок развивается быстрее тогда, когда занимается тем, что действительно вызывает любопытство.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <AutoAwesomeIcon color="primary" />

                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Возможности должны быть доступны каждому</Typography>

                  <Typography color="text.secondary">
                    Мы стремимся сделать качественное дополнительное образование понятным и доступным для любой семьи.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Paper
          sx={{
            mt: 10,
            pt: 6,
            px: 2,
            pb: 2,
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
            Quantum
          </Typography>

          <Typography variant="h5" sx={{ mb: 5 }}>
            Место, где интерес ребёнка превращается в возможность для развития.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              maxWidth: 900,
              mx: 'auto',
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'inherit',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 2,
                opacity: 0.8,
              }}
            >
              ДОЛГОСРОЧНАЯ ЦЕЛЬ
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                mb: 3,
                fontWeight: 700,
              }}
            >
              Экосистема, где каждый ребёнок сможет найти своё направление
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: '1.1rem',
                opacity: 0.95,
                lineHeight: 1.9,
              }}
            >
              Мы хотим создать экосистему, в которой каждый ребёнок сможет легко найти своё направление развития независимо от города, уровня дохода
              семьи или количества доступной информации.
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 4,
                fontWeight: 500,
                fontStyle: 'italic',
                opacity: 0.95,
              }}
            >
              Чтобы путь от первого интереса до настоящего увлечения был коротким, понятным и вдохновляющим.
            </Typography>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
}
