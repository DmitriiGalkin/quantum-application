import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchPassportProjects } from '../../requests.ts';
import CreateProjectBlock from '../../shared/ui/CreateProjectBlock.tsx';
import Page from '../../shared/ui/Page.tsx';
import { groupProjectsByIdea } from '../../utils/helper.ts';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import TeacherIdeaProjectCard from './idea/TeacherIdeaProjectCard.tsx';
import AISelectIdeaBanner from '../../features/idea/ui/AISelectIdeaBanner.tsx';
import type { IdeaDto, ProjectFullDto } from '@shared/types';

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
  const projectsWithIdeas = projects.filter((project): project is ProjectFullDto & { idea: IdeaDto } => project.idea !== null);
  const groupes = groupProjectsByIdea(projectsWithIdeas);

  return (
    <Page isLoading={isProjectsLoading}>
      <Box component="section">
        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}
        <AISelectIdeaBanner />
        {!projects.length && <CreateProjectBlock />}

        {Boolean(groupes.length) && (
          <Stack spacing={2}>
            {groupes.map(({ idea, projects }) => {
              if (!idea) return null

              return (
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

                    <CardContent>
                      <Stack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {idea.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }} gutterBottom>
                            {idea.description}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
                          {projects.length === 0 ? (
                            <Button variant="contained" size="small">
                              Создать проект
                            </Button>
                          ) : (
                            <Button variant="outlined" size="small">
                              + Проект
                            </Button>
                          )}

                          <Button size="small" href={`/idea/${idea.id}`}>
                            Подробнее
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Box>

                  {/* PROJECTS */}
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: 'repeat(2, minmax(0, 1fr))',
                          md: 'repeat(3, minmax(0, 1fr))',
                          lg: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: 1,
                      }}
                    >
                      {projects.map(project => (
                        <TeacherIdeaProjectCard key={project.id} project={project} />
                      ))}
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Page>
  );
}

export default PassportProjectsPage;
