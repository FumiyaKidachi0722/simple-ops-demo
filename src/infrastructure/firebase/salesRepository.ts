"use client";

import { getApp } from "firebase/app";
import type { Timestamp } from "firebase/firestore";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import type { Bill, BillItem } from "@/lib/types";

type FirestoreTimestampLike =
  | Timestamp
  | { seconds: number; nanoseconds: number };
type CreatedAtWire =
  | string
  | number
  | FirestoreTimestampLike
  | null
  | undefined;

type BillWire = Omit<Bill, "createdAt"> & { createdAt?: CreatedAtWire };

function isSecondsNanoseconds(
  obj: object,
): obj is { seconds: number; nanoseconds: number } {
  const o = obj as { seconds?: number; nanoseconds?: number };
  return typeof o.seconds === "number" && typeof o.nanoseconds === "number";
}

function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

function toIsoOrEmpty(d: Date): string {
  return isValidDate(d) ? d.toISOString() : "";
}

function normalizeCreatedAt(v: CreatedAtWire): string {
  if (v == null) return "";

  if (typeof v === "number") {
    return toIsoOrEmpty(new Date(v));
  }

  if (typeof v === "string") {
    const parsed = new Date(v);
    return isValidDate(parsed) ? parsed.toISOString() : v;
  }

  if (typeof v === "object") {
    // { seconds, nanoseconds } 互換
    if (isSecondsNanoseconds(v)) {
      const ms = v.seconds * 1000 + Math.floor(v.nanoseconds / 1e6);
      return toIsoOrEmpty(new Date(ms));
    }

    const t = v as { toDate?: () => Date };
    if (typeof t.toDate === "function") {
      const d = t.toDate();
      return toIsoOrEmpty(d);
    }

    const maybeDate = v as Date;
    if (typeof (maybeDate as Date).getTime === "function") {
      return toIsoOrEmpty(maybeDate);
    }
  }

  return "";
}

const app = getApp();
const db = getFirestore(app);
const col = collection(db, "bills");

export const salesRepository = {
  async list(): Promise<Bill[]> {
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as BillWire;
      return {
        id: data.id,
        customerId: data.customerId,
        cast: data.cast,
        items: (data.items ?? []) as BillItem[],
        createdAt: normalizeCreatedAt(data.createdAt),
      };
    });
  },

  async save(bill: Bill): Promise<Bill> {
    const docRef = doc(col, String(bill.id));
    await setDoc(
      docRef,
      {
        id: bill.id,
        customerId: bill.customerId,
        cast: bill.cast,
        items: bill.items,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );

    const snap = await getDoc(docRef);
    const data = snap.data() as BillWire | undefined;
    if (!data) throw new Error("Failed to read saved bill");

    return {
      id: data.id,
      customerId: data.customerId,
      cast: data.cast,
      items: (data.items ?? []) as BillItem[],
      createdAt: normalizeCreatedAt(data.createdAt),
    };
  },

  async delete(id: number): Promise<void> {
    await deleteDoc(doc(col, String(id)));
  },
};
