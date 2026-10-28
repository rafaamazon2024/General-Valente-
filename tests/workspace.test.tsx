import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const state = vi.hoisted(() => ({
  entries: [] as any[], save: vi.fn(), mudarMissao: vi.fn(),
  getIdToken: vi.fn(), feitos: [] as string[],
}));
vi.mock('../src/components/AuthContext', () => ({ useAuth: () => ({ user: { getIdToken: state.getIdToken } }) }));
vi.mock('../src/valente/store', () => ({ useValente: () => ({ hoje: '2026-10-28', config: { metas: {} }, logs: { '2026-10-28': { feitos: state.feitos } }, metricas: {}, estadoMissao: (id: string) => state.feitos.includes(id) ? 'feita' : 'pendente', mudarMissao: state.mudarMissao }) }));
vi.mock('../src/firebase', () => ({}));
vi.mock('../src/valente/workspace', async () => {
  const actual = await vi.importActual<typeof import('../src/valente/workspace')>('../src/valente/workspace');
  return { ...actual, useWorkspace: () => ({ entries: state.entries, loading: false, error: '', save: state.save }) };
});
import { EntryEditor, TodayEntries, LibraryPage, AssistantPage } from '../src/valente/pages/Workspace';
import { dueToday, validateFile } from '../src/valente/workspace';

beforeEach(() => { state.entries = []; state.feitos = []; state.save.mockReset().mockResolvedValue(undefined); state.mudarMissao.mockReset().mockResolvedValue(undefined); state.getIdToken.mockResolvedValue('test-id-token'); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('planos confirmados e preservação', () => {
  it('não agenda planos não confirmados, futuros ou arquivados', () => {
    const base = { id: 'p', area_id: 'esporte', type: 'gv_plan', data: { confirmed: true, date: '2026-10-28', repeat: 'daily' } };
    expect(dueToday(base, '2026-10-28')).toBe(true);
    expect(dueToday({ ...base, data: { ...base.data, confirmed: false } }, '2026-10-28')).toBe(false);
    expect(dueToday(base, '2026-10-27')).toBe(false);
    expect(dueToday({ ...base, data: { ...base.data, archived: true } }, '2026-10-28')).toBe(false);
    expect(dueToday({ ...base, data: { ...base.data, repeat: 'weekdays' } }, '2026-11-01')).toBe(false);
    expect(dueToday({ ...base, data: { ...base.data, repeat: 'once' } }, '2026-10-29')).toBe(false);
  });
  it('salva um plano somente com confirmação explícita', async () => {
    const close = vi.fn(); render(<EntryEditor area="alimentacao" kind="gv_plan" onClose={close} />);
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Meu plano confirmado' } });
    fireEvent.change(screen.getByLabelText('Conteúdo, instruções ou detalhes'), { target: { value: 'Conteúdo fornecido pelo usuário' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Salvar registro'));
    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(state.save.mock.calls[0][0]).toMatchObject({ area_id: 'alimentacao', type: 'gv_plan', data: { confirmed: true, titulo: 'Meu plano confirmado', date: '2026-10-28' } });
  });
  it('mantém o texto quando a gravação falha', async () => {
    state.save.mockRejectedValueOnce(new Error('permission-denied'));
    const close = vi.fn(); render(<EntryEditor onClose={close} />);
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Meu diário' } });
    fireEvent.click(screen.getByText('Salvar registro'));
    await screen.findByRole('alert');
    expect((screen.getByLabelText('Título') as HTMLInputElement).value).toBe('Meu diário');
    expect(close).not.toHaveBeenCalled();
  });
  it('registra check diário sem substituir o plano', async () => {
    state.entries = [{ id: 'plan-1', area_id: 'esporte', type: 'gv_plan', data: { confirmed: true, titulo: 'Treino', date: '2026-10-28' } }];
    render(<TodayEntries />); fireEvent.click(screen.getByRole('checkbox', { name: 'Concluir Treino' }));
    await waitFor(() => expect(state.mudarMissao).toHaveBeenCalledWith('record:plan-1', 'concluir'));
    expect(state.save).not.toHaveBeenCalled();
  });
  it('exibe erro de check e permite tentar novamente', async () => {
    state.save.mockRejectedValueOnce(new Error('offline'));
    state.entries = [{ id: 'task', area_id: 'geral', type: 'gv_task', data: { titulo: 'Estudar', date: '2026-10-28' } }];
    render(<TodayEntries />); fireEvent.click(screen.getByRole('checkbox', { name: 'Concluir Estudar' }));
    await screen.findByRole('alert');
    expect((screen.getByRole('checkbox', { name: 'Concluir Estudar' }) as HTMLButtonElement).disabled).toBe(false);
  });
  it('encontra registros antigos e arquiva preservando todos os campos', async () => {
    state.entries = [{ id: 'legacy', area_id: 'desenvolvimento', type: 'livro', data: { titulo: 'Livro antigo', paginaAtual: 75, notas: 'Resumo original' } }];
    render(<LibraryPage />);
    expect(screen.getByText('Livro antigo')).toBeTruthy();
    fireEvent.click(screen.getByText('Arquivar registro'));
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    expect(state.save.mock.calls[0]).toEqual([{ area_id: 'desenvolvimento', type: 'livro', data: { titulo: 'Livro antigo', paginaAtual: 75, notas: 'Resumo original', archived: true } }, 'legacy']);
  });
  it('edita anotação sem perder campos existentes', async () => {
    const entry = { id: 'note', area_id: 'carreira', type: 'gv_note', data: { titulo: 'Original', texto: 'Texto', custom: 42 } };
    render(<EntryEditor entry={entry} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Revisado' } });
    fireEvent.click(screen.getByText('Salvar registro'));
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    expect(state.save.mock.calls[0][0].data).toMatchObject({ titulo: 'Revisado', custom: 42 });
    expect(state.save.mock.calls[0][1]).toBe('note');
  });
  it('mantém tarefas atrasadas e encerra a tarefa uma única vez', async () => {
    const task = { id: 'old', area_id: 'carreira', type: 'gv_task', data: { titulo: 'Proposta', date: '2026-10-27' } };
    expect(dueToday(task, '2026-10-28')).toBe(true);
    state.entries = [task]; render(<TodayEntries />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Concluir Proposta' }));
    await waitFor(() => expect(state.save).toHaveBeenCalled());
    const completed = { ...task, data: state.save.mock.calls[0][0].data };
    expect(completed.data).toMatchObject({ status: 'Concluído', completedDate: '2026-10-28' });
    expect(dueToday(completed, '2026-10-28')).toBe(true);
    expect(dueToday(completed, '2026-10-29')).toBe(false);
  });
  it('respeita os dias selecionados no plano semanal', () => {
    const plan = { id: 'p', area_id: 'esporte', type: 'gv_plan', data: { confirmed: true, date: '2026-10-27', repeat: 'weekly', days: [1, 3, 5] } };
    expect(dueToday(plan, '2026-10-27')).toBe(false);
    expect(dueToday(plan, '2026-10-28')).toBe(true);
    expect(dueToday(plan, '2026-10-29')).toBe(false);
  });
});

describe('materiais e privacidade', () => {
  it('rejeita arquivos vazios e grandes antes de gravar', () => {
    expect(() => validateFile({ name: 'vazio', size: 0 })).toThrow('vazio');
    expect(() => validateFile({ name: 'grande', size: 512001 })).toThrow('500 KB');
    expect(() => validateFile({ name: 'ok', size: 512000 })).not.toThrow();
  });
  it('envia arquivo real à conta e informa sucesso após gravar', async () => {
    render(<LibraryPage />);
    const file = new File(['conteúdo do documento'], 'nota.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('Selecionar arquivo'), { target: { files: [file] } });
    fireEvent.submit(screen.getByText('Enviar arquivo').closest('form')!);
    await screen.findByText(/Arquivo salvo na sua conta/);
    expect(state.save.mock.calls[0][0]).toMatchObject({ type: 'gv_file', data: { filename: 'nota.txt', size: file.size } });
    expect(state.save.mock.calls[0][0].data.base64.length).toBeGreaterThan(0);
  });
  it('consulta a IA sem enviar registros automaticamente', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ answer: 'Resposta real do serviço' }) });
    vi.stubGlobal('fetch', fetchMock);
    state.entries = [{ id: 'private', area_id: 'geral', type: 'gv_diary', data: { titulo: 'Privado', texto: 'SEGREDO' } }];
    render(<AssistantPage ir={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Sua pergunta'), { target: { value: 'Meu próximo passo?' } });
    fireEvent.click(screen.getByText('Consultar assistente'));
    await screen.findByText('Resposta real do serviço');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ prompt: 'Meu próximo passo?' });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer test-id-token');
  });
  it('mostra indisponibilidade real do servidor sem simular uma resposta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'IA não configurada' }) }));
    render(<AssistantPage ir={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Sua pergunta'), { target: { value: 'Olá' } });
    fireEvent.click(screen.getByText('Consultar assistente'));
    expect((await screen.findByRole('alert')).textContent).toBe('IA não configurada');
    expect(screen.queryByText('Resposta do General')).toBeNull();
  });
});
