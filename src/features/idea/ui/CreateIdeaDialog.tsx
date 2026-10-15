import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import IdeaForm from './IdeaForm.tsx';
import { useCreateIdea } from '../hooks/useCreateIdea.ts';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateIdeaDialog({ open, onClose }: Props) {
    const { form, setForm, onSubmit, loading, error } = useCreateIdea();

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <ClosableDialogTitle onClose={onClose} disabled={loading}>Создать идею</ClosableDialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <IdeaForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} error={error} submitLabel="Создать идею" />
      </DialogContent>
    </Dialog>
  );
}
