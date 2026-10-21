import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import passport from 'passport';
import { imageUpload } from './middlewares/image-upload.middleware.js';

import user from './controllers/user.controller.js';
import passportController from './controllers/passport.controller.js';
import { usePassport } from './middlewares/auth.middleware.js';
import meet from './controllers/meet.controller.js';
import meetUser from './controllers/meet-user.controller.js';
import projectCampaign from './controllers/project-campaign.controller.js';
import teacherUser from './controllers/teacher-user.controller.js';
import teacherIdeaController from './controllers/teacher-idea.controller.js';

import image from './controllers/image.controller.js';
import place from './controllers/place.controller.js';
import project from './controllers/project.controller.js';
import idea from './controllers/idea.controller.js';
import ideaUser from './controllers/idea-user.controller.js';
import projectUser from './controllers/project-user.controller.js';
import strategies from './utils/strategies.js';
import type { ControllerWithAuth, RequestWithPassport, TypedResponse } from './controllers/helper.js';
import { HttpError } from './utils/http-error.js';
import placeTeacherController from './controllers/placeTeacher.controller.js';
import placeLocation from './controllers/placeLocation.controller.js';
import paymentController from './controllers/payment.controller.js';
import teacherController from './controllers/teacher.controller.js';
import conversationController from './controllers/conversation.controller.js';
import message2Controller from './controllers/message2.controller.js';
import type { ActiveRole, Passport } from 'entities';
import { ParticipantsService } from './services/participants.service.js';
import notification from './controllers/notification.controller.js';

const router = express.Router();
const privateRouter = express.Router();
const publicRouter = express.Router();

const withAuth =
  <TResponse, TBody, TQuery>(controller: ControllerWithAuth<TResponse, TBody, TQuery>): RequestHandler =>
  async (req, res, next) => {
    try {
      if (!req.passport) throw new HttpError('Необходима авторизация', 401);
      await controller(req as RequestWithPassport<TBody, TQuery>, res as TypedResponse<TResponse>);
    } catch (err) {
      next(err);
    }
  };

export interface Viewer {
  role: ActiveRole;
  passport: Passport | null;
  userId?: number;
  placeId?: number;
};

declare module 'express-serve-static-core' {
  interface Request {
    passport?: Passport;
    viewer?: Viewer;
  }
}
privateRouter.use(usePassport);

export const verifyChild = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.viewer?.userId) {
    return next();
  }

  if (!req.passport) throw new HttpError('Необходима авторизация', 401);
  await ParticipantsService.requireOwnUser(req.passport.id, req.viewer.userId);
  next();
};

privateRouter.use(verifyChild);

const registerOAuth = (provider: 'yandex') => {
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
    passport.authenticate(provider, (err: unknown, user: Passport | false | null) => {
      if (err || !user) {
        return res.redirect('/login');
      }

      const redirect = (req.query.state as string) || '/';
      const separator = redirect.includes('?') ? '&' : '?';

      return res.redirect(`${process.env.FRONTEND_SERVER}${redirect}${separator}access_token=${user.accessToken}`);
    })(req, res, next);
  });
};

['yandex' as const].forEach(registerOAuth);

publicRouter.get('/ideas', idea.findAllPublic);
publicRouter.get('/idea/:id', idea.findById);
publicRouter.get('/idea/:id/projects', idea.findById);
publicRouter.get('/idea/:id/meta', idea.meta);
privateRouter.post('/idea', withAuth(idea.create));
privateRouter.put('/idea/:id', withAuth(idea.update));
privateRouter.post('/ideas/import', withAuth(idea.importCatalog));
privateRouter.post('/idea/:id/generateImage', withAuth(idea.generateImage));
privateRouter.post('/ideaUser', withAuth(ideaUser.create));
privateRouter.delete('/ideaUser', withAuth(ideaUser.delete));

publicRouter.get('/projects', project.findAll);
publicRouter.get('/project/:id', project.findById);
publicRouter.get('/project/:id/meta', project.meta);
privateRouter.post('/project', withAuth(project.create));
privateRouter.post('/project/:id/update', withAuth(project.update));
privateRouter.delete('/project/:id', withAuth(project.delete));
privateRouter.post('/projectUser', withAuth(projectUser.create));
privateRouter.delete('/project/:id/leave', withAuth(projectUser.leave));

privateRouter.get('/user/dashboard', withAuth(user.dashboard));
privateRouter.post('/user', withAuth(user.create));
privateRouter.get('/user/ideas', withAuth(idea.findByUserId));
privateRouter.get('/user/meets', withAuth(meet.findByUserId));
privateRouter.get('/user/projects', withAuth(project.findByUserId));
privateRouter.post('/user/:id/parent-conversation', withAuth(user.parentConversation));
privateRouter.put('/user/:id', withAuth(user.update));
privateRouter.delete('/user/:id', withAuth(user.delete));
publicRouter.get('/users/:id', user.findById);

privateRouter.get('/teacher/dashboard', withAuth(teacherController.dashboard));
privateRouter.get('/teacher/meets', withAuth(meet.findPassportAll));
privateRouter.get('/teacher/users', withAuth(teacherUser.findByTeacher));
privateRouter.get('/teacher/ideas', withAuth(teacherIdeaController.findByTeacher));
publicRouter.get('/teachers/:id', teacherController.getTeacher);

publicRouter.get('/meets', meet.findAll);
publicRouter.get('/meet/:id', meet.findById);
privateRouter.post('/meet', withAuth(meet.create));
privateRouter.put('/meet/:id', withAuth(meet.update));
privateRouter.delete('/meet/:id', withAuth(meet.delete));
privateRouter.put('/meet/:id/status', withAuth(meet.updateStatus));
privateRouter.post('/meet/:id/cancel-booking', withAuth(meet.cancel));
privateRouter.get('/meet/:id/change', withAuth(meet.getChange));
privateRouter.post('/meet/:id/change-response', withAuth(meet.changeResponse));
privateRouter.post('/meetUser', withAuth(meetUser.create));
privateRouter.delete('/meetUser', withAuth(meetUser.delete));

privateRouter.get('/place/dashboard', withAuth(place.dashboard));
privateRouter.get('/place/stats', withAuth(place.stats));
privateRouter.post('/project-campaign', withAuth(projectCampaign.create));
privateRouter.get('/project/:projectId/campaigns', withAuth(projectCampaign.list));
publicRouter.post('/project-campaign/visit', projectCampaign.visit);
privateRouter.get('/place/projects', withAuth(project.findByPlaceId));
privateRouter.get('/place/users', withAuth(teacherUser.getPlaceUsers));
privateRouter.get('/place/teachers', withAuth(placeTeacherController.findAll));
privateRouter.get('/place/meets', withAuth(meet.getPlaceMeets));
privateRouter.get('/place/locations', withAuth(placeLocation.findAll));
privateRouter.put('/place/location/:id', withAuth(placeLocation.update));
privateRouter.delete('/place/location/:id', withAuth(placeLocation.remove));
publicRouter.get('/place/:id/profile', place.profile);
publicRouter.get('/place/:id/meta', place.meta);

publicRouter.get('/places', place.findAll);
privateRouter.post('/place', withAuth(place.create));
privateRouter.post('/place/location', withAuth(placeLocation.create));
privateRouter.put('/place', withAuth(place.update));
publicRouter.get('/place/:id', place.findById);
publicRouter.get('/place/:id/locations', placeLocation.findByPlace);

privateRouter.post('/place/:id/teacher', withAuth(placeTeacherController.create));
privateRouter.post('/place/teachers', withAuth(placeTeacherController.addTeacher));
privateRouter.delete('/place/:id/teacher/:passportId', withAuth(placeTeacherController.remove));
privateRouter.delete('/place/:id/leave', withAuth(placeTeacherController.leave));

// Conversation routes
privateRouter.get('/conversation', withAuth(conversationController.findAll));
privateRouter.post('/conversation/start', withAuth(conversationController.start));
privateRouter.get('/conversation/:id', withAuth(conversationController.findById));
privateRouter.put('/conversation/:id/receipt', withAuth(conversationController.acknowledge));
privateRouter.get('/notifications', withAuth(notification.list));
privateRouter.get('/notifications/unread-count', withAuth(notification.unreadCount));
privateRouter.put('/notification/:id/read', withAuth(notification.read));
privateRouter.get('/push/config', withAuth(notification.config));
privateRouter.post('/push/subscription', withAuth(notification.subscribe));
privateRouter.post('/push/unsubscribe', withAuth(notification.unsubscribe));

// Message routes
privateRouter.post('/conversation/:id/messages', withAuth(message2Controller.create));
privateRouter.patch('/message2s/:id', withAuth(message2Controller.update));
privateRouter.delete('/message2s/:id', withAuth(message2Controller.remove));

publicRouter.post('/passport/login', withAuth(passportController.login));
privateRouter.get('/passport/projects', withAuth(project.findByPassportId));
privateRouter.get('/passport', withAuth(passportController.all));
privateRouter.put('/passport', withAuth(passportController.update));

privateRouter.post('/image', imageUpload, withAuth(image.upload));

privateRouter.post('/payments', withAuth(paymentController.create));
privateRouter.get('/payment/:id', withAuth(paymentController.findById));
publicRouter.post('/payment/robokassa/result', paymentController.result);


router.use(privateRouter);
router.use(publicRouter);

export default router;
