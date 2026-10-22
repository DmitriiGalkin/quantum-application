import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import FamilyAccess from '../../features/user/FamilyAccess.tsx';
//import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProjects } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import Projects from '../../features/project/ui/Projects.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';

function UserProjectsPage() {
  const { userId, role } = useAuth();
  const filter = useFilters({ projects: true, compactViews: true, allowWhen: false, allowNearby: false });

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    refetch,
  } = useQuery({
    queryKey: ['projects', 'user', userId],
    queryFn: fetchUserProjects,
    enabled: role === 'user' && Boolean(userId),
  });

  return (
    <FamilyAccess><Box component="section">
      {isProjectsLoading && <Typography role="status">Загрузка проектов…</Typography>}
      {isProjectsError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить проекты.</Alert>}

      {!isProjectsLoading && !isProjectsError && (
        <Projects title="Мои проекты" filter={filter} projects={projects} refetch={refetch} withoutIdea cardVariant="catalog" emptyText="У ребёнка пока нет проектов." />
      )}
      <Button component={Link} to="/" sx={{ mt: 2 }}>Выбрать проект</Button>
    </Box></FamilyAccess>
  );
}

export default UserProjectsPage;
