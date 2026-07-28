import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import '../../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserIdeas } from '../../requests.ts';
import IdeaCard from '../../features/idea/ui/IdeaCard.tsx';
import { useAuth } from '../../providers/AuthProvider.tsx';

function IdeasPage() {
  const { activeUser } = useAuth();
  const id = activeUser?.id;
  const userId = id ? Number(id) : undefined;

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideas', userId],
    queryFn: () => fetchUserIdeas(userId!),
  });

  return (
    <Box component="section">
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
    </Box>
  );
}

export default IdeasPage;
