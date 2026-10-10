import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

interface Props {
  onSubmit: (data: CreateUser) => void;
}

export interface CreateUser {
  title: string;
}

export function CreateUserForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
    });
  };

  return (
    <Stack spacing={2}>
      <TextField label="Имя" value={title} onChange={e => setTitle(e.target.value)} />

      <Button variant="contained" onClick={handleSubmit} disabled={!title.trim()}>
        Создать
      </Button>
    </Stack>
  );
}
