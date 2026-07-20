import { useState, useEffect } from 'react';
import { db, doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { useRecords } from './useRecords';
import { HabitoLog } from '../types';
import { todayStr } from '../utils/date';

export function useHabitosHoje() {
  const { user } = useAuth();
  const { records, loading: loadingRecords } = useRecords();
  const [log, setLog] = useState<HabitoLog | null>(null);
  const [loadingLog, setLoadingLog] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const date = todayStr();

  useEffect(() => {
    if (!user) {
      setLog(null);
      setLoadingLog(false);
      return;
    }

    setLoadingLog(true);
    setError(null);

    const ref = doc(db, 'habito_logs', `${user.uid}_${date}`);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setLog({ id: snap.id, ...snap.data() } as HabitoLog);
      } else {
        setLog(null);
      }
      setLoadingLog(false);
    }, (err) => {
      const message = handleFirestoreError(err, OperationType.GET, `habito_logs/${user.uid}_${date}`);
      setError(message);
      setLoadingLog(false);
    });

    return () => unsubscribe();
  }, [user, date, retryCount]);

  const retry = () => setRetryCount(c => c + 1);

  const habitosAtivos = records.filter(r => r.type === 'habito' && r.data.status !== 'Pausado' && r.data.status !== 'Concluído');
  const feitosHoje = log?.habitos_feitos || [];

  const toggleHabito = async (habitoId: string) => {
    if (!user) return;
    const habito = habitosAtivos.find(h => String(h.id) === habitoId);
    const jaFeito = feitosHoje.includes(habitoId);

    try {
      await setDoc(doc(db, 'habito_logs', `${user.uid}_${date}`), {
        uid: user.uid,
        date,
        habitos_feitos: jaFeito ? arrayRemove(habitoId) : arrayUnion(habitoId),
        updated_at: new Date().toISOString(),
      }, { merge: true });

      if (habito) {
        const streakAtual = Number(habito.data.streakAtual) || 0;
        const melhorSequencia = Number(habito.data.melhorSequencia) || 0;
        const novoStreak = jaFeito ? Math.max(0, streakAtual - 1) : streakAtual + 1;
        const novoMelhor = Math.max(melhorSequencia, novoStreak);
        await updateDoc(doc(db, 'records', habitoId), {
          'data.streakAtual': novoStreak,
          'data.melhorSequencia': novoMelhor,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `habito_logs/${user.uid}_${date}`);
    }
  };

  return {
    habitosAtivos,
    feitosHoje,
    toggleHabito,
    loading: loadingRecords || loadingLog,
    error,
    retry,
  };
}
