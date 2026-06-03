import express, { RequestHandler } from 'express';
import passport from 'passport';
import multer from 'multer';

import user from './controllers/user.js';
import passportController from './controllers/passport.js';
import meet from './controllers/meet.js';
import visit from './controllers/visit.js';
import image from './controllers/image.js';
import place from './controllers/place.js';
import project from './controllers/project.js';
import idea from './controllers/idea.js';
import projectUser from './controllers/projectUser.js';
import chat from './controllers/chat.js';
import strategies from './strategies.js';
import { checkConstructor } from './helper.js';
import { User } from '../../application/src/types'; // Импортируем пул соединений

export interface Passport {
  id: number | null;
  provider: string | null;
  providerId: string | null;
  title: string | null;
  description: string | null;
  email: string | null;
  avatar: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}


export interface RequestWithPassport extends Request {
  params: Record<string, string>;
  passport: Passport;
  query: Record<string, string>;
  users: User[];
}

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * Стратегии авторизации
 */
const authProviders = ['google', 'yandex'];

authProviders.forEach(provider => {
  // @ts-ignore
  if (strategies[provider]) {
    // @ts-ignore
    passport.use(provider, strategies[provider]);
  } else {
    console.error(`Стратегия для провайдера ${provider} не найдена.`);
  }

  router.get(`/login/${provider}`, passport.authenticate(provider));
  router.get(`/oauth2/redirect/${provider}`, (req, res, next) => {
    // Используем промисифицированную версию authenticate для совместимости с async/await
    passport.authenticate(provider, (err: any, user: { username: any }) => {
      if (err || !user) {
        return res.redirect('/login');
      }
      // Успешная аутентификация
      return res.redirect(`${process.env.FRONTEND_SERVER}/?access_token=${user.username}`);
    })(req, res, next);
  });
});


/**
 * Родитель (Passport)
 */
// @ts-ignore
router.get('/passport', passportController.usePassport, passportController.all as unknown as RequestHandler);
// @ts-ignore
router.put('/passport', passportController.usePassport, passportController.update as unknown as RequestHandler);

/**
 * Авторизация
 */
// @ts-ignore
router.post('/passport/login', passportController.login);
// @ts-ignore
router.post('/passport/googleLogin', passportController.googleLogin);

/**
 * Картинки
 */
router.post('/image', upload.single('image'), image.upload as unknown as RequestHandler);

/**
 * Идеи
 */
// @ts-ignore
router.get('/ideas', passportController.usePassport, idea.findAll as unknown as RequestHandler);
// @ts-ignore
router.get('/idea/:id', passportController.usePassport, idea.findById as unknown as RequestHandler);


/**
 * Проекты
 */
// @ts-ignore
router.get('/projects', passportController.usePassport, project.findAll as unknown as RequestHandler);
// @ts-ignore
router.get('/project/:id', passportController.usePassport, project.findById as unknown as RequestHandler);
// @ts-ignore
router.post('/project', passportController.usePassport, checkConstructor, project.create as unknown as RequestHandler);
// @ts-ignore
router.put('/project/:id', passportController.usePassport, checkConstructor, project.update as unknown as RequestHandler);
// @ts-ignore
router.delete('/project/:id', passportController.usePassport, project.delete as unknown as RequestHandler);
// @ts-ignore
router.get('/project/:id/meta', project.meta);
// @ts-ignore
router.post('/project/:id/generateImage', passportController.usePassport, project.generateImage as unknown as RequestHandler);

/**
 * Чат
 */
// @ts-ignore
router.get('/chats', passportController.usePassport, chat.findAll as unknown as RequestHandler);
router.post('/chat', chat.create as unknown as RequestHandler);
// @ts-ignore
router.get('/chat/:id', passportController.usePassport, chat.findMessages as unknown as RequestHandler);
//router.post('/chat', passportController.usePassport, chat.createMessage);
// @ts-ignore
router.post('/message', passportController.usePassport, chat.createMessage as unknown as RequestHandler);

/**
 * Места
 */
// @ts-ignore
router.get('/places', passportController.usePassport, place.findAll as unknown as RequestHandler);
// @ts-ignore
router.post('/place', passportController.usePassport, place.create as unknown as RequestHandler);

/**
 * Участие в проекте
 */
// @ts-ignore
router.post('/projectUser', passportController.usePassport, projectUser.create as unknown as RequestHandler);
// @ts-ignore
router.delete('/projectUser/:id', passportController.usePassport, projectUser.delete as unknown as RequestHandler);

/**
 * Встречи
 */
// @ts-ignore
router.get('/meets', passportController.usePassport, meet.findAll as unknown as RequestHandler);
// @ts-ignore
router.get('/meet/:id', passportController.usePassport, meet.findById as unknown as RequestHandler);
// @ts-ignore
router.post('/meet', passportController.usePassport, checkConstructor, meet.create as unknown as RequestHandler);
// @ts-ignore
router.put('/meet/:id', passportController.usePassport, checkConstructor, meet.update as unknown as RequestHandler);
// @ts-ignore
router.delete('/meet/:id', passportController.usePassport, meet.delete as unknown as RequestHandler);

/**
 * Посещения
 */
// @ts-ignore
router.get('/visits', passportController.usePassport, visit.findAll as unknown as RequestHandler);
// @ts-ignore
router.post('/visit', passportController.usePassport, visit.create as unknown as RequestHandler);
// @ts-ignore
router.delete('/visit/:id', passportController.usePassport, visit.delete as unknown as RequestHandler);

/**
 * Пользователи (Ребенок)
 */
// @ts-ignore
router.get('/user/:id', passportController.usePassport, user.findById as unknown as RequestHandler);
// @ts-ignore
router.post('/user', passportController.usePassport, checkConstructor, user.create as unknown as RequestHandler);
// @ts-ignore
router.put('/user/:id', passportController.usePassport, checkConstructor, user.update as unknown as RequestHandler);
// @ts-ignore
router.delete('/user/:id', passportController.usePassport, user.delete as unknown as RequestHandler);

export default router;
