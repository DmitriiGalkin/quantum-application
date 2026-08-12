import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { TeacherDto } from '@shared/types';
import { Avatar, CardHeader, Stack } from '@mui/material';
import MenuButton from '../../components/MenuButton';
import PlaceIcon from '@mui/icons-material/Place';
import { useAuth } from '../../providers/AuthProvider.tsx';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { fetchLeavePlace, fetchRemoveTeacher } from '../../requests.ts';
import { useMutation } from '@tanstack/react-query';
import { getImage } from '../../utils/helper.ts';

type IdeaCardProps = {
  placeIdIn: number;
  teacher: TeacherDto;
  refetch?: () => void;
};

function TeacherCard({ placeIdIn, teacher, refetch }: IdeaCardProps) {
  const { role, placeId,  passport, places } = useAuth();
  const removeTeacher = useMutation({
    mutationFn: () => fetchRemoveTeacher(placeIdIn, teacher.id),
    onSuccess: () => refetch?.(),
  });

  const leaveTeacher = useMutation({
    mutationFn: () => fetchLeavePlace(placeIdIn),
    onSuccess: () => refetch?.(),
  });

  const onDelete = () => removeTeacher.mutate();
  const onLeave = () => leaveTeacher.mutate();


  const menuItems = [];

  if (places.map(place => place.id).includes(placeIdIn) && role === 'teacher' && teacher.id === passport?.id) {
    menuItems.push({
      key: 'leave',
      label: 'Выйти из центра',
      icon: <PersonRemoveIcon fontSize="small" />,
      onClick: onLeave,
    });
  }
  if (placeId === placeIdIn && role === 'place') {
    menuItems.push({
      key: 'delete',
      label: 'Удалить из центра',
      icon: <PersonRemoveIcon fontSize="small" />,
      onClick: onDelete,
    });
  }



  return (
    <Card key={teacher.id}>
      <CardHeader
        avatar={
          <Avatar alt={teacher.title} src={getImage(teacher.id) || teacher.image || ''}>
            R
          </Avatar>
        }
        action={<MenuButton menuItems={menuItems} />}
        title={teacher.title}
        subheader={
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <PlaceIcon sx={{ fontSize: 12, opacity: 0.6, flexShrink: 0 }} />

            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Математика и физика
            </Typography>
          </Stack>
        }
        sx={{
          backgroundColor: teacher.id === passport?.id ? 'rgba(255,160,40,.1)' : '#F8F9FB',
          boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)',

          // Самое важное
          '& .MuiCardHeader-content': {
            minWidth: 0,
          },

          '& .MuiCardHeader-action': {
            flexShrink: 0,
          },
        }}
      />
    </Card>
  );
}

export default TeacherCard;
