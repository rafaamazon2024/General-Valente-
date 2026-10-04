import React from 'react';
import { COR, ROTULO, situacao, type Situacao } from '../areas';

export function Barra({ pct, cor, alt = 4 }: { pct: number | null; cor?: string; alt?: number }) {
  const c = cor || COR[situacao(pct)];
  return (
    <div className="w-full bg-line rounded-sm overflow-hidden" style={{ height: alt }}>
      <div className="h-full transition-all duration-500" style={{ width: `${pct ?? 0}%`, background: c }} />
    </div>
  );
}

export function Selo({ sit }: { sit: Situacao }) {
  return (
    <span className="inline-flex items-center gap-1.5 rotulo" style={{ color: COR[sit] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: COR[sit] }} />
      {ROTULO[sit]}
    </span>
  );
}

export function Titulo({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="rotulo" style={{ color: 'var(--color-ink)' }}>{children}</h2>
      {extra}
    </div>
  );
}

export function Pct({ v, className = '' }: { v: number | null; className?: string }) {
  return <span className={`num ${className}`}>{v === null ? '—' : `${v}%`}</span>;
}

export function Botao({
  children, onClick, variante = 'ghost', className = '', disabled,
}: {
  children: React.ReactNode; onClick?: () => void; variante?: 'primario' | 'ghost'; className?: string; disabled?: boolean;
}) {
  const base = 'rotulo px-3 py-2 rounded-sm border transition-colors disabled:opacity-40 cursor-pointer';
  const v = variante === 'primario'
    ? 'bg-cyan text-bg border-cyan font-semibold hover:brightness-110'
    : 'border-line2 text-ink hover:border-cyan hover:text-cyan';
  return <button disabled={disabled} onClick={onClick} className={`${base} ${v} ${className}`} style={variante === 'primario' ? { color: 'var(--color-on-accent)' } : undefined}>{children}</button>;
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-mute text-sm py-3">{children}</p>;
}
