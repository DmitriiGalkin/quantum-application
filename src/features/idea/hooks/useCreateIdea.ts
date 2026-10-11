import { useNavigate } from 'react-router-dom';
import { useIdeaEditor } from './useIdeaEditor.ts';

export function useCreateIdea() {
  const navigate = useNavigate();
  return useIdeaEditor({ title: '', description: '', photos: [] }, id => navigate(`/idea/${id}`));
}
