import Box from '@mui/material/Box';
import { type IdeaExtendedDto} from '@shared/types';
import IdeaCard from './IdeaCard.tsx'; // Добавлен импорт

type Props = {
  ideas: IdeaExtendedDto[];
};

function IdeaGrids({ ideas }: Props) {
  return (
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
  );
}

export default IdeaGrids;
