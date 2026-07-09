import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './_lib/admin.js';
import { getManausDateString } from './_lib/dates.js';
import { getPendingRecords, applyOutcome } from './_lib/outcome.js';
import { sendPushToUser } from './_lib/notifications.js';

// Disparada pelo Vercel Cron (ver vercel.json) às 22:00 America/Manaus (02:00 UTC).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const db = getFirestore(getAdminApp());
  const today = getManausDateString();

  const usersSnap = await db.collection('users').get();

  let autoCompleted = 0;
  let pushed = 0;

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const user = userDoc.data();
    if (user.alerts_enabled === false) continue;

    const pending = await getPendingRecords(uid, today);
    const tokens: string[] = user.fcmTokens || [];

    if (pending.length === 0) {
      await applyOutcome(uid, today, 'sim');
      autoCompleted++;
      await sendPushToUser(uid, tokens, { title: 'Dia concluído! 🎯', body: 'Você já cumpriu tudo hoje.' });
      if (tokens.length) pushed++;
      continue;
    }

    await db.doc(`daily_checkins/${uid}_${today}`).set({ uid, date: today, status: 'pending' }, { merge: true });

    await sendPushToUser(uid, tokens, {
      title: 'Você concluiu tudo hoje?',
      body: `Você tem ${pending.length} pendência(s) hoje. Toque para responder SIM ou NÃO.`,
    });
    if (tokens.length) pushed++;
  }

  return res.status(200).json({ usersChecked: usersSnap.docs.length, autoCompleted, pushed });
}
