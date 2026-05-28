export const convertToProjectObject = (jsonString) => {
  if (typeof jsonString !== 'string') {
    console.error('Ошибка: на вход должна быть передана строка.');
    return null;
  }

  let cleanString = jsonString.trim();

  // Убираем внешние кавычки, если они есть
  if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
    cleanString = cleanString.slice(1, -1).trim();
    //console.log(cleanString, 'cleanString');
  }

  cleanString = cleanString.replace(/\n/g, '');
  cleanString = cleanString.replace(/`/g, '');


  //console.log(cleanString, 'cleanString');

  try {
    const data = JSON.parse(cleanString);

    // Проверяем, что структура объекта соответствует ожидаемому типу
    if (
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      Array.isArray(data.steps) &&
      data.steps.every(step => typeof step === 'string')
    ) {
      return {
        title: data.title,
        description: data.description,
        steps: data.steps,
      };
    } else {
      console.error('Ошибка: структура JSON не соответствует ожидаемому формату.');
      return null;
    }
  } catch (error) {
    console.error('Ошибка парсинга JSON:', error.message);
    return null;
  }
}

export const convertToUserObject = jsonString => {
  if (typeof jsonString !== 'string') {
    console.error('Ошибка: на вход должна быть передана строка.');
    return null;
  }

  let cleanString = jsonString.trim();

  // Убираем внешние кавычки, если они есть
  if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
    cleanString = cleanString.slice(1, -1).trim();
  }

  cleanString = cleanString.replace(/\n/g, '');
  cleanString = cleanString.replace(/`/g, '');


  try {
    const data = JSON.parse(cleanString);

    // Проверяем, что структура объекта соответствует ожидаемому типу
    if (
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      typeof data.age === 'string'
    ) {
      return {
        title: data.title,
        description: data.description,
        age: Number(data.age),
      };
    } else {
      console.error('Ошибка: структура JSON не соответствует ожидаемому формату.');
      return null;
    }
  } catch (error) {
    console.error('Ошибка парсинга JSON:', error.message);
    return null;
  }
};


export const convertToTeacherObject = jsonString => {
  if (typeof jsonString !== 'string') {
    console.error('Ошибка: на вход должна быть передана строка.');
    return null;
  }

  let cleanString = jsonString.trim();

  // Убираем внешние кавычки, если они есть
  if (cleanString.startsWith('"') && cleanString.endsWith('"')) {
    cleanString = cleanString.slice(1, -1).trim();
  }

  cleanString = cleanString.replace(/\n/g, '');
  cleanString = cleanString.replace(/`/g, '');


  try {
    const data = JSON.parse(cleanString);

    // Проверяем, что структура объекта соответствует ожидаемому типу
    if (
        typeof data.profession  === 'string' &&
        typeof data.interests === 'string' &&
        typeof data.experience === 'string'
    ) {
      return {
        description: 'Профессия:' + data.profession + ', Интересы:' + data.interests + ', Опыт работы с детьми: '  + data.experience,
      };
    } else {
      console.error('Ошибка: структура JSON не соответствует ожидаемому формату.');
      return null;
    }
  } catch (error) {
    console.error('Ошибка парсинга JSON:', error.message);
    return null;
  }
};

