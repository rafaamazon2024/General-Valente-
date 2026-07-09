import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './_lib/admin.js';
import { getManausDateString } from './_lib/dates.js';
import { applyOutcome } from './_lib/outcome.js';

// Disparada pelo Vercel Cron (ver vercel.json) às 23:59 America/Manaus (03:59 UTC do dia seguinte).
// getManausDateString() já resolve corretamente o dia calendário de Manaus nesse horário.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const db = getFirestore(getAdminApp());
  const today = getManausDateString();

  const pendingCheckins = await db
    .collection('daily_checkins')
    .where('date', '==', today)
    .where('status', '==', 'pending')
    .get();

  let resolved = 0;
  for (const doc of pendingCheckins.docs) {
    const { uid } = doc.data();
    await applyOutcome(uid, today, 'nao', 'auto_resolved_no');
    resolved++;
  }

  return res.status(200).json({ resolved });
}
