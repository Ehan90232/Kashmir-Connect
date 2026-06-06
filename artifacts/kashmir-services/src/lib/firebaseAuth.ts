import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "customer" | "worker";

export interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  phone: string;
  role: UserRole;
  createdAt?: any;
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: UserRole
): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const userData: AppUser = {
    uid: cred.user.uid,
    email: cred.user.email,
    name,
    phone,
    role,
  };

  await setDoc(doc(db, "users", cred.user.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });

  return userData;
}

export async function logIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
}

export { onAuthStateChanged, auth };
