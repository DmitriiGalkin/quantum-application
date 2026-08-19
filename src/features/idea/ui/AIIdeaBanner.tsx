import AIBanner from 'components/AiBanner.tsx';
import { useNavigate } from 'react-router-dom';

export default function AIIdeaBanner() {
  const navigate = useNavigate();

  return (
    <AIBanner
      title="Создайте идею проекта вашего ребенка за пару минут"
      description="ИИ создаст идею под интересы вашего ребенка и желаемый вами формат обучения — быстро, точно и без лишнего поиска."
      buttonText="Создать идею"
      onClick={() => navigate('/chat?target=idea')}
    />
  );
}
