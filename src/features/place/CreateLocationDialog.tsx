import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import LocationForm from './LocationForm.tsx';
import { useCreateLocation } from './hooks/useCreateLocation.ts';
import Alert from '@mui/material/Alert';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateLocationDialog({ open, onClose }: Props) {
  const { form, setForm, onSubmit, loading, error } = useCreateLocation(onClose);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Добавьте кабинет</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error">{error.message}</Alert>}
        <LocationForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Добавьте кабинет" />
      </DialogContent>
    </Dialog>
  );
}
