import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
//import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchPassportProjects } from '../../requests.ts';
import CreateProjectBlock from 'components/CreateProjectBlock.tsx';
import Button from '@mui/material/Button';
import AISelectIdeaBanner from '../../features/idea/ui/AISelectIdeaBanner.tsx';
import { CreateProjectDialog } from '../../features/project/ui/CreateProjectDialog.tsx';
import { useState } from 'react';
import Projects from '../../features/project/ui/Projects.tsx';
import Typography from '@mui/material/Typography';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';

function TeacherProjectsPage() {
  const filter = useFilters({ projects: true });
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);

  const {
    data: projects = [],
    isError: isProjectsError,
    isPending,
      refetch,
  } = useQuery({
    queryKey: ['projects', 'passport'],
    queryFn: () => fetchPassportProjects(),
  });


  return (
    <Box component="section">
      <CreateProjectDialog open={isCreateProjectDialogOpen} onClose={() => setIsCreateProjectDialogOpen(false)} />

      {isPending && <Typography role="status">Загрузка проектов…</Typography>}
      {isProjectsError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить проекты.</Alert>}
      <AISelectIdeaBanner />
      {!isPending && !isProjectsError && <Projects title="Мои проекты" filter={filter} projects={projects} refetch={refetch} withoutIdea
        action={projects.length ? <Button variant="contained" sx={{ whiteSpace: 'nowrap' }} onClick={() => setIsCreateProjectDialogOpen(true)}>Создать проект</Button> : undefined}
        emptyContent={<CreateProjectBlock onCreate={() => setIsCreateProjectDialogOpen(true)} />} />}
    </Box>
  );
}

export default TeacherProjectsPage;
