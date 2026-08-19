import { useState, useEffect } from 'react';
import {
  db,
  doc,
  onSnapshot,
  setDoc,
  arrayUnion,
  arrayRemove,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { useAuth } from '../components/AuthContext';
import { todayStr } from '../utils/date';

export interface RotinaLog {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  blocos_feitos: string[]; // ids de BlocoRotina cumpridos nesse dia
  updated_at: string;
}

/**
 * Check-in diário da rotina. Mesmo padrão de habito_logs/treino_logs: o doc
 * "rotina_logs/{uid}_{date}" só passa a existir no primeiro check do dia.
 */
export function useRotinaHoje(date: string = todayStr()) {
  const { user } = useAuth();
  const [log, setLog] = useState<RotinaLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setLog(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(db, 'rotina_logs', `${user.uid}_${date}`);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setLog(snap.exists() ? ({ id: snap.id, ...snap.data() } as RotinaLog) : null);
        setLoading(false);
      },
      (err) => {
        setError(handleFirestoreError(err, OperationType.GET, `rotina_logs/${user.uid}_${date}`));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, date, retryCount]);

  const retry = () => setRetryCount((c) => c + 1);

  const feitos: string[] = log?.blocos_feitos || [];

  const toggleBloco = async (blocoId: string) => {
    if (!user) return;
    const jaFeito = feitos.includes(blocoId);
    try {
      await setDoc(
        doc(db, 'rotina_logs', `${user.uid}_${date}`),
        {
          uid: user.uid,
          date,
          blocos_feitos: jaFeito ? arrayRemove(blocoId) : arrayUnion(blocoId),
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rotina_logs/${user.uid}_${date}`);
    }
  };

  return { feitos, toggleBloco, loading, error, retry };
}
