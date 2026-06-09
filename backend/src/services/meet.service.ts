import Meet from '../repositories/meet.repository.js';

export class MeetService {
  static async create(data: any) {
    return Meet.create(data);
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

  static async findAll(y) {
    return Meet.findAll();
  }
}
