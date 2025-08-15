import { useEffect, useMemo, useState } from "react";

import type { ErrorInfo } from "@/components/atoms/error-toast";
import { FirebaseCustomerRepository } from "@/infrastructure/firebase/customerRepository";
import type { Customer, User } from "@/lib/types";

/**
 * Fetches customers and provides selection state and lookup helpers.
 */
export function useCustomers(currentUser: User) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState(0);
  const [error, setError] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const repo = new FirebaseCustomerRepository();

    const fetchCustomers = async () => {
      try {
        const cs = await repo.list(currentUser);
        setCustomers(cs);
        setSelectedId(cs[0]?.id ?? 0);
      } catch {
        setError({ id: Date.now(), message: "顧客の取得に失敗しました" });
      }
    };

    void fetchCustomers();
  }, [currentUser]);

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  );

  const nameById = (id: number) => {
    const c = customerMap.get(id);
    return c ? `${c.name} (${c.id})` : "";
  };

  return {
    customers,
    setCustomers,
    selectedId,
    setSelectedId,
    error,
    nameById,
  };
}
