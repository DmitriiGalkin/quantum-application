import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { HttpError } from './utils/http-error.js';

vi.mock('./utils/strategies.js', () => ({ default: { yandex: { name: 'yandex', authenticate: vi.fn() } } }));
vi.mock('./utils/assistant.js', () => ({ default: {} }));
vi.mock('./services/auth.service.js', () => ({
  AuthService: { authenticateByToken: vi.fn(async (token: string) => (token === 'valid' ? { id: 10 } : null)) },
}));
vi.mock('./services/project.service.js', () => ({ ProjectService: { findAll: vi.fn(async () => []), findById: vi.fn(), create: vi.fn() } }));
vi.mock('./services/idea.service.js', () => ({ IdeaService: { create: vi.fn() } }));
vi.mock('./services/payment.service.js', () => ({ PaymentService: { confirmResult: vi.fn(async () => 'OK1') } }));
vi.mock('./services/conversation.service.js', () => ({
  ConversationService: { startConversation: vi.fn(async () => ({ exists: false, conversation: { id: 1, passportId: 10, createdAt: '' } })) },
}));

import app from './app.js';
import { ProjectService } from './services/project.service.js';
import { IdeaService } from './services/idea.service.js';
import { PaymentService } from './services/payment.service.js';
import { ConversationService } from './services/conversation.service.js';

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
beforeEach(() => vi.clearAllMocks());

describe('API authorization and error contract', () => {
  it.each([{ passportId: 20 }, { targetPassportId: 20 }])('starts a chat with the requested recipient using %j', async body => {
    const response = await fetch(url + '/conversation/start', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(response.status).toBe(200);
    expect(ConversationService.startConversation).toHaveBeenCalledWith({ passportId: 10, targetPassportId: 20 });
  });

  it.each([
    ['POST', '/idea'],
    ['PUT', '/idea/1'],
    ['POST', '/ideas/import'],
    ['POST', '/project'],
    ['POST', '/project/1/update'],
    ['DELETE', '/project/1'],
    ['POST', '/meet'],
    ['PUT', '/meet/1'],
    ['PUT', '/meet/1/status'],
    ['DELETE', '/meet/1'],
    ['POST', '/user'],
    ['PUT', '/user/1'],
    ['DELETE', '/user/1'],
    ['POST', '/place'],
    ['PUT', '/place'],
    ['POST', '/place/location'],
    ['POST', '/conversation/start'],
    ['POST', '/conversation/1/messages'],
    ['PATCH', '/message2s/1'],
    ['DELETE', '/message2s/1'],
    ['POST', '/payments'],
    ['POST', '/image'],
  ])('rejects anonymous %s %s', async (method, path) => {
    const response = await fetch(url + path, { method });
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: true });
  });

  it('preserves a domain error status and returns a single JSON response', async () => {
    vi.mocked(ProjectService.findById).mockRejectedValueOnce(new HttpError('Проект не найден', 404));
    const response = await fetch(url + '/project/1');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: true, message: 'Проект не найден' });
  });

  it('keeps public project reading accessible without a token', async () => {
    const response = await fetch(url + '/projects');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it('allows authenticated idea creation without selecting a child', async () => {
    vi.mocked(IdeaService.create).mockResolvedValueOnce(42);
    const response = await fetch(url + '/idea', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid', 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Idea', description: '' }),
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toBe(42);
    expect(IdeaService.create).toHaveBeenCalledWith({ id: 10 }, { title: 'Idea', description: '' }, undefined);
  });

  it('allows payment callbacks without a user session while passing signature verification to the service', async () => {
    const response = await fetch(url + '/payment/robokassa/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'OutSum=100&InvId=1&SignatureValue=test',
    });
    expect(response.status).toBe(200);
    expect(PaymentService.confirmResult).toHaveBeenCalledWith({ OutSum: '100', InvId: '1', SignatureValue: 'test' });
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(await response.text()).toBe('OK1');
  });
});
