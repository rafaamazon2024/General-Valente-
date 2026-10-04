import { useEffect, useState } from 'react';

export type Tema = 'dark' | 'light';
const CHAVE = 'gv-tema';

export function temaSalvo(): Tema {
  try {
    const t = localStorage.getItem(CHAVE);
    if (t === 'light' || t === 'dark') return t;
  } catch { /* storage bloqueado */ }
  return 'dark';
}

export function aplicarTema(t: Tema) {
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#eef2f7' : '#050912');
}

export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(() => (document.documentElement.getAttribute('data-theme') as Tema) || temaSalvo());
  useEffect(() => {
    aplicarTema(tema);
    try { localStorage.setItem(CHAVE, tema); } catch { /* ignora */ }
  }, [tema]);
  return [tema, () => setTema((t) => (t === 'dark' ? 'light' : 'dark'))];
}
