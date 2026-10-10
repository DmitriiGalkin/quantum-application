import { detectImage } from 'gigachat';
import assistant from '../../../utils/assistant.js';
import type { Idea } from 'entities';

function buildProjectImagePrompt(project: Idea) {
  return [
    'Сгенерируй изображение 256px на 256px',
    'Сделай яркую, дружелюбную, современную иллюстрацию без текста на изображении.',
    'Изображение должно подходить для карточки проекта на сайте для родителей и детей.',
    `Идея проекта: ${project.title || 'Идея проекта'}`,
    `Описание проекта: ${project.description || ''}`,
  ].join('\n');
}

export async function generateIdeaImage(project: Idea) {
  try {
    const payload = {
      messages: [
        {
          role: 'user',
          content: buildProjectImagePrompt(project),
        },
      ],
      function_call: 'auto',
    };

    const imageResponse = await assistant.chat(payload);

    const detectedImage = detectImage(imageResponse.choices[0]?.message.content ?? '');

    if (detectedImage && detectedImage.uuid) {
      const image = await assistant.getImage(detectedImage.uuid);
      return image.content;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Ошибка при генерации картинки:', err);
    throw err;
  }
}
