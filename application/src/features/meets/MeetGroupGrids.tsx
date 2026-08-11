import { type MeetExtendedDto } from '@shared/types';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import MeetGrids from './MeetGrids.tsx'; // Добавлен импорт

type Props = {
  meets: MeetExtendedDto[];
  title?: string;
  refetch?: any;
};

function MeetGroupGrids({ meets, title, refetch }: Props) {
  return (
    <Stack key={title} spacing={1}>
      {title && <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>}

      <MeetGrids meets={meets} refetch={refetch} />
    </Stack>
  );
}

export default MeetGroupGrids;
