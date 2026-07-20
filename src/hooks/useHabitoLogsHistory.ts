import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { HabitoLog } from '../types';

// Histórico completo de habito_logs do usuário (sem filtro de data - evita precisar de
// índice composto uid+date no Firestore). O consumidor filtra o intervalo que quiser.
export function useHabitoLogsHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HabitoLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'habito_logs'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as HabitoLog[];
      setLogs(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'habito_logs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { logs, loading };
}
