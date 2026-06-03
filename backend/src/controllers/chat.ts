import Chat from '../models/chat.js';
import Message from '../models/message.js';
import {
  normalizeMessage,
  createAssistantMessage,
  selectAssistant,
  getMetaMessages,
} from '../services/chatService.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';
import { Chat as IChat, type ChatMessage } from '../../../application/src/requests';

export default {
  /**
   * Создание нового чата
   */
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      const chatId = await Chat.create({ target: (req.body as any)?.target } as unknown as IChat);

      // Инициализация метаданных и выбор ассистента
      const meta = {};
      const assistant = selectAssistant((req.body as any)?.target, meta);
      const assistantContent = await assistant({
        messages: [],
        meta,
      });

      await createAssistantMessage({
        chatId,
        ...assistantContent,
      });

      return res.json(chatId);
    } catch (err) {
      console.error('chat.create error:', err);
      res.status(500).json({
        error: true,
        message: 'Не удалось создать новый чат',
      });
    }
  },

  createMessage: async (req: RequestWithPassport, res: Response) => {
    try {
      const messageText = String((req.body as any)?.message || '').trim();
      if (!messageText) {
        return res.status(400).json({
          error: true,
          message: 'Сообщение не может быть пустым',
        });
      }

      const chatId = (req.body as any)?.chatId;
      if (!chatId) {
        return res.status(400).json({ error: true, message: 'ID чата обязателен' });
      }

      // Проверяем существование чата
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: true, message: 'Чат не найден' });
      }

      // Получаем последние сообщения для контекста
      const allMessages = await Message.findLastByChatId(chat.id, 100); // Уменьшаем лимит до 100 для производительности
      const lastUserMessage = allMessages[allMessages.length - 1];

      // Сохраняем сообщение пользователя
      const userMessageId = await Message.create({
        chatId: chat.id,
        content: messageText,
        role: 'user',
        target: lastUserMessage?.target, // Используем цель из последнего сообщения, если есть
      } as ChatMessage);

      // Подготовка мета-данных
      const meta = {...getMetaMessages(allMessages), teacher: {
          description: "Профессия: учитель начальных классов, Интересы: чтение классики, интеллектуальные игры, руководство детскими клубами, Опыт работы с детьми: 10 часов в день, полная занятость в школе"
        } };
      meta.passport = req.passport; // Добавляем данные о пользователе

      // Выбор ассистента на основе цели чата
      const assistant = selectAssistant(chat.target, meta);

      // Генерация ответа от ассистента
      let assistantContent = await assistant({
        messages: [...allMessages, { id: userMessageId, content: messageText, role: 'user' }],
        meta,
      });

      // Логика рекурсивного вызова ассистента при наличии новой меты
      if (assistantContent.meta) {
        // Обновляем пользовательское сообщение метаданными
        await Message.update(userMessageId, { metadata: assistantContent.meta });

        // Формируем новую мету
        const newMeta = {...meta, [assistantContent.meta.target]: assistantContent.meta.data};

        // Повторный вызов ассистента с обновленной метой
        const updatedAssistant = selectAssistant(chat.target, newMeta);
        assistantContent = await updatedAssistant({
          messages: [...allMessages, { id: userMessageId, content: messageText, role: 'user' }],
          meta: newMeta,
        });
      }

      // Сохраняем ответ ассистента
      const assistantMessage = await createAssistantMessage({
        chatId: chat.id,
        ...assistantContent,
      });

      // Обновляем время последнего изменения чата
      await Chat.touch(chat.id);

      res.json({
        chatId: chat.id,
        message: normalizeMessage(assistantMessage),
        meta,
      });
    } catch (err) {
      console.error('chat.createMessage error:', err);
      res.status( 500).json({
        error: true,
        message: 'Не удалось отправить сообщение',
      });
    }
  },

  /**
   * Получение истории сообщений чата
   */
  findMessages: async (req: RequestWithPassport, res: Response) => {
    try {
      const chat = await Chat.findById(req.params.id);

      if (!chat) {
        return res
          .status(404)
          .json({ error: true, message: 'Чат не найден или у вас нет доступа' });
      }

      const messages = await Message.findByChatId(chat.id);
      const meta = getMetaMessages(messages);

      res.json({
        ...chat,
        messages: messages.map(normalizeMessage),
        meta,
      });
    } catch (err) {
      console.error('chat.findMessages error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить сообщения' });
    }
  },

  /**
   * Получение списка всех чатов текущего пользователя
   */
  findAll: async (req: RequestWithPassport, res: Response) => {
    try {
      if (!req.passport) {
        return res.status(401).json({
          error: true,
          message: 'Требуется авторизация',
        });
      }

      const chats = await Chat.findAllByPassportId(req.passport.id || 0);

      res.json(chats);
    } catch (err) {
      console.error('chat.findAll error:', err);
      res.status(500).json({
        error: true,
        message: 'Не удалось получить список чатов',
      });
    }
  },
};