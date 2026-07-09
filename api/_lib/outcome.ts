import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './admin.js';
import { DAILY_COMMITMENT_TYPES } from './dailyCommitments.js';

const PUNISHMENT_THRESHOLD = 3;

export type CheckinStatus = 'pending' | 'completed_yes' | 'completed_no' | 'auto_resolved_no';

export interface PendingRecord {
  id: string;
  statusField: string;
  doneValue: string;
}

/** Registros de um usuário que contam como "pendência do dia" (prazo <= hoje, status ainda não terminal). */
export async function getPendingRecords(uid: string, dateStr: string): Promise<PendingRecord[]> {
  const db = getFirestore(getAdminApp());
  const recordsSnap = await db.collection('records').where('uid', '==', uid).get();
  const pending: PendingRecord[] = [];

  for (const doc of recordsSnap.docs) {
    const record = doc.data();
    const commitment = DAILY_COMMITMENT_TYPES.find((c) => c.area_id === record.area_id && c.type === record.type);
    if (!commitment) continue;

    const dateValue: string | undefined = record.data?.[commitment.dateField];
    const statusValue: string | undefined = record.data?.[commitment.statusField];
    if (!dateValue || dateValue > dateStr) continue; // sem prazo, ou prazo é no futuro
    if (statusValue && commitment.doneValues.includes(statusValue)) continue; // já concluído

    pending.push({ id: doc.id, statusField: commitment.statusField, doneValue: commitment.doneValues[0] });
  }

  return pending;
}

export interface OutcomeResult {
  skipped: boolean;
  status: CheckinStatus;
  punished: boolean;
}

/**
 * Aplica o desfecho SIM/NÃO de um dia para um usuário. Reaproveitado por
 * api/send-daily-reminders (SIM automático quando não sobra pendência às 22h),
 * api/auto-resolve-checkins (NÃO automático à meia-noite) e
 * api/apply-daily-outcome (toque manual em SIM/NÃO na notificação).
 *
 * Idempotente: se já existe um daily_checkins não-pending para essa data, não reprocessa.
 */
export async function applyOutcome(
  uid: string,
  dateStr: string,
  action: 'sim' | 'nao',
  statusOverride?: CheckinStatus,
): Promise<OutcomeResult> {
  const db = getFirestore(getAdminApp());
  const checkinRef = db.doc(`daily_checkins/${uid}_${dateStr}`);
  const checkinSnap = await checkinRef.get();
  const existing = checkinSnap.data();

  if (existing && existing.status !== 'pending') {
    return { skipped: true, status: existing.status as CheckinStatus, punished: false };
  }

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const user = userSnap.data() || {};
  const streakDays: number = user.streak_days || 0;
  const diasSemCumprir: number = user.dias_sem_cumprir || 0;
  const totalPoints: number = user.total_points || 0;

  let finalStatus: CheckinStatus;
  let punished = false;

  if (action === 'sim') {
    const pending = await getPendingRecords(uid, dateStr);
    const batch = db.batch();
    for (const rec of pending) {
      batch.update(db.doc(`records/${rec.id}`), {
        [`data.${rec.statusField}`]: rec.doneValue,
        updated_at: new Date().toISOString(),
      });
    }
    batch.set(db.collection(`users/${uid}/medals`).doc(), {
      granted_at: new Date().toISOString(),
      reason: 'daily_completion',
    });
    batch.set(
      userRef,
      { streak_days: streakDays + 1, dias_sem_cumprir: 0, total_points: totalPoints + 10, punishment_active: false },
      { merge: true },
    );
    await batch.commit();
    finalStatus = statusOverride ?? 'completed_yes';
  } else {
    const newDiasSemCumprir = diasSemCumprir + 1;
    if (newDiasSemCumprir >= PUNISHMENT_THRESHOLD) {
      punished = true;
      await userRef.set(
        { streak_days: 0, dias_sem_cumprir: 0, total_points: 0, punishment_active: true },
        { merge: true },
      );
    } else {
      await userRef.set({ streak_days: 0, dias_sem_cumprir: newDiasSemCumprir }, { merge: true });
    }
    finalStatus = statusOverride ?? 'completed_no';
  }

  await checkinRef.set({ uid, date: dateStr, status: finalStatus, responded_at: new Date().toISOString() }, { merge: true });

  return { skipped: false, status: finalStatus, punished };
}
