import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../components/AuthContext';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc } from '../firebase';

export interface Entry {
  id: string;
  area_id: string;
  type: string;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
interface Workspace {
  entries: Entry[];
  loading: boolean;
  error: string;
  save: (entry: Omit<Entry, 'id'>, id?: string) => Promise<void>;
}
const Context = createContext<Workspace | null>(null);
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error('WorkspaceProvider ausente');
  return context;
}
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setEntries([]); setLoading(true); setError('');
    if (!user) { setLoading(false); return; }
    return onSnapshot(query(collection(db, 'records'), where('uid', '==', user.uid)), snapshot => {
      setEntries(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Entry));
      setError(''); setLoading(false);
    }, () => { setLoading(false); setError('Não foi possível carregar seus registros. Verifique a conexão e tente recarregar.'); });
  }, [user?.uid]);
  async function save(entry: Omit<Entry, 'id'>, id?: string) {
    if (!user) throw new Error('Entre na sua conta para salvar.');
    const updated_at = new Date().toISOString();
    if (id) await updateDoc(doc(db, 'records', id), { ...entry, updated_at });
    else await addDoc(collection(db, 'records'), { ...entry, uid: user.uid, created_at: updated_at, updated_at });
  }
  return <Context.Provider value={{ entries, loading, error, save }}>{children}</Context.Provider>;
}

export const titleOf = (entry: Entry) => String(entry.data.titulo || entry.data.nome || entry.data.projeto || entry.data.item || entry.type);
export function dueToday(entry: Entry, today: string): boolean {
  if (entry.data.archived) return false;
  if (entry.type === 'gv_plan') {
    if (!entry.data.confirmed || entry.data.date > today) return false;
    const weekday = new Date(`${today}T12:00:00`).getDay();
    if (entry.data.repeat === 'daily') return true;
    if (entry.data.repeat === 'weekdays') return weekday > 0 && weekday < 6;
    if (entry.data.repeat === 'weekly') return Boolean(entry.data.days?.includes(weekday));
    return entry.data.date === today;
  }
  if (entry.type === 'gv_task' || entry.type === 'tarefa') {
    if (entry.data.status === 'Concluído') return entry.data.completedDate === today;
    const date = entry.data.date || entry.data.prazo;
    return Boolean(date && date <= today);
  }
  return false;
}
export const MAX_FILE_BYTES = 500 * 1024;
export function validateFile(file: Pick<File, 'size' | 'name'>) {
  if (file.size > MAX_FILE_BYTES) throw new Error('O limite por arquivo é 500 KB. Use um link para materiais maiores.');
  if (!file.size) throw new Error('Este arquivo está vazio.');
}
