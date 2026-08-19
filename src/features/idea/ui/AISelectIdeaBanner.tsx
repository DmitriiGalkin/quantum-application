import AIBanner from '../../../shared/ui/AiBanner.tsx';
import { useNavigate } from 'react-router-dom';

export default function AISelectIdeaBanner() {
  const navigate = useNavigate();

  return (
    <AIBanner
      title="Найдите идею для проекта за пару минут"
      description="ИИ подберёт идею под ваши интересы и формат обучения — быстро, точно и без лишнего поиска."
      buttonText="Подобрать идею"
      onClick={() => navigate('/ideas/select')}
    />
  );
}
