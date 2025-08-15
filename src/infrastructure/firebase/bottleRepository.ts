import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Keep, Product } from "@/lib/types";

const PRODUCT_COLLECTION = "products";
const KEEP_COLLECTION = "keeps";

async function list<T>(col: string): Promise<T[]> {
  const snapshot = await getDocs(collection(db, col));
  return snapshot.docs.map((d) => d.data() as T);
}

async function save<T extends { id: number }>(
  col: string,
  item: T,
): Promise<void> {
  await setDoc(doc(db, col, String(item.id)), item);
}

async function remove(col: string, id: number): Promise<void> {
  await deleteDoc(doc(db, col, String(id)));
}

export const bottleRepository = {
  listProducts: () => list<Product>(PRODUCT_COLLECTION),
  saveProduct: (p: Product) => save<Product>(PRODUCT_COLLECTION, p),
  deleteProduct: (id: number) => remove(PRODUCT_COLLECTION, id),
  listKeeps: () => list<Keep>(KEEP_COLLECTION),
  saveKeep: (k: Keep) => save<Keep>(KEEP_COLLECTION, k),
  deleteKeep: (id: number) => remove(KEEP_COLLECTION, id),
};
