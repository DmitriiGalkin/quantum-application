import Project from '../models/project.js';
import User from '../models/user.js';

function isCreateCommand(message) {
  const normalizedMessage = message.trim().toLowerCase();

  return [
    'создать',
    'создать карточку ученика',
    'создать идею проекта',
    'создай идею проекта',
    'создать проект',
    'создай проект',
  ].includes(normalizedMessage);
}

export async function createSystemCreateMessage(metadata, passportId) {
  console.log(metadata, 'metadata');
  switch (metadata.target) {
    case 'idea': {
      await Project.create({ ...metadata.data, passportId });

      return 'Поздравляем! Ваша идея проекта создана и мы уже начали подбирать куратора. После того как куратор проекта будет назначен, он возмет на себя ответственность по оформлению проекта, выбору места и времени проведения встреч по проекту.';
    }

    case 'user': {
      await User.create({ ...metadata.data, passportId });

      return 'Карточка создана';
    }
  }
}

export function parseMetadata(metadata) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'object') {
    return metadata;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

export { isCreateCommand };
