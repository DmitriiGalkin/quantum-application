import MeetForm from '../../areas/teacher/meet/MeetForm.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeet } from '../../requests.ts';

export default function MeetCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const projectId = Number(id);

  const createMeet = useMutation({
    mutationFn: fetchCreateMeet,
    onSuccess: () => navigate(`/project/${projectId}`),
  });

  return <MeetForm projectId={projectId} loading={createMeet.isPending} onSubmit={data => createMeet.mutate(data)} />;
}
