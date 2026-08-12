import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { useCreateProject } from "../hooks/useCreateProject";
import ProjectForm from './ProjectForm.tsx';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ open, onClose }: any) {
  const { form, setForm, onSubmit, loading } = useCreateProject();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Создать проект</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <ProjectForm
          values={form}
          onChange={setForm}
          onSubmit={onSubmit}
          loading={loading}
          submitLabel="Создать проект"
        />
      </DialogContent>
    </Dialog>
  );
}