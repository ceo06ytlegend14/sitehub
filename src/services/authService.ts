import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebaseCollections } from '@/src/constants/collections';
import { auth, db } from '@/src/services/firebaseClient';
import { LoginInput, RegisterInput } from '@/src/types/auth';
import { AppUser } from '@/src/types/models';

function mapUser(id: string, data: any): AppUser {
  const created = data.createdAt?.toDate?.() ?? new Date();
  const updated = data.updatedAt?.toDate?.() ?? new Date();

  return {
    id,
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    role: data.role ?? 'customer',
    language: data.language ?? 'en',
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
  };
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const reference = doc(db, firebaseCollections.users, uid);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) return null;
  return mapUser(snapshot.id, snapshot.data());
}

export async function signIn(input: LoginInput): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, input.email.trim(), input.password);
  const profile = await getUserProfile(credential.user.uid);

  if (!profile) {
    throw new Error('User profile is missing in Firestore.');
  }

  return profile;
}

export async function signUp(input: RegisterInput): Promise<AppUser> {
  const credential = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);

  const profileDoc = {
    email: input.email.trim(),
    displayName: input.displayName.trim(),
    role: input.role,
    language: 'en',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, firebaseCollections.users, credential.user.uid), profileDoc);

  return {
    id: credential.user.uid,
    email: profileDoc.email,
    displayName: profileDoc.displayName,
    role: profileDoc.role,
    language: profileDoc.language,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function observeAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signOutCurrentUser() {
  await signOut(auth);
}

