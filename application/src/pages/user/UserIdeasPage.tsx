import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserIdeas } from '../../requests.ts';
import IdeaCard from '../../features/idea/ui/IdeaCard.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { CreateIdeaDialog } from '../../features/idea/ui/CreateIdeaDialog.tsx';

function IdeasPage() {
  const { activeUser } = useAuth();
  const id = activeUser?.id;
  const userId = id ? Number(id) : undefined;
  const [openCreateIdea, setOpenCreateIdea] = useState(false);

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideas', userId],
    queryFn: () => fetchUserIdeas(userId!),
  });

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Идеи ученика</Typography>
        <Button variant="contained" onClick={() => setOpenCreateIdea(true)}>
          Создать идею
        </Button>

        <CreateIdeaDialog open={openCreateIdea} onClose={() => setOpenCreateIdea(false)} />
      </Stack>

      {isIdeasError && <Alert severity="error">Не удалось загрузить идеи.</Alert>}

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
    </Stack>
  );
}

export default IdeasPage;
