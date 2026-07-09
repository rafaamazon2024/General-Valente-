import { useCallback } from 'react';
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, doc, updateDoc, getMessagingIfSupported, getFcmToken, VAPID_KEY } from '../firebase';
import { useAuth } from '../components/AuthContext';

export function useFcm() {
  const { user } = useAuth();

  const requestAndSave = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const messaging = await getMessagingIfSupported();
    if (!messaging) {
      console.warn('FCM não suportado neste navegador.');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    try {
      const token = await getFcmToken(messaging, { vapidKey: VAPID_KEY });
      if (!token) return false;

      await updateDoc(doc(db, 'users', user.uid), {
        fcmTokens: arrayUnion(token),
      });
      return true;
    } catch (error) {
      console.error('Erro ao registrar token FCM:', error);
      return false;
    }
  }, [user]);

  const revoke = useCallback(async () => {
    if (!user) return;
    const messaging = await getMessagingIfSupported();
    if (!messaging) return;

    try {
      const token = await getFcmToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        await updateDoc(doc(db, 'users', user.uid), {
          fcmTokens: arrayRemove(token),
        });
      }
    } catch (error) {
      console.error('Erro ao remover token FCM:', error);
    }
  }, [user]);

  return { requestAndSave, revoke };
}
