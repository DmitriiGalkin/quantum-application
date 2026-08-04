import Box from '@mui/material/Box';
import { type MeetExtendedDto } from '@shared/types';
import MeetCard from './MeetCard.tsx'; // Добавлен импорт

type Props = {
  meets: MeetExtendedDto[];
  withoutIdea?: boolean;
  refetch?: any;
};

function MeetGrids({ meets, refetch }: Props) {
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
        <MeetCard key={meet.id} meet={meet} refetch={refetch} />
      ))}
    </Box>
  );
}

export default MeetGrids;
