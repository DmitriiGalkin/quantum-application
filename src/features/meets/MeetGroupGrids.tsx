import { type MeetDto } from 'entities';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MeetGrids from './MeetGrids.tsx'; // Добавлен импорт
import type { MeetManagement } from './management.ts';

type Props = {
  meets: MeetDto[];
  title?: string;
  refetch?: () => void;
  management?: MeetManagement;
};

function MeetGroupGrids({ meets, title, refetch, management }: Props) {
  return (
    <Stack key={title} spacing={1}>
      {title && <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>}

      <MeetGrids meets={meets} refetch={refetch} management={management} />
    </Stack>
  );
}

export default MeetGroupGrids;
