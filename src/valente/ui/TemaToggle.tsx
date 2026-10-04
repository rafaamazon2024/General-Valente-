import { Moon, Sun } from 'lucide-react';
import { useTema } from '../tema';

export default function TemaToggle({ rotulo = false }: { rotulo?: boolean }) {
  const [tema, alternar] = useTema();
  return (
    <button
      onClick={alternar}
      aria-label={tema === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="painel p-2.5 cursor-pointer flex items-center gap-2 text-mute hover:text-cyan"
    >
      {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {rotulo && <span className="rotulo">{tema === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>}
    </button>
  );
}
