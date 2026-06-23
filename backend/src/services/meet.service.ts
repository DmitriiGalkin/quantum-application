import Meet from '../repositories/meet.repository.js';
import { Passport } from '../entities/passport.js';
import { CreateMeet, CreateProject } from '@shared/types';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';

export class MeetService {
  static async create(passport: Passport, data: CreateMeet) {
    if (!passport) throw new Error('UNAUTHORIZED');

    return MeetRepository.create({
      ...data,
      passportId: passport.id,
    });
  }

  static async update(data: any) {
    return Meet.update(data.id, data);
  }

  static async remove(id: number) {
    return Meet.delete(id);
  }

  static async findById(id: number) {
    return Meet.findById(id);
  }

  static async findAll(data: any) {
    return Meet.findAll();
  }
}
