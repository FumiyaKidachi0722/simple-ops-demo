import { useEffect, useState } from "react";

import type { ErrorInfo } from "@/components/atoms/error-toast";
import { FirebaseAuthRepository } from "@/infrastructure/firebase/authRepository";
import { type Cast, ROLES } from "@/lib/types";

/**
 * Fetches cast users and provides selection state and lookup helpers.
 */
export function useCasts() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const repo = new FirebaseAuthRepository();
    repo
      .listUsers()
      .then((users) => {
        const cs = users
          .filter((u) => u.role === ROLES.CAST)
          .map((u) => ({ id: u.id, name: u.name }));
        setCasts(cs);
        if (cs.length > 0) setSelectedId(cs[0].id);
      })
      .catch(() =>
        setError({ id: Date.now(), message: "キャストの取得に失敗しました" }),
      );
  }, []);

  const nameById = (id: string) => {
    const c = casts.find((c) => c.id === id);
    return c ? c.name : "";
  };

  return { casts, selectedId, setSelectedId, error, nameById };
}
