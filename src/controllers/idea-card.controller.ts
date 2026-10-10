import type { Response } from 'express';
import type { Controller, ControllerWithAuth } from './helper.js';
import type { IdeaCard } from '../entities/idea-card.js';
import { IdeaCardService } from '../services/idea-card.service.js';
import { IdeaCardError } from '../services/idea-card.validation.js';

function failure(res: Response, error: unknown): void {
  if (error instanceof IdeaCardError) {
    res.status(error.status).json({ error: true, message: error.message });
  } else if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: true, message: 'Stable idea or photo ID already exists' });
  } else {
    console.error('Idea card operation failed', error);
    res.status(500).json({ error: true, message: 'Idea card operation failed' });
  }
}

const findAll: Controller<IdeaCard[]> = async (_req, res) => {
  try { res.json(await IdeaCardService.findAll()); } catch (error) { failure(res, error); }
};
const findById: Controller<IdeaCard> = async (req, res) => {
  try {
    const card = await IdeaCardService.findById(req.params.id);
    if (!card) { res.status(404).json({ error: true, message: 'Idea not found' }); return; }
    res.json(card);
  } catch (error) { failure(res, error); }
};

const create: ControllerWithAuth<IdeaCard, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  try { res.status(201).json(await IdeaCardService.write(req.body, req.passport.id, 'create')); }
  catch (error) { failure(res, error); }
};
const update: ControllerWithAuth<IdeaCard, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  try { res.json(await IdeaCardService.write(req.body, req.passport.id, 'update', req.params.id)); }
  catch (error) { failure(res, error); }
};
const importCatalog: ControllerWithAuth<{ ideas: number; photos: number }, unknown, unknown> = async (req, res) => {
  if (!req.passport) { res.status(401).json({ error: true, message: 'Authentication required' }); return; }
  try { res.json(await IdeaCardService.import(req.body, req.passport.id)); }
  catch (error) { failure(res, error); }
};

export default { findAll, findById, create, update, importCatalog };
