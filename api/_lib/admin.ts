import { initializeApp, getApps, cert } from 'firebase-admin/app';

// FIREBASE_SERVICE_ACCOUNT_BASE64: o JSON da conta de serviço (Firebase Console > Configurações
// do Projeto > Contas de serviço > Gerar nova chave privada), codificado em base64 — evita o
// problema de quebras de linha na private_key ao colar em variáveis de ambiente da Vercel.
// Gerar com: [Convert]::ToBase64String([IO.File]::ReadAllBytes("caminho\da\chave.json")) no PowerShell.
function getServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 não configurada nas variáveis de ambiente da Vercel');
  }
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
}

export function getAdminApp() {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({ credential: cert(getServiceAccount()) });
}
