import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ClosableDialogTitle from '../../components/ClosableDialogTitle.tsx';
import { useAuth } from '../../providers/auth-context.ts';
import { fetchCreateUser } from '../../requests.ts';

export default function SelectMeetChildDialog({ open, onClose, description = 'После выбора проверьте встречу и нажмите «Присоединиться».' }: { open: boolean; onClose: () => void; description?: string }) {
  const { passport, switchUser, refetch } = useAuth();
  const [title, setTitle] = useState('');
  const create = useMutation({
    mutationFn: () => fetchCreateUser({ title: title.trim(), description: '' }),
    onSuccess: async userId => {
      await refetch();
      switchUser(userId);
      setTitle('');
      onClose();
    },
  });
  return <Dialog open={open} onClose={create.isPending ? undefined : onClose} fullWidth maxWidth="sm">
    <ClosableDialogTitle onClose={onClose} disabled={create.isPending}>Выберите ребёнка</ClosableDialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <Typography>{description}</Typography>
      {passport?.users?.map(user => <Button key={user.id} variant="outlined" disabled={create.isPending}
        onClick={() => { switchUser(user.id); onClose(); }}>{user.title}</Button>)}
      <Typography variant="h6" component="h3">Добавить ребёнка</Typography>
      <TextField label="Имя ребёнка" value={title} disabled={create.isPending} onChange={event => setTitle(event.target.value)} />
      {create.isError && <Alert severity="error">{create.error.message}</Alert>}
      <Button variant="contained" disabled={create.isPending || !title.trim()} onClick={() => create.mutate()}>
        {create.isPending ? 'Добавление…' : 'Добавить и выбрать'}
      </Button>
    </Stack></DialogContent>
  </Dialog>;
}
