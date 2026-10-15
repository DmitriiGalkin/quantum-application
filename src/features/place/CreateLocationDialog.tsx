import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../components/ClosableDialogTitle.tsx';
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
      <ClosableDialogTitle onClose={onClose}>Добавьте кабинет</ClosableDialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error">{error.message}</Alert>}
        <LocationForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Добавьте кабинет" />
      </DialogContent>
    </Dialog>
  );
}
