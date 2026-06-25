import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProjects } from '../../requests.ts';
import Page from '../../shared/ui/Page.tsx';
import Project from '../../features/project/ui/Project.tsx';

function UserProjectsPage() {
  const { id } = useParams();
  const userId = id ? Number(id) : undefined;

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    refetch,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchUserProjects(userId!),
  });

  return (
    <Page isLoading={isProjectsLoading}>
      <Box component="section">
        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

        {!isProjectsLoading && !isProjectsError && Boolean(projects.length) && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {projects.map(project => (
              <Project project={project} refetch={refetch} />
            ))}
          </Box>
        )}
      </Box>
    </Page>
  );
}

export default UserProjectsPage;
