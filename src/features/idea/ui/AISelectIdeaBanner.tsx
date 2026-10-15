import AIBanner from 'components/AiBanner.tsx';
import { useNavigate } from 'react-router-dom';

export default function AISelectIdeaBanner() {
  const navigate = useNavigate();

  return (
    <AIBanner
      title="Выберите идею для проекта"
      description="Посмотрите библиотеку идей и найдите основу для следующего проекта."
      buttonText="Открыть библиотеку"
      onClick={() => navigate('/ideas')}
    />
  );
}
