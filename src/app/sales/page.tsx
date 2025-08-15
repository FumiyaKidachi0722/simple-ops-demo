"use client";

import { useEffect, useMemo, useState } from "react";

import { CastSelect } from "@/components/atoms/cast-select";
import { CustomerSelect } from "@/components/atoms/customer-select";
import { type ErrorInfo, ErrorToast } from "@/components/atoms/error-toast";
import { BillDetailDialog } from "@/components/organisms/bill-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCasts } from "@/hooks/useCasts";
import { useCustomers } from "@/hooks/useCustomers";
import { salesRepository } from "@/infrastructure/firebase/salesRepository";
import { loadCurrentUser } from "@/lib/auth";
import { type Bill, type BillItem, type User } from "@/lib/types";

export default function SalesPage() {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined,
  );
  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">売上伝票</h1>
      {currentUser === undefined ? (
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      ) : currentUser === null ? (
        <p>ログインが必要です</p>
      ) : (
        <SalesContent currentUser={currentUser} />
      )}
    </div>
  );
}

function SalesContent({ currentUser }: { currentUser: User }) {
  const {
    customers,
    error: customerError,
    nameById: customerNameById,
  } = useCustomers(currentUser);
  const { casts, error: castError, nameById: castNameById } = useCasts();

  const [bills, setBills] = useState<Bill[]>([]);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [billSearch, setBillSearch] = useState("");

  useEffect(() => {
    salesRepository
      .list()
      .then(setBills)
      .catch(() =>
        setError({ id: Date.now(), message: "伝票の取得に失敗しました" }),
      );
  }, []);

  const filteredBills = useMemo(() => {
    const q = billSearch.trim().toLowerCase();
    if (!q) return bills;
    return bills.filter((b) => {
      const customer = customerNameById(b.customerId)?.toLowerCase() ?? "";
      const cast = (b.cast ?? "").toLowerCase();
      const ts = (b.createdAt ?? "").toLowerCase();
      return (
        customer.includes(q) ||
        cast.includes(q) ||
        ts.includes(q) ||
        String(b.id).includes(q)
      );
    });
  }, [billSearch, bills, customerNameById]);

  const total = (bill: Bill) => bill.items.reduce((s, i) => s + i.amount, 0);

  const currentCastName = castNameById(currentUser.id) || currentUser.name;

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    return bills
      .filter((b) => {
        const d = new Date(b.createdAt);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          b.cast === currentCastName
        );
      })
      .reduce((s, b) => s + total(b), 0);
  }, [bills, currentCastName]);

  const handleSaveBill = async (bill: Bill) => {
    try {
      const saved = await salesRepository.save(bill);
      setBills((prev) => [...prev, saved]);
    } catch {
      setError({ id: Date.now(), message: "伝票の保存に失敗しました" });
    }
  };

  return (
    <div className="space-y-4">
      <ErrorToast error={error || customerError || castError} />
      <div className="text-sm">
        今月の{currentUser.name}の売上: {monthlyTotal}円
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={billSearch}
          onChange={(e) => setBillSearch(e.target.value)}
          placeholder="伝票検索（顧客 / キャスト / 登録日時 / ID）"
          className="max-w-xs"
        />

        <SalesRegisterDialog
          customers={customers}
          casts={casts}
          castNameById={castNameById}
          onSave={handleSaveBill}
          onError={(msg) => setError({ id: Date.now(), message: msg })}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-40">顧客</TableHead>
            <TableHead className="w-40">キャスト</TableHead>
            <TableHead className="w-44">登録日時</TableHead>
            <TableHead className="w-24">合計</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBills.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="w-16">{b.id}</TableCell>
              <TableCell className="w-40 truncate">
                {customerNameById(b.customerId)}
              </TableCell>
              <TableCell className="w-40 truncate">{b.cast}</TableCell>
              <TableCell className="w-44 truncate">{b.createdAt}</TableCell>
              <TableCell className="w-24">{total(b)}円</TableCell>
              <TableCell className="w-24">
                <BillDetailDialog
                  bill={b}
                  customerName={customerNameById(b.customerId)}
                  total={total(b)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SalesRegisterDialog(props: {
  customers: Array<{ id: number; name: string }>;
  casts: Array<{ id: string; name: string }>;
  castNameById: (id: string) => string;
  onSave: (bill: Bill) => Promise<void> | void;
  onError: (msg: string) => void;
}) {
  const { customers, casts, castNameById, onSave, onError } = props;

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number>(customers[0]?.id ?? 0);
  const [castId, setCastId] = useState<string>(casts[0]?.id ?? "");
  const [items, setItems] = useState<BillItem[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setCustomerId(customers[0]?.id ?? 0);
      setCastId(casts[0]?.id ?? "");
    }
  }, [open, customers, casts]);

  const addItem = () => {
    if (!desc || !amount) {
      onError("明細の入力に不備があります");
      return;
    }
    const item: BillItem = {
      id: editingItemId ?? Date.now(),
      description: desc,
      amount: Number(amount),
    };
    setItems((prev) =>
      editingItemId
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [...prev, item],
    );
    setDesc("");
    setAmount("");
    setEditingItemId(null);
  };

  const editItem = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setDesc(item.description);
    setAmount(String(item.amount));
    setEditingItemId(id);
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingItemId === id) {
      setDesc("");
      setAmount("");
      setEditingItemId(null);
    }
  };

  const save = async () => {
    if (!castId || items.length === 0) {
      onError("キャスト未選択、または明細がありません");
      return;
    }
    const bill: Bill = {
      id: Date.now(),
      customerId,
      cast: castNameById(castId),
      items,
      createdAt: new Date().toISOString(),
    };
    await onSave(bill);
    setItems([]);
    setDesc("");
    setAmount("");
    setEditingItemId(null);
    setOpen(false);
  };

  const total = items.reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">売上登録</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>売上登録</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row">
          <CustomerSelect
            customers={customers}
            value={customerId}
            onChange={setCustomerId}
            className="border px-2 py-1"
          />
          <CastSelect
            casts={casts}
            value={castId}
            onChange={setCastId}
            className="border px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="明細内容"
          />
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金額"
            type="number"
          />
          <Button onClick={addItem} className="bg-blue-500 text-white">
            {editingItemId ? "明細更新" : "明細追加"}
          </Button>
        </div>

        {items.length > 0 && (
          <ul className="list-disc pl-5 space-y-1">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-2">
                <span>
                  {i.description}: {i.amount}円
                </span>
                <Button
                  onClick={() => editItem(i.id)}
                  className="bg-yellow-500 text-white h-6 px-2"
                >
                  編集
                </Button>
                <Button
                  onClick={() => deleteItem(i.id)}
                  className="bg-red-500 text-white h-6 px-2"
                >
                  削除
                </Button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">合計：{total}円</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-white text-black"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={save}
              className="bg-green-500 text-white"
              disabled={items.length === 0}
            >
              登録する
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
