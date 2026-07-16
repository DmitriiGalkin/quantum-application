import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';
import multer from 'multer';

import user from './controllers/user.controller.js';
import passportController from './controllers/passport.controller.js';
import meet from './controllers/meet.controller.js';
import meetUser from './controllers/meet-user.controller.js';
import teacherUser from './controllers/teacher-user.controller.js';
import teacherIdeaController from './controllers/teacher-idea.controller.js';

import image from './controllers/image.controller.js';
import place from './controllers/place.controller.js';
import project from './controllers/project.controller.js';
import idea from './controllers/idea.controller.js';
import ideaUser from './controllers/idea-user.controller.js';
import projectUser from './controllers/project-user.controller.js';
import chat from './controllers/chat.controller.js';
import strategies from './strategies.js';
import { ControllerWithAuth } from './controllers/helper.js';
import placeTeacherController from './controllers/placeTeacher.controller.js';
import paymentController from './controllers/payment.controller.js';
import teacherController from './controllers/teacher.controller.js';
import { Passport } from './entities/passport.js';
import { ActiveRole } from '@shared/types';
import UserRepository from './repositories/user.repository.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
const publicRouter = express.Router();
const privateRouter = express.Router();

const withAuth =
  <T>(controller: ControllerWithAuth<T>): RequestHandler =>
  async (req, res, next) => {
    try {
      await controller(req as any, res as any);
    } catch (err) {
      next(err);
    }
  };

export interface Viewer {
  role: ActiveRole;
  passport: Passport | null;
  userId?: number;
};

declare global {
  namespace Express {
    interface Request {
      passport?: Passport;
      viewer?: Viewer;
    }
  }
}
privateRouter.use(passportController.usePassport);

export const verifyChild = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.viewer?.userId) {
    return next();
  }

  const child = await UserRepository.findById(req.viewer.userId);

  if (!child) {
    return res.sendStatus(404);
  }

  if (child.passportId !== req.viewer.passport!.id) {
    return res.sendStatus(403);
  }

  next();
};

privateRouter.use(verifyChild);

const registerOAuth = (provider: 'yandex' | 'google') => {
  const strategy = strategies[provider];

  if (!strategy) {
    console.error(`Стратегия для провайдера ${provider} не найдена.`);
    return;
  }

  passport.use(provider, strategy);

  publicRouter.get(`/login/${provider}`, (req, res, next) => {
    const redirect = req.query.redirect as string;

    passport.authenticate(provider, {
      state: redirect || '/',
    })(req, res, next);
  });

  publicRouter.get(`/oauth2/redirect/${provider}`, (req, res, next) => {
    passport.authenticate(provider, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect('/login');
      }

      const redirect = (req.query.state as string) || '/';
      const separator = redirect.includes('?') ? '&' : '?';

      return res.redirect(`${process.env.FRONTEND_SERVER}${redirect}${separator}access_token=${user.accessToken}`);
    })(req, res, next);
  });
};

['google' as const, 'yandex' as const].forEach(registerOAuth);

publicRouter.get('/ideas', idea.findAllPublic);
publicRouter.get('/idea/:id', idea.findById);
publicRouter.get('/idea/:id/projects', idea.findById);
publicRouter.get('/idea/:id/meta', idea.meta);
privateRouter.post('/idea/:id/generateImage', withAuth(idea.generateImage));
privateRouter.post('/ideaUser', withAuth(ideaUser.create));
privateRouter.delete('/ideaUser', withAuth(ideaUser.delete));

publicRouter.get('/projects', project.findAll);
privateRouter.get('/project/:id', withAuth(project.findById));
publicRouter.get('/project/:id/meta', project.meta);
privateRouter.post('/project', withAuth(project.create));
privateRouter.delete('/project/:id', withAuth(project.delete));
privateRouter.post('/projectUser', withAuth(projectUser.create));
privateRouter.delete('/projectUser', withAuth(projectUser.delete));

publicRouter.get('/user/:id', user.findById);
privateRouter.post('/user', withAuth(user.create));
privateRouter.get('/user/:id/ideas', withAuth(idea.findByUserId));
privateRouter.get('/user/:id/projects', withAuth(project.findByUserId));
privateRouter.put('/user/:id', withAuth(user.update));
privateRouter.delete('/user/:id', withAuth(user.delete));

privateRouter.get('/teacher/meets', withAuth(meet.findPassportAll));
privateRouter.get('/teacher/users', withAuth(teacherUser.findByTeacher));
privateRouter.get('/teacher/ideas', withAuth(teacherIdeaController.findByTeacher));
privateRouter.get('/teacher/dashboard', withAuth(teacherController.dashboard));

publicRouter.get('/chat/:id', chat.findMessages);
privateRouter.post('/chat', withAuth(chat.create));
privateRouter.post('/chat/:id/messages', withAuth(chat.createMessages));

publicRouter.get('/meets', meet.findAll);
publicRouter.get('/meet/:id', meet.findById);
privateRouter.post('/meet', withAuth(meet.create));
privateRouter.put('/meet/:id', withAuth(meet.update));
privateRouter.delete('/meet/:id', withAuth(meet.delete));
privateRouter.post('/meetUser', withAuth(meetUser.create));
privateRouter.delete('/meetUser', withAuth(meetUser.delete));

publicRouter.get('/places', place.findAll);
privateRouter.post('/place', withAuth(place.create));
publicRouter.get('/place/:id', place.findById);
privateRouter.get('/place/teachers', withAuth(placeTeacherController.findAll));
privateRouter.post('/place/teachers', withAuth(placeTeacherController.addTeacher));
privateRouter.delete('/place/teachers/:passportId', withAuth(placeTeacherController.remove));

publicRouter.post('/passport/login', withAuth(passportController.login));
privateRouter.get('/passport/projects', withAuth(project.findByPassportId));
privateRouter.get('/passport', withAuth(passportController.all));
privateRouter.put('/passport', withAuth(passportController.update));

privateRouter.post('/image', upload.single('image'), withAuth(image.upload));

privateRouter.post('/payments', withAuth(paymentController.create));
privateRouter.post('/payment/robokassa/result', paymentController.result);



router.use(publicRouter);
router.use(privateRouter);

export default router;
