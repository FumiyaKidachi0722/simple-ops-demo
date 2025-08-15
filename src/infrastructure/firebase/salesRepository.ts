"use client";

import { getApp } from "firebase/app";
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
  Timestamp,
} from "firebase/firestore";

import type { Bill, BillItem } from "@/lib/types";

function tsToIso(v: Bill["createdAt"]): string {
  if (!v) return "";
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  if (typeof v === "string") return v; // 既にISO文字列ならそのまま
  return "";
}

const app = getApp(); // 既にどこかで initializeApp 済み前提
const db = getFirestore(app);
const col = collection(db, "bills");

export const salesRepository = {
  /** 一覧取得（新しい順） */
  async list(): Promise<Bill[]> {
    const q = query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Bill;
      return {
        id: data.id,
        customerId: data.customerId,
        cast: data.cast,
        items: (data.items ?? []) as BillItem[],
        createdAt: tsToIso(data.createdAt) || "", // 空の場合もありうる（旧データ）
      };
    });
  },

  /**
   * 登録・更新
   * - createdAt は serverTimestamp() を採用（クライアント時刻でなくサーバ時刻）
   * - 保存後に getDoc で確定した Timestamp を読み直して ISO 文字列にして返却
   */
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
    const data = snap.data() as Bill | undefined;
    if (!data) {
      throw new Error("Failed to read saved bill");
    }
    return {
      id: data.id,
      customerId: data.customerId,
      cast: data.cast,
      items: (data.items ?? []) as BillItem[],
      createdAt: tsToIso(data.createdAt) || "",
    };
  },

  /** 削除 */
  async delete(id: number): Promise<void> {
    await deleteDoc(doc(col, String(id)));
  },
};
