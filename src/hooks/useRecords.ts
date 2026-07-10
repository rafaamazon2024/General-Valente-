import { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { GenericRecord } from '../types';

export function useRecords(areaId?: string) {
  const { user } = useAuth();
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    let q = query(collection(db, 'records'), where('uid', '==', user.uid));
    if (areaId) {
      q = query(q, where('area_id', '==', areaId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id as any, // Firebase ID is string, but types say number. I'll cast for now or update types.
        ...doc.data()
      })) as GenericRecord[];
      setRecords(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'records');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, areaId]);

  const addRecord = async (record: Omit<GenericRecord, 'id' | 'uid' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'records'), {
        ...record,
        uid: user.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'records');
    }
  };

  const updateRecord = async (id: string, record: Partial<GenericRecord>) => {
    try {
      const recordRef = doc(db, 'records', id);
      await updateDoc(recordRef, {
        ...record,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `records/${id}`);
    }
  };

  const removeRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'records', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `records/${id}`);
    }
  };

  return { records, loading, addRecord, updateRecord, removeRecord };
}
