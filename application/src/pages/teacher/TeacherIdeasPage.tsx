import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherIdeas } from '../../requests.ts';
import IdeaCard from '../../features/idea/ui/IdeaCard.tsx';
import { useState } from 'react';
import { CreateIdeaDialog } from '../../features/idea/ui/CreateIdeaDialog.tsx';

export default function TeacherIdeasPage() {
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['teacher-ideas'],
    queryFn: fetchTeacherIdeas,
  });

  const [openCreateIdea, setOpenCreateIdea] = useState(false);

  if (isLoading) {
    return <>Загрузка...</>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Мои идеи проектов</Typography>
        <Button variant="contained" onClick={() => setOpenCreateIdea(true)}>
          Создать идею
        </Button>

        <CreateIdeaDialog open={openCreateIdea} onClose={() => setOpenCreateIdea(false)} />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </Box>
    </Stack>
  );
}
