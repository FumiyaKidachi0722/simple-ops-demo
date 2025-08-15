"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { type ErrorInfo, ErrorToast } from "@/components/atoms/error-toast";
import { CustomerAddDialog } from "@/components/organisms/customer-add-dialog";
import { CustomerDetailDialog } from "@/components/organisms/customer-detail-dialog";
import { CustomerEditDialog } from "@/components/organisms/customer-edit-dialog";
import { CustomerFilters } from "@/components/organisms/customer-filters";
import { type CustomerFormValues } from "@/components/organisms/customer-form";
import { Button } from "@/components/ui/button";
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
import { FirebaseCustomerRepository } from "@/infrastructure/firebase/customerRepository";
import { loadCurrentUser } from "@/lib/auth";
import { type Customer, ROLES, type User } from "@/lib/types";

const repo = new FirebaseCustomerRepository();

function CustomersContent({ currentUser }: { currentUser: User }) {
  const {
    customers,
    setCustomers,
    error: customerError,
  } = useCustomers(currentUser);
  const { casts, error: castError } = useCasts();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "lastVisit">("name");
  const [error, setError] = useState<ErrorInfo | null>(null);

  const addCustomer = useCallback(
    async (values: CustomerFormValues) => {
      if (!values.name) {
        setError({ id: Date.now(), message: "登録に失敗しました" });
        return false;
      }
      const newCustomer: Customer = {
        id: Date.now(),
        name: values.name,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        visits: [],
        castId: values.castId || currentUser.id,
        ...(values.birthday ? { birthday: values.birthday } : {}),
        ...(values.favoriteDrink
          ? { favoriteDrink: values.favoriteDrink }
          : {}),
        ...(values.seatPreference
          ? { seatPreference: values.seatPreference }
          : {}),
        ...(values.bottle ? { bottle: values.bottle } : {}),
      };
      try {
        await repo.add(newCustomer);
        setCustomers((prev) => [...prev, newCustomer]);
        setError(null);
        return true;
      } catch {
        setError({ id: Date.now(), message: "登録に失敗しました" });
        return false;
      }
    },
    [setCustomers, currentUser],
  );

  const addVisit = useCallback(
    async (id: number) => {
      const date = new Date().toISOString().slice(0, 10);
      await repo.addVisit(id, date);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, visits: [...c.visits, date] } : c,
        ),
      );
    },
    [setCustomers],
  );

  const updateCustomer = useCallback(
    async (id: number, values: CustomerFormValues) => {
      if (!values.name) {
        setError({ id: Date.now(), message: "更新に失敗しました" });
        return false;
      }
      const updated: Customer = {
        id,
        name: values.name,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        castId: values.castId || currentUser.id,
        visits: customers.find((c) => c.id === id)?.visits ?? [],
        ...(values.birthday ? { birthday: values.birthday } : {}),
        ...(values.favoriteDrink
          ? { favoriteDrink: values.favoriteDrink }
          : {}),
        ...(values.seatPreference
          ? { seatPreference: values.seatPreference }
          : {}),
        ...(values.bottle ? { bottle: values.bottle } : {}),
      };
      try {
        await repo.update(updated);
        setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setError(null);
        return true;
      } catch {
        setError({ id: Date.now(), message: "更新に失敗しました" });
        return false;
      }
    },
    [customers, setCustomers, currentUser],
  );

  function castNameById(id: string) {
    return casts.find((cast) => cast.id === id)?.name || "-";
  }

  const visibleCustomers = useMemo(() => {
    return currentUser.role === ROLES.MANAGER ||
      currentUser.role === ROLES.OWNER
      ? customers
      : customers.filter((c) => c.castId === currentUser.id);
  }, [customers, currentUser.role, currentUser.id]);

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();
    return visibleCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        (c.favoriteDrink?.toLowerCase().includes(q) ?? false),
    );
  }, [search, visibleCustomers]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      const lastA = a.visits[a.visits.length - 1] || "";
      const lastB = b.visits[b.visits.length - 1] || "";
      return lastB.localeCompare(lastA);
    });
  }, [filteredCustomers, sortKey]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">顧客管理</h1>

      <ErrorToast error={error || customerError || castError} />

      <CustomerAddDialog onAddCustomer={addCustomer} castOptions={casts} />

      <CustomerFilters
        search={search}
        sortKey={sortKey}
        onSearchChange={setSearch}
        onSortChange={setSortKey}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-32">名前</TableHead>
            <TableHead className="w-32">誕生日</TableHead>
            <TableHead className="w-40">好きなお酒</TableHead>
            <TableHead className="w-40">席の好み</TableHead>
            <TableHead className="w-40">ボトル</TableHead>
            <TableHead className="w-40">担当キャスト</TableHead>
            <TableHead className="w-40">タグ</TableHead>
            <TableHead className="w-32">最終来店日</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="w-16">{c.id}</TableCell>
              <TableCell className="w-32 truncate">{c.name}</TableCell>
              <TableCell className="w-32 truncate">
                {c.birthday || "-"}
              </TableCell>
              <TableCell className="w-40 truncate">
                {c.favoriteDrink || "-"}
              </TableCell>
              <TableCell className="w-40 truncate">
                {c.seatPreference || "-"}
              </TableCell>
              <TableCell className="w-40 truncate">{c.bottle || "-"}</TableCell>
              <TableCell className="w-40 truncate">
                {castNameById(c.castId)}
              </TableCell>
              <TableCell className="w-40 truncate">
                {c.tags.join(", ")}
              </TableCell>
              <TableCell className="w-32 truncate">
                {c.visits[c.visits.length - 1] || "-"}
              </TableCell>
              <TableCell className="w-32 flex gap-2">
                <CustomerDetailDialog
                  customer={c}
                  castName={castNameById(c.castId)}
                />
                <CustomerEditDialog
                  customer={c}
                  onUpdateCustomer={updateCustomer}
                  castOptions={casts}
                />
                <Button
                  onClick={() => addVisit(c.id)}
                  variant="outline"
                  size="sm"
                  className="bg-white text-black"
                >
                  来店
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CustomersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  if (!currentUser) {
    return (
      <div className="p-4">
        <p>ログインが必要です</p>
      </div>
    );
  }

  return <CustomersContent currentUser={currentUser} />;
}
