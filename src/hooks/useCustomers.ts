import { useEffect, useState } from "react";

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
    repo
      .list(currentUser)
      .then((cs) => {
        setCustomers(cs);
        if (cs.length > 0) setSelectedId(cs[0].id);
      })
      .catch(() =>
        setError({ id: Date.now(), message: "顧客の取得に失敗しました" }),
      );
  }, [currentUser]);

  const nameById = (id: number) => {
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}([${c.id}])` : "";
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
