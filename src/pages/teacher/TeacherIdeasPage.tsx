import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useQuery } from '@tanstack/react-query';
import { fetchTeacherIdeas } from '../../requests.ts';
import IdeaCard from '../../features/idea/ui/IdeaCard.tsx';
import { useState } from 'react';
import { CreateIdeaDialog } from '../../features/idea/ui/CreateIdeaDialog.tsx';
import Title from 'components/Title.tsx';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

export default function TeacherIdeasPage() {
  const { data: allIdeas = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['teacher-ideas'],
    queryFn: fetchTeacherIdeas,
  });
  const ideas = allIdeas.filter(idea => !idea.user);

  const [openCreateIdea, setOpenCreateIdea] = useState(false);

  if (isLoading) {
    return <Typography role="status">Загрузка идей…</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Title text="Мои идеи проектов" />
        <Button variant="contained" onClick={() => setOpenCreateIdea(true)}>
          Создать идею
        </Button>

        <CreateIdeaDialog open={openCreateIdea} onClose={() => setOpenCreateIdea(false)} />
      </Stack>
      {isError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить идеи.</Alert>}
      {!isError && !ideas.length && <Typography>Собственных идей пока нет. Создайте идею или выберите основу в библиотеке.</Typography>}

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
