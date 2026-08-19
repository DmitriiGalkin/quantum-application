import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchPassportProjects } from '../../requests.ts';
import CreateProjectBlock from '../../shared/ui/CreateProjectBlock.tsx';
import Button from '@mui/material/Button';
import AISelectIdeaBanner from '../../features/idea/ui/AISelectIdeaBanner.tsx';
import { CreateProjectDialog } from '../../features/project/ui/CreateProjectDialog.tsx';
import { useState } from 'react';
import Projects from '../../features/project/ui/Projects.tsx';
import { useFilters } from '../../features/idea/hooks/useFilters.ts';

function TeacherProjectsPage() {
  const filter = useFilters();
  const { id } = useParams();
  const userId = id ? Number(id) : undefined;
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);

  const {
    data: projects = [],
    isError: isProjectsError,
      refetch,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchPassportProjects(),
  });


  return (
    <Box component="section">
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="contained" onClick={() => setIsCreateProjectDialogOpen(true)}>
          Создать проект
        </Button>

        <CreateProjectDialog open={isCreateProjectDialogOpen} onClose={() => setIsCreateProjectDialogOpen(false)} />
      </Stack>

      {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}
      <AISelectIdeaBanner />
      {!projects.length && <CreateProjectBlock />}

      <Projects title="Мои проекты" filter={filter} projects={projects} refetch={refetch} withoutIdea />
    </Box>
  );
}

export default TeacherProjectsPage;
