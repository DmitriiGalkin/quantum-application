import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IdeaForm from "./IdeaForm.tsx";
import {useCreateIdea} from "../hooks/useCreateIdea.ts";

export function CreateIdeaDialog({ open, onClose }: any) {
    const { form, setForm, onSubmit, loading } = useCreateIdea();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Создать идею</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <IdeaForm values={form} onChange={setForm} onSubmit={onSubmit} loading={loading} submitLabel="Создать идею" />
      </DialogContent>
    </Dialog>
  );
}
