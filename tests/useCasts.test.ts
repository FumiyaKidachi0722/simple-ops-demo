import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { useCasts } from "@/hooks/useCasts";

vi.mock("@/infrastructure/firebase/authRepository", () => {
  return {
    FirebaseAuthRepository: class {
      async listUsers() {
        return [
          {
            id: "cast1",
            name: "キャスト1",
            email: "cast1@example.com",
            role: "cast",
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "manager1",
            name: "マネージャー1",
            email: "manager1@example.com",
            role: "manager",
            createdAt: "",
            updatedAt: "",
          },
        ];
      }
    },
  };
});

describe("useCasts", () => {
  test("fetches casts from users table", async () => {
    const { result } = renderHook(() => useCasts());
    await waitFor(() => expect(result.current.casts.length).toBe(1));
    expect(result.current.casts[0]).toEqual({ id: "cast1", name: "キャスト1" });
    expect(result.current.selectedId).toBe("cast1");
  });
});
