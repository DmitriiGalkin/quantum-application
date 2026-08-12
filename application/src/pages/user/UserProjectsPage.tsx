import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProjects } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Projects from '../../features/project/ui/Projects.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';

function UserProjectsPage() {
  const { activeContext } = useAuth();
  const filter = useFilters();

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    refetch,
  } = useQuery({
    queryKey: ['projects', activeContext?.userId],
    queryFn: fetchUserProjects,
  });

  return (
    <Box component="section">
      {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

      {!isProjectsLoading && !isProjectsError && Boolean(projects.length) && (
        <Projects title="Мои проекты" filter={filter} projects={projects} refetch={refetch} withoutIdea />
      )}
    </Box>
  );
}

export default UserProjectsPage;
