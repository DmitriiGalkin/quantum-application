import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ProjectCard from '../components/ProjectCard.tsx';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchPassportProjects } from '../requests.ts';
import CreateProjectBlock from '../components/CreateProjectBlock.tsx';
import Page from '../components/Page.tsx';
import { groupProjectsByIdea } from '../utils/helper.ts';

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
    <Page>
      <Box component="section">
        {isProjectsLoading && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
            }}
          >
            <CircularProgress size={24} />
            <Typography>Загрузка проектов...</Typography>
          </Stack>
        )}

        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

        {!isProjectsLoading && !isProjectsError && Boolean(groupes.length) && (
          <Box>
            {groupes.map(({ idea, projects }) => (
              <Stack key={idea.id}>
                <Typography>{idea.title}</Typography>
                <Typography>{idea.description}</Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                    },
                    gap: 3,
                  }}
                >
                  {projects.map(project => (
                    <ProjectCard project={project} key={project.id} withoutPassport />
                  ))}
                </Box>
              </Stack>
            ))}
          </Box>
        )}

        {!isProjectsLoading && !isProjectsError && !projects.length && <CreateProjectBlock />}
      </Box>
    </Page>
  );
}

export default PassportProjectsPage;
//
//
// sm: 'repeat(2, minmax(0, 1fr))',
//   md: 'repeat(3, minmax(0, 1fr))',