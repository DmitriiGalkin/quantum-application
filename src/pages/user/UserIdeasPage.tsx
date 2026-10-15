import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
//import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserIdeas } from '../../requests.ts';
import IdeaCard from '../../features/idea/ui/IdeaCard.tsx';
import { useAuth } from '../../providers/auth-context.ts';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { CreateIdeaDialog } from '../../features/idea/ui/CreateIdeaDialog.tsx';
import Title from 'components/Title.tsx';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import FamilyAccess from '../../features/user/FamilyAccess.tsx';

function IdeasPage() {
  const { userId, role } = useAuth();
  const [openCreateIdea, setOpenCreateIdea] = useState(false);

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
    refetch,
  } = useQuery({
    queryKey: ['ideas', userId],
    queryFn: fetchUserIdeas,
    enabled: role === 'user' && Boolean(userId),
  });

  return (
    <FamilyAccess><Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Title text="Идеи ученика" />
        <Button variant="contained" onClick={() => setOpenCreateIdea(true)}>
          Создать идею
        </Button>

        <CreateIdeaDialog open={openCreateIdea} onClose={() => setOpenCreateIdea(false)} />
      </Stack>

      {isIdeasLoading && <Typography role="status">Загрузка идей…</Typography>}
      {isIdeasError && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить идеи.</Alert>}
      {!isIdeasLoading && !isIdeasError && !ideas.length && <Typography>Сохранённых идей пока нет. Создайте свою идею или посмотрите библиотеку.</Typography>}
      <Button component={Link} to="/ideas" sx={{ alignSelf: 'flex-start' }}>Библиотека идей</Button>

      {!isIdeasLoading && !isIdeasError && (
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
          {ideas.map(idea => (
            <IdeaCard idea={idea} key={idea.id} />
          ))}
        </Box>
      )}
    </Stack></FamilyAccess>
  );
}

export default IdeasPage;
