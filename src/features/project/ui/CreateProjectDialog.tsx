import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import { useCreateProject } from '../hooks/useCreateProject';
import ProjectForm from './ProjectForm.tsx';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ open, onClose }: Props) {
  const { form, setForm, onSubmit, loading, error } = useCreateProject();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ClosableDialogTitle onClose={onClose}>Создать проект</ClosableDialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <ProjectForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} error={error} submitLabel="Создать проект" />
      </DialogContent>
    </Dialog>
  );
}
