import type { CustomerRepository } from "@domain/customer/customerRepository";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { type Customer, ROLES, type User } from "@/lib/types";

const COLLECTION = "customers";

export class FirebaseCustomerRepository implements CustomerRepository {
  private docRef(id: number) {
    return doc(db, COLLECTION, String(id));
  }

  private async save(customer: Customer): Promise<void> {
    await setDoc(this.docRef(customer.id), customer);
  }

  async list(currentUser: User): Promise<Customer[]> {
    const colRef = collection(db, COLLECTION);
    const ref =
      currentUser.role === ROLES.MANAGER || currentUser.role === ROLES.OWNER
        ? colRef
        : query(colRef, where("castId", "==", currentUser.id));
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((d) => d.data() as Customer);
  }

  async add(customer: Customer): Promise<void> {
    await this.save(customer);
  }

  async update(customer: Customer): Promise<void> {
    await this.save(customer);
  }

  async addVisit(id: number, date: string): Promise<void> {
    await updateDoc(this.docRef(id), {
      visits: arrayUnion(date),
    });
  }
}
