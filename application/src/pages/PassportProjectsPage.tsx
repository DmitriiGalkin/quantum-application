import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchPassportProjects } from '../requests.ts';
import CreateProjectBlock from '../shared/ui/CreateProjectBlock.tsx';
import Page from '../shared/ui/Page.tsx';
import { groupProjectsByIdea } from '../utils/helper.ts';
import IdeaProjectCard from '../features/projects/ui/IdeaProjectCard.tsx';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { CardActions, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import IdeaProjectCardForPassport from '../features/projects/ui/IdeaProjectCardForPassport.tsx';
import AIIdeaBanner from '../features/ideas/ui/AIIdeaBanner.tsx';

function PassportProjectsPage() {
  const { id } = useParams();
  const userId = id ? Number(id) : undefined;

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchPassportProjects(),
  });
  const groupes = groupProjectsByIdea(projects);

  return (
    <Page isLoading={isProjectsLoading}>
      <Box component="section">
        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}
        <AIIdeaBanner />
        {!projects.length && <CreateProjectBlock />}

        {Boolean(groupes.length) && (
          <Stack spacing={2}>
            {groupes.map(({ idea, projects }) => (
              <Card
                key={idea.id}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  mb: 2,
                  border: projects.length === 1 ? '1px solid rgba(255,182,40,0.3)' : undefined,
                }}
              >
                {/* IDEA HEADER */}
                <Box sx={{ display: 'flex' }}>
                  <CardMedia
                    component="img"
                    image={idea.image || `/bg.jpeg`}
                    alt={idea.title}
                    sx={{
                      width: 120,
                      height: 120,
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{idea.title}</Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {idea.description}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {projects.length} проектов
                    </Typography>
                  </CardContent>
                </Box>

                {/* PROJECTS */}
                <Box sx={{ px: 2, pb: 1 }}>
                  <Stack spacing={1}>
                    {projects.map(project => (
                      <IdeaProjectCardForPassport key={project.id} project={project} />
                    ))}
                  </Stack>
                </Box>

                {/* CTA */}
                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <Button size="small" href={`/idea/${idea.id}`}>
                    Подробнее об идее
                  </Button>

                  <Button variant="contained" size="small" href={`/chat?target=project&ideaId=${idea.id}`}>
                    + Проект
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Page>
  );
}

export default PassportProjectsPage;
