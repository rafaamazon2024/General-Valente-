import { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { Exercicio } from '../types';
import { EXERCICIOS_SEED } from '../config/exerciciosSeed';

export function useExercicios() {
  const { user } = useAuth();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const seeded = useRef(false);

  useEffect(() => {
    if (!user) {
      setExercicios([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'exercicios'), where('uid', '==', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Pré-cadastro (uma vez só): se o usuário nunca teve nenhum exercício, popula a Biblioteca
      // com EXERCICIOS_SEED. `seeded` evita reseedar em cada re-render antes do snapshot atualizar.
      if (snapshot.empty && !seeded.current) {
        seeded.current = true;
        for (const ex of EXERCICIOS_SEED) {
          await addDoc(collection(db, 'exercicios'), {
            ...ex,
            uid: user.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        return; // o próprio addDoc vai disparar um novo snapshot com os dados
      }

      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Exercicio[];
      setExercicios(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exercicios');
    });

    return () => unsubscribe();
  }, [user]);

  const addExercicio = async (data: { nome: string; grupo_muscular: string; link_video: string }) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'exercicios'), {
        ...data,
        uid: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'exercicios');
    }
  };

  const updateExercicio = async (id: string, data: Partial<Pick<Exercicio, 'nome' | 'grupo_muscular' | 'link_video'>>) => {
    try {
      await updateDoc(doc(db, 'exercicios', id), { ...data, updated_at: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `exercicios/${id}`);
    }
  };

  const removeExercicio = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'exercicios', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `exercicios/${id}`);
    }
  };

  return { exercicios, loading, addExercicio, updateExercicio, removeExercicio };
}
