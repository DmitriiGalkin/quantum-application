import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { TeacherDto } from '@shared/types';
import { Button, Stack } from '@mui/material';

type IdeaCardProps = {
  teacher: TeacherDto;
  onDelete?: () => void;
};

function TeacherCard({ teacher, onDelete }: IdeaCardProps) {
  return (
    <Card key={teacher.id}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography>{teacher.title}</Typography>

          {onDelete && (
            <Button color="error" onClick={onDelete}>
              Удалить
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default TeacherCard;
