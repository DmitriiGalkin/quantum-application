import type { MeetExtendedDto } from '@shared/types';
import { useAuth } from '../../../../providers/AuthProvider.tsx';
import { Paper, Stack } from '@mui/material';

import MeetCardHeader from './MeetCardHeader.tsx';
import MeetCardBody from './MeetCardBody.tsx';
import StudentFooter from './StudentFooter';
import TeacherFooter from './TeacherFooter';
import PlaceFooter from './PlaceFooter';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchCreatePayment, fetchDeleteMeet, fetchDeleteMeetUser } from '../../../../requests.ts';

interface Props {
  meet: MeetExtendedDto;
  refetch?: () => void;
}

export default function MeetCard({ meet, refetch }: Props) {
  const { user, authHandler, passport, activeRole: role } = useAuth();

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationDeleteMeet = useMutation({
    mutationFn: fetchDeleteMeet,
    onSuccess: () => {
      refetch?.();
    },
  });

  const createPayment = useMutation({
    mutationFn: fetchCreatePayment,
    onSuccess: payment => {
      console.log('payment', payment);
      window.location.href = payment.paymentUrl;
      return;
    },
  });

  const onPay = () => {
    if (meet.price && meet.price > 0) {
      return createPayment.mutate({
        targetType: 'meet',
        targetId: meet.id,
      });
    } else {
      console.log('Ты как сюда попал');
    }
  };

  const onJoin = async () => {
    if (!user) {
      authHandler();
      return;
    }

    mutationLike.mutate({
      meetId: meet.id,
      userId: user.id,
    });
  };

  const onEdit = () => console.log('edit meet');

  const onExit = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  const onDelete = async () => {
    mutationDeleteMeet.mutate(meet.id);
  };

  const paymentStatus = meet.isPaid ? 'paid' : (meet.price && meet.price > 0) ? 'pending' : undefined;
  const meetUserStatus = user?.id && meet.users.map(u => u.id).includes(user.id) ? 'member' : 'not_member';
  const isMember = meetUserStatus === 'member';
  const isPending = paymentStatus === 'pending';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: '0.2s',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        opacity: Boolean(meet.deletedAt) ? 0.5 : 1,
      }}
    >
      <Stack spacing={2}>
        <MeetCardHeader dto={meet} />

        <MeetCardBody meet={meet} />

        {role === 'user' && (
          <StudentFooter
            meet={meet}
            onPay={isMember && isPending ? onPay : undefined}
            onJoin={!isMember ? onJoin : undefined}
            onExit={isMember && isPending ? onExit : undefined}
          />
        )}
        {role === 'teacher' && passport?.id === meet.passport.id && <TeacherFooter onEdit={onEdit} onDelete={onDelete} />}
        {role === 'place' && <PlaceFooter meet={meet} onEdit={onEdit} />}
      </Stack>
    </Paper>
  );
}

