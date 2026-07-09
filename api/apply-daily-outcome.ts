import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './_lib/admin.js';
import { getManausDateString } from './_lib/dates.js';
import { applyOutcome } from './_lib/outcome.js';

// Chamada pelo frontend (src/App.tsx) quando o usuário toca em SIM/NÃO na notificação
// (que abre /?action=sim|nao) ou responde manualmente. Autenticação via Firebase ID token
// no header Authorization — nunca confia em um uid vindo do corpo da requisição.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: 'missing Authorization header' });
  }

  let uid: string;
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (error) {
    return res.status(401).json({ error: 'invalid token' });
  }

  const action = req.body?.action;
  if (action !== 'sim' && action !== 'nao') {
    return res.status(400).json({ error: "action deve ser 'sim' ou 'nao'" });
  }

  const today = getManausDateString();
  const result = await applyOutcome(uid, today, action);
  return res.status(200).json(result);
}
