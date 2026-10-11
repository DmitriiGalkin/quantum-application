import Box from '@mui/material/Box';
import { type MeetDto } from 'entities';
import MeetCard from './MeetCard.tsx'; // Добавлен импорт
import type { MeetManagement } from './management.ts';

type Props = {
  meets: MeetDto[];
  withoutIdea?: boolean;
  refetch?: () => void;
  management?: MeetManagement;
};

function MeetGrids({ meets, refetch, management }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 1.5,
      }}
    >
      {meets?.map(meet => (
        <MeetCard key={meet.id} meet={meet} refetch={refetch} management={management} />
      ))}
    </Box>
  );
}

export default MeetGrids;
