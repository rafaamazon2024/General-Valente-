import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { ROTINA } from '../src/config/rotinaSeed';

const state = vi.hoisted(() => ({ toggleBloco: vi.fn(), upsertBloco: vi.fn(), removeBloco: vi.fn() }));
vi.mock('../src/hooks/useRotinaHoje', () => ({ useRotinaHoje: () => ({ feitos: ['ritual_manha'], toggleBloco: state.toggleBloco, loading: false, error: null, retry: vi.fn() }) }));
vi.mock('../src/hooks/useRotinaConfig', () => ({ useRotinaConfig: () => ({ blocos: ROTINA, upsertBloco: state.upsertBloco, removeBloco: state.removeBloco }) }));
import Rotina from '../src/pages/Rotina';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 9, 10, 0));
  vi.clearAllMocks();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('preserva todos os 13 blocos de segunda, horários e notas ao navegar na semana', () => {
  render(<Rotina onNavigate={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Semana' }));
  const list = screen.getByRole('list', { name: 'Blocos da rotina' });
  const monday = ROTINA.filter(b => b.dias.includes('MO'));
  expect(within(list).getAllByRole('listitem')).toHaveLength(13);
  expect(screen.getByText('21h20 mapeadas')).toBeTruthy();
  for (const block of monday) {
    const row = within(list).getByText(block.titulo, { selector: 'p' }).closest('li')!;
    expect(within(row).getByText(block.nota)).toBeTruthy();
    expect(within(row).getAllByText(block.inicio).length).toBeGreaterThan(0);
    expect(within(row).getAllByText(block.fim).length).toBeGreaterThan(0);
  }
  fireEvent.click(screen.getByRole('button', { name: 'Ter' }));
  expect((screen.getByRole('button', { name: 'Concluir Ritual da manhã' }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Concluir Ritual da manhã' }).getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
  expect((screen.getByRole('button', { name: 'Desmarcar Ritual da manhã' }) as HTMLButtonElement).disabled).toBe(false);
  expect(state.upsertBloco).not.toHaveBeenCalled();
  expect(state.removeBloco).not.toHaveBeenCalled();
});

it('edita um título preservando id, dias, horários, categoria, área e nota', async () => {
  render(<Rotina onNavigate={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Editar Ritual da manhã' }));
  fireEvent.change(screen.getByLabelText('Atividade'), { target: { value: 'Meu ritual da manhã' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar na agenda' }));
  await waitFor(() => expect(state.upsertBloco).toHaveBeenCalledWith({ ...ROTINA[0], titulo: 'Meu ritual da manhã' }));
  expect(state.removeBloco).not.toHaveBeenCalled();
});

it('mantém navegação e check-in separados da edição da agenda', () => {
  const navigate = vi.fn();
  render(<Rotina onNavigate={navigate} />);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir área de Ritual da manhã' }));
  expect(navigate).toHaveBeenCalledWith('espiritualidade');
  fireEvent.click(screen.getByRole('button', { name: 'Desmarcar Ritual da manhã' }));
  expect(state.toggleBloco).toHaveBeenCalledWith('ritual_manha');
  expect(state.upsertBloco).not.toHaveBeenCalled();
});
