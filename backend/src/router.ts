import express, { RequestHandler } from 'express';
import passport from 'passport';
import multer from 'multer';

import user from './controllers/user.controller.js';
import passportController from './controllers/passport.controller.js';
import meet from './controllers/meet.controller.js';
import meetUser from './controllers/meet-user.controller.js';
import image from './controllers/image.controller.js';
import place from './controllers/place.controller.js';
import project from './controllers/project.controller.js';
import idea from './controllers/idea.controller.js';
import ideaUser from './controllers/idea-user.controller.js';
import projectUser from './controllers/project-user.controller.js';
import chat from './controllers/chat.controller.js';
import strategies from './strategies.js';
import { ControllerWithAuth } from './controllers/helper.js';

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

privateRouter.use(passportController.usePassport);

const registerOAuth = (provider: 'yandex' | 'google') => {
  const strategy = strategies[provider];

  if (!strategy) {
    console.error(`Стратегия для провайдера ${provider} не найдена.`);
    return;
  }

  passport.use(provider, strategy);

  publicRouter.get(`/login/${provider}`, passport.authenticate(provider));

  publicRouter.get(`/oauth2/redirect/${provider}`, (req, res, next) => {
    passport.authenticate(provider, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect('/login');
      }

      return res.redirect(`${process.env.FRONTEND_SERVER}/?access_token=${user.username}`);
    })(req, res, next);
  });
};

['google' as const, 'yandex' as const].forEach(registerOAuth);

publicRouter.post('/passport/googleLogin', passportController.googleLogin);
publicRouter.get('/ideas', idea.findAllPublic);
publicRouter.get('/idea/:id', idea.findById);
publicRouter.get('/idea/:id/meta', idea.meta);
publicRouter.get('/projects', project.findAll);
publicRouter.get('/project/:id', project.findById);
publicRouter.get('/project/:id/meta', project.meta);
publicRouter.get('/chat/:id', chat.findMessages);
publicRouter.get('/meets', meet.findAll);
publicRouter.get('/meet/:id', meet.findById);
publicRouter.get('/user/:id', user.findById);
publicRouter.get('/places', place.findAll);

// Private
publicRouter.post('/passport/login', withAuth(passportController.login));

privateRouter.get('/passport/projects', withAuth(project.findByPassportId));
privateRouter.get('/passport', withAuth(passportController.all));
privateRouter.put('/passport', withAuth(passportController.update));

privateRouter.post('/image', upload.single('image'), withAuth(image.upload));

privateRouter.post('/idea/:id/generateImage', withAuth(idea.generateImage));

privateRouter.post('/ideaUser', withAuth(ideaUser.create));
privateRouter.delete('/ideaUser', withAuth(ideaUser.delete));

privateRouter.post('/project', withAuth(project.create));
privateRouter.delete('/project/:id', withAuth(project.delete));

privateRouter.post('/chat', withAuth(chat.create));
privateRouter.post('/chat/:id/messages', withAuth(chat.createMessages));

privateRouter.post('/place', withAuth(place.create));

privateRouter.post('/projectUser', withAuth(projectUser.create));
privateRouter.delete('/projectUser/:id', withAuth(projectUser.delete));

privateRouter.post('/meet', withAuth(meet.create));
privateRouter.put('/meet/:id', withAuth(meet.update));
privateRouter.delete('/meet/:id', withAuth(meet.delete));

privateRouter.post('/meetUser', withAuth(meetUser.create));
privateRouter.delete('/meetUser', withAuth(meetUser.delete));

privateRouter.post('/user', withAuth(user.create));
privateRouter.get('/user/:id/ideas', withAuth(idea.findByUserId));
privateRouter.get('/user/:id/projects', withAuth(project.findByUserId));
privateRouter.put('/user/:id', withAuth(user.update));
privateRouter.delete('/user/:id', withAuth(user.delete));

router.use(publicRouter);
router.use(privateRouter);

export default router;
