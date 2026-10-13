import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createHash } from 'node:crypto';
import type {
  CreateIdeaInput,
  CreateMeetInput,
  CreatePaymentInput,
  CreateProjectInput,
  Idea,
  Meet,
  Passport,
  Payment,
  Place,
  Project,
  ProjectUser,
  User,
  MeetUser,
} from 'entities';

// HTTP and business services are real; persistence and identity use isolated fixtures.
const state = vi.hoisted(() => {
  process.env.ROBOKASSA_LOGIN = 'workflow-test';
  process.env.ROBOKASSA_PASSWORD1 = 'test-password-1';
  process.env.ROBOKASSA_PASSWORD2 = 'test-password-2';
  return {
    ideas: new Map<number, Idea>(),
    projects: new Map<number, Project>(),
    meets: new Map<number, Meet>(),
    payments: new Map<number, Payment>(),
    projectUsers: [] as ProjectUser[],
    meetUsers: [] as MeetUser[],
    user: { id: 7, passportId: 10, title: 'Student' } as User,
    place: { id: 3, title: 'Centre', latitude: 55, longitude: 37 } as Place,
  };
});
vi.mock('./utils/strategies.js', () => ({ default: { yandex: { name: 'yandex', authenticate: vi.fn() } } }));
vi.mock('./utils/assistant.js', () => ({ default: {} }));
vi.mock('./utils/dbNext.js', () => ({ db: { transaction: async (fn: (conn: unknown) => Promise<unknown>) => fn({}) } }));
vi.mock('./services/auth.service.js', () => ({
  AuthService: { authenticateByToken: async (token: string) => ({ id: Number(token), title: 'Account' }) as Passport },
}));
vi.mock('./repositories/idea.repository.js', () => ({
  default: {
    findById: async (id: number) => state.ideas.get(id) ?? null,
    findByIds: async (ids: number[]) => ids.flatMap(id => (state.ideas.has(id) ? [state.ideas.get(id)!] : [])),
    create: async (data: CreateIdeaInput) => {
      const id = state.ideas.size + 1;
      state.ideas.set(id, { ...data, id, today: true, photos: [], userCount: 0, isLiked: 0, createdAt: new Date().toISOString() } as Idea);
      return id;
    },
  },
}));
vi.mock('./repositories/idea-photo.repository.js', () => ({
  IdeaPhotoRepository: {
    findByIdeaId: async () => [],
    findByIdeaIds: async () => [],
  },
}));
vi.mock('./repositories/location-photo.repository.js', () => ({ LocationPhotoRepository: { findByLocationIds: async () => [] } }));
vi.mock('./repositories/rental.repository.js', () => ({ RentalRepository: { conflicts: async () => false } }));
vi.mock('./repositories/project.repository.js', () => ({
  default: {
    create: async (data: CreateProjectInput) => {
      const id = state.projects.size + 1;
      state.projects.set(id, { ...data, id } as Project);
      return id;
    },
    findById: async (id: number) => state.projects.get(id) ?? null,
    findByIds: async (ids: number[]) => [...state.projects.values()].filter(p => ids.includes(p.id)),
  },
}));
vi.mock('./repositories/meet.repository.js', () => ({
  default: {
    create: async (data: CreateMeetInput) => {
      const id = state.meets.size + 1;
      state.meets.set(id, { ...data, locationId: data.locationId ?? null, maxParticipants: data.maxParticipants ?? null,
        startedAt: data.startedAt.replace(' ', 'T') + '+03:00', id, status: 'pending', deletedAt: null });
      return id;
    },
    findById: async (id: number) => state.meets.get(id) ?? null,
    findConflict: async () => null,
    update: async (id: number, data: Partial<Meet>) => { Object.assign(state.meets.get(id)!, data); return true; },
    findByProjectId: async (projectId: number) => [...state.meets.values()].filter(meet => meet.projectId === projectId),
    findAll: async (data: { userId?: number }) =>
      [...state.meets.values()].filter(meet => !data.userId || state.meetUsers.some(join => join.userId === data.userId && join.meetId === meet.id)),
    updateStatus: async (id: number, status: Meet['status']) => {
      state.meets.get(id)!.status = status;
    },
  },
}));
vi.mock('./repositories/place.repository.js', () => ({
  default: {
    findById: async (id: number) => (id === state.place.id ? state.place : null),
    findByIds: async (ids: number[]) => (ids.includes(state.place.id) ? [state.place] : []),
  },
}));
vi.mock('./repositories/place-location.repository.js', () => ({
  default: {
    lockByIds: async () => undefined,
    findLocations: async (placeId: number) => [
      { id: 5, title: 'Workshop', placeId: 3, deletedAt: null },
      { id: 7, title: 'Deleted hall', placeId: 3, deletedAt: '2026-10-11' },
    ].filter(location => location.placeId === placeId),
    findByIds: async (ids: number[]) => [
      { id: 5, title: 'Workshop', placeId: 3, deletedAt: null },
      { id: 6, title: 'Other center hall', placeId: 4, deletedAt: null },
      { id: 7, title: 'Deleted hall', placeId: 3, deletedAt: '2026-10-11' },
    ].filter(location => ids.includes(location.id)),
  },
}));
vi.mock('./repositories/place-passport.repository.js', () => ({
  default: {
    findMembership: async (passportId: number, placeId: number) => (passportId === 30 && placeId === 3 ? { id: 1, role: 'admin' } : null),
  },
}));
vi.mock('./repositories/passport.repository.js', () => ({
  default: {
    lockByIds: async () => undefined,
    findById: async (id: number) => ({ id, title: 'Teacher' }) as Passport,
    findByIds: async (ids: number[]) => [...new Set(ids)].map(id => ({ id, title: 'Teacher' }) as Passport),
  },
}));
vi.mock('./repositories/user.repository.js', () => ({
  default: {
    findById: async (id: number) => (id === 7 ? state.user : null),
    findByIds: async (ids: number[]) => (ids.includes(7) ? [state.user] : []),
    findByPassportId: async (id: number) => (id === 10 ? [state.user] : []),
    findByProjectId: async (id: number) => (state.projectUsers.some(join => join.projectId === id) ? [state.user] : []),
  },
}));
vi.mock('./repositories/project-user.repository.js', () => ({
  default: {
    create: async (data: { projectId: number; userId: number }) => {
      const id = state.projectUsers.length + 1;
      state.projectUsers.push({ ...data, id, createdAt: new Date().toISOString() });
      return id;
    },
    findByUserAndProjectIds: async (userId: number, projectId: number) =>
      state.projectUsers.find(join => join.userId === userId && join.projectId === projectId) ?? null,
    findByProjectId: async (id: number) => state.projectUsers.filter(join => join.projectId === id),
    findByProjectIds: async (ids: number[]) => state.projectUsers.filter(join => ids.includes(join.projectId)),
  },
}));
vi.mock('./repositories/meet-user.repository.js', () => ({
  default: {
    create: async (data: { meetId: number; userId: number }) => {
      const id = state.meetUsers.length + 1;
      state.meetUsers.push({ ...data, id });
      return id;
    },
    findByUserAndMeetIds: async (userId: number, meetId: number) =>
      state.meetUsers.find(join => join.userId === userId && join.meetId === meetId) ?? null,
    findByMeetIds: async (ids: number[]) => state.meetUsers.filter(join => ids.includes(join.meetId)),
    findParticipants: async (meetId: number) => state.meetUsers.filter(join => join.meetId === meetId),
  },
}));
vi.mock('./repositories/payment.repository.js', () => ({
  default: {
    create: async (data: CreatePaymentInput) => {
      const id = state.payments.size + 1;
      state.payments.set(id, {
        ...data,
        id,
        description: data.description ?? null,
        metadata: 'null',
        providerPaymentId: null,
        paidAt: null,
        createdAt: '',
        updatedAt: '',
      });
      return id;
    },
    getById: async (id: number) => state.payments.get(id) ?? null,
    setPaid: vi.fn(async (id: number) => {
      const payment = state.payments.get(id)!;
      payment.status = 'paid';
      payment.paidAt = new Date().toISOString();
    }),
    findPaidMeetIdsByUser: async (userId: number, ids: number[]) =>
      [...state.payments.values()]
        .filter(payment => payment.userId === userId && payment.status === 'paid' && ids.includes(payment.targetId!))
        .map(payment => payment.targetId!),
  },
}));

import app from './app.js';
vi.mock('./repositories/place-schedule.repository.js', () => ({ default: { findByPlaceId: async () =>
  Array.from({ length: 7 }, (_, index) => ({ weekday: index + 1, enabled: true, startTime: '08:00', endTime: '20:00' })) } }));
import PaymentRepository from './repositories/payment.repository.js';
let server: Server;
let url: string;
beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', error => (error ? reject(error) : resolve()));
  });
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => (error ? reject(error) : resolve())));
});
beforeEach(() => {
  state.ideas.clear();
  state.projects.clear();
  state.meets.clear();
  state.payments.clear();
  state.projectUsers.length = 0;
  state.meetUsers.length = 0;
  vi.clearAllMocks();
});

function request(path: string, passportId: number, body?: unknown, method = 'POST', context: Record<string, string> = {}) {
  return fetch(url + path, {
    method,
    headers: { Authorization: `Bearer ${passportId}`, 'Content-Type': 'application/json', ...context },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('project lifecycle through HTTP', () => {
  it('returns the selected hall and rejects halls from another center or deleted halls', async () => {
    const body = { placeId: 3, title: 'Workshop', description: 'Making a toy', image: '', locationId: 5 };
    const response = await request('/project', 20, body);
    expect(response.status).toBe(200);
    const id: number = await response.json();
    const project = await (await request(`/project/${id}`, 20, undefined, 'GET')).json();
    expect(project.locationId).toBe(5);
    expect(project.location).toEqual({ id: 5, title: 'Workshop' });
    for (const locationId of [6, 7, 99, -1]) {
      expect((await request('/project', 20, { ...body, locationId })).status).toBe(400);
    }
    expect(state.projects.size).toBe(1);
    const locations = await (await fetch(url + '/place/3/locations')).json();
    expect(locations).toHaveLength(1);
    expect(locations[0]).toMatchObject({ id: 5, title: 'Workshop', photos: [] });
  });
  it('creates an idea, project and meeting, enrols a child, confirms payment and shows the paid meeting', async () => {
    const ideaResponse = await request('/idea', 10, { title: 'Wooden toy', description: 'Build together' }, 'POST', {
      'X-Role': 'user',
      'X-User-Id': '7',
    });
    expect(ideaResponse.status).toBe(201);
    const ideaId: number = await ideaResponse.json();
    const projectResponse = await request('/project', 20, { ideaId, placeId: 3, title: 'Workshop', description: 'Making a toy', image: '' });
    expect(projectResponse.status).toBe(200);
    const projectId: number = await projectResponse.json();
    const meetResponse = await request('/meet', 20, { projectId, price: 1000, duration: 60, maxParticipants: 12, startedAt: '2099-01-05T10:00:00.000Z' });
    expect(meetResponse.status).toBe(200);
    const meetId: number = await meetResponse.json();
    const approval = await request(`/meet/${meetId}/status`, 30, { status: 'published' }, 'PUT', { 'X-Role': 'place', 'X-Place-Id': '3' });
    expect(approval.status).toBe(200);
    expect((await request('/projectUser', 10, { projectId, userId: 7 })).status).toBe(200);
    expect((await request('/meetUser', 10, { meetId, userId: 7 })).status).toBe(200);
    expect((await request('/meetUser', 10, { meetId, userId: 7 })).status).toBe(409);
    const paymentResponse = await request('/payments', 10, { targetType: 'meet', targetId: meetId, userId: 7 });
    expect(paymentResponse.status).toBe(200);
    const { payment, paymentUrl } = (await paymentResponse.json()) as { payment: Payment; paymentUrl: string };
    expect(payment.provider).toBe('robokassa');
    expect(new URL(paymentUrl).searchParams.get('OutSum')).toBe('1000');
    expect((await request(`/payment/${payment.id}`, 99, undefined, 'GET')).status).toBe(403);

    const callback = async (amount: string, signature?: string) =>
      fetch(url + '/payment/robokassa/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          OutSum: amount,
          InvId: String(payment.id),
          SignatureValue: signature ?? createHash('md5').update(`${amount}:${payment.id}:test-password-2`).digest('hex'),
        }),
      });
    expect((await callback('1000', 'invalid')).status).toBe(400);
    expect((await callback('999')).status).toBe(400);
    const confirmed = await callback('1000.000000');
    expect(confirmed.status).toBe(200);
    expect(await confirmed.text()).toBe(`OK${payment.id}`);
    expect((await callback('1000.000000')).status).toBe(200);
    expect(PaymentRepository.setPaid).toHaveBeenCalledTimes(1);
    expect(state.payments.get(payment.id)?.paidAt).toBeTruthy();

    const project = await (await request(`/project/${projectId}`, 10, undefined, 'GET', { 'X-Role': 'user', 'X-User-Id': '7' })).json();
    expect(project.idea.id).toBe(ideaId);
    expect(project.meets[0]).toMatchObject({ id: meetId, status: 'published', isPaid: true });
    expect(project.meets[0].users[0].id).toBe(7);
    const userMeets = await (await request('/user/meets', 10, undefined, 'GET', { 'X-Role': 'user', 'X-User-Id': '7' })).json();
    expect(userMeets[0]).toMatchObject({ id: meetId, isPaid: true });
  });
});
