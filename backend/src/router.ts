// router.js

import express from 'express';
import passport from 'passport';
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
import multer from 'multer';

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
    passport.authenticate(provider, (err: any, user: { username: any; }) => {
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
router.get('/passport', passportController.usePassport, passportController.all);
router.put('/passport', passportController.usePassport, passportController.update);

/**
 * Авторизация
 */
router.post('/passport/login', passportController.login);
router.post('/passport/googleLogin', passportController.googleLogin);

/**
 * Картинки
 */
router.post('/image', upload.single('image'), image.upload);

/**
 * Идеи
 */
router.get('/ideas', passportController.usePassport, idea.findAll);
router.get('/idea/:id', passportController.usePassport, idea.findById);

/**
 * Проекты
 */
router.get('/projects', passportController.usePassport, project.findAll);
router.get('/project/:id', passportController.usePassport, project.findById);
router.post('/project', passportController.usePassport, checkConstructor, project.create);
router.put('/project/:id', passportController.usePassport, checkConstructor, project.update);
router.delete('/project/:id', passportController.usePassport, project.delete);
router.get('/project/:id/meta', project.meta);
router.post('/project/:id/generateImage', passportController.usePassport, project.generateImage);

/**
 * Чат
 */
router.get('/chats', passportController.usePassport, chat.findAll);
router.post('/chat', chat.create);
router.get('/chat/:id', passportController.usePassport, chat.findMessages);
//router.post('/chat', passportController.usePassport, chat.createMessage);

router.post('/message', passportController.usePassport, chat.createMessage);

/**
 * Места
 */
router.get('/places', passportController.usePassport, place.findAll);
router.post('/place', passportController.usePassport, place.create);

/**
 * Участие в проекте
 */
router.post('/projectUser', passportController.usePassport, projectUser.create);
router.delete('/projectUser/:id', passportController.usePassport, projectUser.delete);

/**
 * Встречи
 */
router.get('/meets', passportController.usePassport, meet.findAll);
router.get('/meet/:id', passportController.usePassport, meet.findById);
router.post('/meet', passportController.usePassport, checkConstructor, meet.create);
router.put('/meet/:id', passportController.usePassport, checkConstructor, meet.update);
router.delete('/meet/:id', passportController.usePassport, meet.delete);

/**
 * Посещения
 */
router.get('/visits', passportController.usePassport, visit.findAll);
router.post('/visit', passportController.usePassport, visit.create);
router.delete('/visit/:id', passportController.usePassport, visit.delete);

/**
 * Пользователи (Ребенок)
 */
router.get('/user/:id', passportController.usePassport, user.findById);
router.post('/user', passportController.usePassport, checkConstructor, user.create);
router.put('/user/:id', passportController.usePassport, checkConstructor, user.update);
router.delete('/user/:id', passportController.usePassport, user.delete);

export default router;
