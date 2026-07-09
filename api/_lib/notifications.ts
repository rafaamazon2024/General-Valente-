import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './admin.js';

export interface PushPayload {
  title: string;
  body: string;
  action?: 'sim' | 'nao';
}

/** Envia para todos os tokens do usuário; remove tokens inválidos/expirados do array fcmTokens. */
export async function sendPushToUser(uid: string, tokens: string[], payload: PushPayload): Promise<void> {
  if (!tokens.length) return;

  const app = getAdminApp();
  const response = await getMessaging(app).sendEachForMulticast({
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.action ? { action: payload.action } : undefined,
  });

  const staleTokens: string[] = [];
  response.responses.forEach((r, i) => {
    if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
      staleTokens.push(tokens[i]);
    }
  });

  if (staleTokens.length) {
    const db = getFirestore(app);
    const validTokens = tokens.filter((t) => !staleTokens.includes(t));
    await db.collection('users').doc(uid).update({ fcmTokens: validTokens });
  }
}
