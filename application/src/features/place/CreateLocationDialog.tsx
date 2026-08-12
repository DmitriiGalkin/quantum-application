import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import LocationForm from './LocationForm.tsx';
import { useCreateLocation } from './hooks/useCreateLocation.ts';

export function CreateLocationDialog({ open, onClose }: any) {
  const { form, setForm, onSubmit, loading } = useCreateLocation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Добавьте кабинет</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <LocationForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Добавьте кабинет" />
      </DialogContent>
    </Dialog>
  );
}