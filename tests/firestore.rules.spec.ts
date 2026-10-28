import { before, after, beforeEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-general-valente', firestore: { host: '127.0.0.1', port: 8089, rules: readFileSync('firestore.rules', 'utf8') } });
});
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/alice'), { email: 'alice@example.test', role: 'admin' });
    await setDoc(doc(db, 'users/bob'), { email: 'bob@example.test' });
    await setDoc(doc(db, 'records/alice-record'), { uid: 'alice', area_id: 'geral', type: 'gv_note', data: { titulo: 'Privado' } });
    await setDoc(doc(db, 'records/bob-record'), { uid: 'bob', area_id: 'geral', type: 'gv_note', data: { titulo: 'Outro usuário' } });
    await setDoc(doc(db, 'exercicios/alice-exercise'), { uid: 'alice', nome: 'Exercício cadastrado' });
    await setDoc(doc(db, 'rotina_logs/alice_2026-10-28'), { uid: 'alice', date: '2026-10-28', blocos_feitos: [] });
  });
});
test('visitante sem login não acessa registros', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'records/alice-record')));
  await assertFails(setDoc(doc(db, 'records/new'), { uid: 'alice', area_id: 'geral', type: 'gv_note', data: { titulo: 'Teste' } }));
});
test('proprietário lê e escreve apenas seus registros', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await assertSucceeds(getDoc(doc(db, 'records/alice-record')));
  await assertSucceeds(getDocs(query(collection(db, 'records'), where('uid', '==', 'alice'))));
  await assertFails(getDoc(doc(db, 'records/bob-record')));
  await assertFails(getDocs(collection(db, 'records')));
  await assertSucceeds(setDoc(doc(db, 'records/new'), { uid: 'alice', area_id: 'geral', type: 'gv_file', data: { titulo: 'Nota.txt', base64: 'dGVzdGU=' } }));
});
test('campo role antigo não concede administração e não pode ser alterado', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await assertFails(getDoc(doc(db, 'users/bob')));
  await assertFails(updateDoc(doc(db, 'users/alice'), { role: 'user' }));
  const newUser = env.authenticatedContext('new-user').firestore();
  await assertFails(setDoc(doc(newUser, 'users/new-user'), { email: 'new@example.test', role: 'admin' }));
});
test('admin exige email autorizado verificado', async () => {
  const unverified = env.authenticatedContext('owner', { email: 'rafa.araujo.27@gmail.com', email_verified: false }).firestore();
  await assertFails(getDoc(doc(unverified, 'records/bob-record')));
  const verified = env.authenticatedContext('owner', { email: 'rafa.araujo.27@gmail.com', email_verified: true }).firestore();
  await assertSucceeds(getDoc(doc(verified, 'records/bob-record')));
});
test('registros e exercícios não podem mudar de proprietário', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await assertFails(updateDoc(doc(db, 'records/alice-record'), { uid: 'bob' }));
  await assertFails(updateDoc(doc(db, 'exercicios/alice-exercise'), { uid: 'bob' }));
  await assertSucceeds(updateDoc(doc(db, 'exercicios/alice-exercise'), { nome: 'Nome revisado' }));
});
test('checks, metas e indicadores ficam isolados por conta', async () => {
  const db = env.authenticatedContext('bob').firestore();
  await assertFails(updateDoc(doc(db, 'rotina_logs/alice_2026-10-28'), { blocos_feitos: ['teste'] }));
  await assertFails(setDoc(doc(db, 'valente_config/alice'), { uid: 'bob', metas: {} }));
  await assertSucceeds(setDoc(doc(db, 'valente_config/bob'), { uid: 'bob', metas: { carreira: 'Meta própria' } }));
  await assertSucceeds(setDoc(doc(db, 'valente_metricas/bob_2026-10-28'), { uid: 'bob', date: '2026-10-28', valores: { agua_ml: 250 } }));
  await assertFails(setDoc(doc(db, 'assistant_limits/bob_1'), { uid: 'bob', count: 0 }));
});
