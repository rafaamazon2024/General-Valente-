import { useState, useEffect } from 'react';
import { db, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { TreinoLog } from '../types';
import { getGruposDoDia } from '../config/treinoSplit';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useTreinoHoje() {
  const { user } = useAuth();
  const [log, setLog] = useState<TreinoLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const date = todayStr();
  const grupos = getGruposDoDia(new Date());

  useEffect(() => {
    if (!user) {
      setLog(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(db, 'treino_logs', `${user.uid}_${date}`);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setLog({ id: snap.id, ...snap.data() } as TreinoLog);
      } else {
        setLog(null);
      }
      setLoading(false);
    }, (err) => {
      const message = handleFirestoreError(err, OperationType.GET, `treino_logs/${user.uid}_${date}`);
      setError(message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, date, retryCount]);

  const retry = () => setRetryCount(c => c + 1);

  const toggleExercicio = async (exercicioId: string, exercicioIdsDoGrupoHoje: string[]) => {
    if (!user) return;
    const atuais = log?.exercicios_feitos || [];
    const novos = atuais.includes(exercicioId)
      ? atuais.filter(id => id !== exercicioId)
      : [...atuais, exercicioId];
    const completo = exercicioIdsDoGrupoHoje.length > 0 && exercicioIdsDoGrupoHoje.every(id => novos.includes(id));

    try {
      await setDoc(doc(db, 'treino_logs', `${user.uid}_${date}`), {
        uid: user.uid,
        date,
        grupos,
        exercicios_feitos: novos,
        completo,
        updated_at: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `treino_logs/${user.uid}_${date}`);
    }
  };

  return { log, loading, error, retry, date, grupos, toggleExercicio };
}
