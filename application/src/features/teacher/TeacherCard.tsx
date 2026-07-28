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

type IdeaCardProps = {
  placeId: number;
  teacher: TeacherDto;
  refetch?: () => void;
};

function TeacherCard({ placeId, teacher, refetch }: IdeaCardProps) {
  const { activeContext, activePlace, passport, places } = useAuth();
  const removeTeacher = useMutation({
    mutationFn: () => fetchRemoveTeacher(placeId, teacher.id),
    onSuccess: () => refetch?.(),
  });

  const leaveTeacher = useMutation({
    mutationFn: () => fetchLeavePlace(placeId),
    onSuccess: () => refetch?.(),
  });

  const onDelete = () => removeTeacher.mutate();
  const onLeave = () => leaveTeacher.mutate();


  const menuItems = [];

  if (places.map(place => place.id).includes(placeId) && activeContext.role === 'teacher' && teacher.id === passport?.id) {
    menuItems.push({
      key: 'leave',
      label: 'Выйти из центра',
      icon: <PersonRemoveIcon fontSize="small" />,
      onClick: onLeave,
    });
  }
  if (activePlace?.id === placeId && activeContext.role === 'place') {
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
          <Avatar alt={teacher.title} src={teacher.image || ''}>
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
      {/*<CardContent>*/}
      {/*  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>*/}
      {/*    <Typography>{teacher.title}</Typography>*/}

      {/*    {onDelete && (*/}
      {/*      <Button color="error" onClick={onDelete}>*/}
      {/*        Удалить*/}
      {/*      </Button>*/}
      {/*    )}*/}
      {/*  </Stack>*/}
      {/*</CardContent>*/}
    </Card>
  );
}

export default TeacherCard;
