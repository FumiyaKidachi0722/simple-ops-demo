import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { useCustomers } from "@/hooks/useCustomers";
import { ROLES, type User } from "@/lib/types";

vi.mock("@/infrastructure/firebase/customerRepository", () => {
  return {
    FirebaseCustomerRepository: class {
      async list(_user: User) {
        return [
          {
            id: 1,
            name: "太郎",
            tags: [],
            visits: [],
            castId: "cast1",
          },
        ];
      }
    },
  };
});

describe("useCustomers", () => {
  test("fetches customers from customers table", async () => {
    const currentUser: User = {
      id: "manager1",
      name: "",
      email: "",
      role: ROLES.MANAGER,
      createdAt: "",
      updatedAt: "",
    };
    const { result } = renderHook(() => useCustomers(currentUser));
    await waitFor(() => expect(result.current.customers.length).toBe(1));
    expect(result.current.customers[0]).toEqual({
      id: 1,
      name: "太郎",
      tags: [],
      visits: [],
      castId: "cast1",
    });
    expect(result.current.selectedId).toBe(1);
    expect(result.current.nameById(1)).toBe("太郎 (1)");
  });
});
