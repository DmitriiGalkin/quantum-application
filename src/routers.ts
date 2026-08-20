import express from 'express';
import project from './controllers/project.controller.js';

const projectsRouter = express.Router();

projectsRouter.get('/', project.findAll);

export default projectsRouter;