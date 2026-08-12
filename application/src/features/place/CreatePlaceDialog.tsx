import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import PlaceForm from './PlaceForm.tsx';
import { useCreatePlace } from './hooks/useCreatePlace.ts';

export function CreatePlaceDialog({ open, onClose }: Props) {
  const { form, setForm, onSubmit, loading } = useCreatePlace();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать учебный центр</DialogTitle>

      <DialogContent>
        <PlaceForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Создать центр" />
      </DialogContent>
    </Dialog>
  );
}
