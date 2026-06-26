import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import MeetForm, { type MeetFormValues } from '../areas/teacher/meet/MeetForm.tsx';
import { fetchMeet, fetchUpdateMeet } from '../requests.ts';

export default function EditMeetPage() {
  const navigate = useNavigate();

  const { id, meetId } = useParams();

  const projectId = Number(id);

  const meetQuery = useQuery({
    queryKey: ['meet', meetId],
    queryFn: () => fetchMeet(Number(meetId)),
    enabled: !!meetId,
  });

  const updateMeet = useMutation({
    mutationFn: (data: MeetFormValues & { projectId: number }) => fetchUpdateMeet(Number(meetId), data),

    onSuccess: () => {
      navigate(`/project/${projectId}`);
    },
  });

  if (meetQuery.isPending) {
    return <CircularProgress />;
  }

  if (meetQuery.isError || !meetQuery.data) {
    return <Alert severity="error">Встреча не найдена</Alert>;
  }

  return (
    <MeetForm
      projectId={projectId}
      loading={updateMeet.isPending}
      initialValues={{
        startedAt: meetQuery.data.startedAt,
        duration: meetQuery.data.duration || 0,
        price: meetQuery.data.price || 0,
      }}
      onSubmit={updateMeet.mutate}
    />
  );
}
