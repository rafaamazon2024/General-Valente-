import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ verify: vi.fn(), generate: vi.fn(), transaction: vi.fn(), firestore: vi.fn() }));
vi.mock('firebase-admin/auth', () => ({ getAuth: () => ({ verifyIdToken: mocks.verify }) }));
vi.mock('firebase-admin/firestore', () => ({ getFirestore: mocks.firestore }));
vi.mock('../api/_lib/admin', () => ({ getAdminApp: () => ({ name: 'test' }) }));
vi.mock('@google/genai', () => ({ GoogleGenAI: class { models = { generateContent: mocks.generate }; } }));
import handler from '../api/assistant';

beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', 'test-only'); vi.stubEnv('GEMINI_MODEL', 'configured-model'); vi.stubEnv('FIREBASE_SERVICE_ACCOUNT_BASE64', 'test-only');
  mocks.verify.mockReset().mockResolvedValue({ uid: 'owner' }); mocks.generate.mockReset().mockResolvedValue({ text: 'Resposta' });
  mocks.transaction.mockReset().mockImplementation(async fn => fn({ get: async () => ({ data: () => ({ count: 0 }) }), set: vi.fn() }));
  mocks.firestore.mockReturnValue({ collection: () => ({ doc: () => ({ path: 'rate-limit' }) }), runTransaction: mocks.transaction });
});
async function request(overrides = {}) {
  const req = { method: 'POST', headers: { authorization: 'Bearer valid-token' }, body: { prompt: 'Organize meu dia' }, ...overrides };
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), setHeader: vi.fn() };
  await handler(req as any, res as any); return res;
}
it('exige POST e token', async () => {
  expect((await request({ method: 'GET' })).status).toHaveBeenCalledWith(405);
  expect((await request({ headers: {} })).status).toHaveBeenCalledWith(401);
  expect(mocks.generate).not.toHaveBeenCalled();
});
it('não permite sessão inválida', async () => {
  mocks.verify.mockRejectedValueOnce(new Error('invalid'));
  expect((await request()).status).toHaveBeenCalledWith(401);
  expect(mocks.generate).not.toHaveBeenCalled();
});
it('retorna 503 quando a integração não está configurada', async () => {
  vi.stubEnv('GEMINI_API_KEY', '');
  expect((await request()).status).toHaveBeenCalledWith(503);
  expect(mocks.generate).not.toHaveBeenCalled();
});
it('valida tamanho e aplica quota por usuário', async () => {
  expect((await request({ body: { prompt: 'x'.repeat(3001) } })).status).toHaveBeenCalledWith(400);
  mocks.transaction.mockImplementationOnce(async fn => fn({ get: async () => ({ data: () => ({ count: 20 }) }), set: vi.fn() }));
  expect((await request()).status).toHaveBeenCalledWith(429);
  expect(mocks.generate).not.toHaveBeenCalled();
});
it('usa modelo configurado, token verificado e banco existente', async () => {
  const res = await request();
  expect(mocks.verify).toHaveBeenCalledWith('valid-token', true);
  expect(mocks.firestore).toHaveBeenCalledWith(expect.anything(), 'ai-studio-55332e46-09a1-441b-a273-eb44717252d2');
  expect(mocks.generate.mock.calls[0][0].model).toBe('configured-model');
  expect(res.status).toHaveBeenCalledWith(200); expect(res.json).toHaveBeenCalledWith({ answer: 'Resposta' });
});
it('não revela erros do provedor nem credenciais', async () => {
  mocks.generate.mockRejectedValueOnce(new Error('secret-key'));
  const res = await request(); expect(res.status).toHaveBeenCalledWith(502);
  expect(JSON.stringify(res.json.mock.calls)).not.toContain('secret-key');
});
