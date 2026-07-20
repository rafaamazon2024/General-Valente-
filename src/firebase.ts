import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDocFromServer, Timestamp, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported, type Messaging } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Chave pública VAPID do projeto (Firebase Console > Configurações do Projeto > Cloud Messaging >
// Certificados push da Web), gerada em 09/07/2026.
export const VAPID_KEY = 'BLPuBNfqImE5g9Br9Qd7V2-WLkoIp116hEybw1hyYFi4Eln2hBEVNyz_5IjIacYXncfpQao3h3d7E8YhzE-BZW4';

let messagingInstance: Messaging | null = null;
export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  if (!(await isMessagingSupported())) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export { getToken as getFcmToken, onMessage };

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// Loga o erro e devolve uma mensagem pra UI. NÃO dá throw: todo call site roda dentro de um
// listener onSnapshot ou de um catch de escrita já finalizado - um throw aqui vira uma exceção
// não tratada dentro do callback do SDK do Firestore, que nunca chega no setLoading(false) do
// hook chamador e pode derrubar o processamento de outros listeners onSnapshot da mesma página.
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): string {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo.error;
}

export { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
};
