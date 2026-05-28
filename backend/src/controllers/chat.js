import Chat from '../models/chat.js';
import ChatMessage from '../models/chatMessage.js';
import {
  normalizeMessage,
  createAssistantMessage, getObjectFromMetadata, selectAssistant, getMetaMessages,
} from '../services/chatService.js';

import { generateProjectImage } from '../assistants/imageAssistant.js';
import { uploadImage } from '../assistants/imageAssistant.js';

export default {
  create: async (req, res) => {
    try {
      const chatId = await Chat.create({ target: req.body.workflow });
      const meta = { user: {
          title: "Катя",
          description: "Увлечена рисованием хомяков",
          age: "10"
        }}
      console.log('create')
      const assistant = selectAssistant(req.body.workflow, meta);
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
      res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Не удалось создать новый чат',
      });
    }
  },
  createMessage: async (req, res) => {
    try {
      const message = String(req.body.message || '').trim();

      if (!message) {
        return res.status(400).json({
          error: true,
          message: 'Сообщение не может быть пустым',
        });
      }

      const chatId = req.body.chatId || null;
      const chat = await Chat.findById(chatId);

      // 2. Сохраняем сообщение пользователя
      await ChatMessage.create({
        chatId: chat.id,
        content: message,
        role: 'user',
      });



      const allMessages = await ChatMessage.findLastByChatId(chat.id, 50);
      const meta = {...getMetaMessages(allMessages), user: {
          "title": "Катя",
          "description": "Увлечена рисованием хомяков",
          "age": "10"
        }}
      meta.passport = req.passport;

      console.log(meta, 'meta');

      // // 3. Проверка на команду создания
      // if (isCreateCommand(message)) {
      //   const recentMessages = await ChatMessage.findLastByChatId(chat.id, 2);
      //   console.log(recentMessages, 'recentMessages');
      //   const metadata = parseMetadata(recentMessages[0].metadata);
      //
      //   const systemMessage = await createSystemCreateMessage(metadata, req.passport.id);
      //
      //   const assistantMessage = await createAssistantMessage({
      //     chatId: chat.id,
      //     content: systemMessage,
      //   });
      //
      //   await Chat.touch(chat.id);
      //
      //   return res.json({
      //     chatId: chat.id,
      //     message: normalizeMessage(assistantMessage),
      //   });
      // }

      const assistant = selectAssistant(chat.target, meta)

      // 4. Генерация ответа выбранным ассистентом
      let assistantContent = await assistant({
        messages: allMessages,
        meta,
      });

      console.log(assistantContent,'assistantContent')

      // Если от ассистента получили готовую мету,
      // то обновляем общую мету и запускаем процесс обращени к ассистенту еще раз
      if (assistantContent.meta) {
        console.log(assistantContent.meta, 'assistantContent');
        const newMeta = {...meta, [assistantContent.meta.target]: assistantContent.meta.data}
        const assistant = selectAssistant(chat.target, newMeta)
        assistantContent = await assistant({
          messages: allMessages,
          meta: newMeta,
        });
      }

      const assistantMessage = await createAssistantMessage({
        chatId: chat.id,
        ...assistantContent,
      });

      await Chat.touch(chat.id);

      //const freshUserMessage = await ChatMessage.findById(userMessageId);

      res.json({
        chatId: chat.id,
        message: normalizeMessage(assistantMessage),
        meta,
      });
    } catch (err) {
      console.error('chat.createMessage error:', err);
      res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Не удалось отправить сообщение',
      });
    }
  },

  findMessages: async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id);

      if (!chat) {
        return res
          .status(404)
          .json({ error: true, message: 'Чат не найден или у вас нет доступа' });
      }

      const messages = await ChatMessage.findByChatId(chat.id);
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

  findAll: async (req, res) => {
    try {
      if (!req.passport) {
        return res.status(401).json({
          error: true,
          message: 'Требуется авторизация',
        });
      }

      const chats = await Chat.findAllByPassportId(req.passport.id);

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
