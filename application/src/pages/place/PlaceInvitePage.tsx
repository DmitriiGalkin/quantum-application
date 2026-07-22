import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material';
import { fetchAddTeacher2, fetchPlace } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';

export default function PlaceInvitePage() {
  const { id } = useParams();
  const placeId = Number(id);
  const {passport} = useAuth()
  const navigate = useNavigate();


  const { data: place, refetch } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => fetchPlace(placeId),
  });

  const addTeacher = useMutation({
    mutationFn: () => fetchAddTeacher2({passportId: Number(passport?.id), placeId }),
    onSuccess: () => {
      console.log('teacher added');
      navigate(`/place/${placeId}/teachers`);
    },
  });

  return (
    <Box>
      <Card>
        <CardHeader title={place?.title} subheader="Приглашает вас стать преподавателем" />

        <CardContent>
          <Typography>После подтверждения вы получите доступ к управлению проектами, встречами и учениками этого центра.</Typography>
        </CardContent>

        <CardActions>
          <Button variant="contained" onClick={()=>addTeacher.mutate()}>
            Подтвердить
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}
