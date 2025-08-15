import type { AuthRepository } from "@domain/auth/authRepository";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

import { db, managementAuth } from "@/lib/firebase";
import type { User } from "@/lib/types";

export class FirebaseAuthRepository implements AuthRepository {
  async createUser(email: string, password: string): Promise<string> {
    const credential = await createUserWithEmailAndPassword(
      managementAuth,
      email,
      password,
    );
    await signOut(managementAuth);
    return credential.user.uid;
  }

  async saveUser(user: User): Promise<void> {
    await setDoc(doc(db, "users", user.id), user);
  }

  async listUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((d) => d.data() as User);
  }

  async listSamples(): Promise<Record<string, unknown>[]> {
    const snapshot = await getDocs(collection(db, "samples"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
