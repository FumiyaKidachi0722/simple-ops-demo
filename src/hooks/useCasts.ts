import { useEffect, useMemo, useState } from "react";

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

    const fetchCasts = async () => {
      try {
        const users = await repo.listUsers();
        const cs = users
          .filter((u) => u.role === ROLES.CAST)
          .map((u) => ({ id: u.id, name: u.name }));
        setCasts(cs);
        setSelectedId(cs[0]?.id ?? "");
      } catch {
        setError({ id: Date.now(), message: "キャストの取得に失敗しました" });
      }
    };

    void fetchCasts();
  }, []);

  const castMap = useMemo(
    () => new Map(casts.map((c) => [c.id, c.name])),
    [casts],
  );

  const nameById = (id: string) => castMap.get(id) ?? "";

  return { casts, selectedId, setSelectedId, error, nameById };
}
