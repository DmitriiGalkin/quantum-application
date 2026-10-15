import Dialog from '@mui/material/Dialog';
import ClosableDialogTitle from '../../../components/ClosableDialogTitle.tsx';
import DialogContent from '@mui/material/DialogContent';
import type { IdeaDto } from '../../../entities/idea.ts';
import { ideaGallery } from '../../../shared/lib/idea-photos.ts';
import { useIdeaEditor } from '../hooks/useIdeaEditor.ts';
import IdeaForm from './IdeaForm.tsx';

export default function EditIdeaDialog({ idea, onClose }: { idea: IdeaDto; onClose: () => void }) {
  const editor = useIdeaEditor({ title: idea.title, description: idea.description,
    photos: ideaGallery(idea).map(photo => ({ photo })) }, onClose, idea.id);
  return <Dialog open onClose={editor.loading ? undefined : onClose} fullWidth maxWidth="md">
    <ClosableDialogTitle onClose={onClose} disabled={editor.loading}>Редактировать идею</ClosableDialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <IdeaForm values={editor.form} onChange={editor.setForm} onSubmit={editor.onSubmit} loading={editor.loading} error={editor.error} />
    </DialogContent>
  </Dialog>;
}
