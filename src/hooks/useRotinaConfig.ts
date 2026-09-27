import { useEffect, useState } from 'react';
import { db, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { ROTINA, type BlocoRotina } from '../config/rotinaSeed';

export function useRotinaConfig() {
  const { user } = useAuth();
  const [blocos, setBlocos] = useState<BlocoRotina[]>(ROTINA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBlocos(ROTINA);
      setLoading(false);
      return;
    }
    const ref = doc(db, 'rotina_config', user.uid);
    return onSnapshot(ref, (snap) => {
      const data = snap.data();
      setBlocos(data?.blocos?.length ? data.blocos as BlocoRotina[] : ROTINA);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rotina_config/${user.uid}`);
      setBlocos(ROTINA);
      setLoading(false);
    });
  }, [user]);

  const save = async (next: BlocoRotina[]) => {
    if (!user) return;
    setBlocos(next);
    await setDoc(doc(db, 'rotina_config', user.uid), {
      uid: user.uid,
      blocos: next,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  };

  const upsertBloco = async (bloco: BlocoRotina) => {
    const exists = blocos.some((item) => item.id === bloco.id);
    const next = exists ? blocos.map((item) => item.id === bloco.id ? bloco : item) : [...blocos, bloco];
    await save(next);
  };

  const removeBloco = async (id: string) => save(blocos.filter((item) => item.id !== id));

  return { blocos, loading, upsertBloco, removeBloco };
}
