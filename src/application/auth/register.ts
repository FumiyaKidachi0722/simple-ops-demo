import type { AuthRepository } from "@domain/auth/authRepository";

import type { Role, User } from "@/lib/types";

export async function registerUser(
  repo: AuthRepository,
  email: string,
  password: string,
  name: string,
  role: Role,
): Promise<Record<string, unknown>[]> {
  const id = await repo.createUser(email, password);
  const now = new Date().toISOString();
  const user: User = {
    id,
    name,
    email,
    role,
    createdAt: now,
    updatedAt: now,
  };
  await repo.saveUser(user);
  return repo.listSamples();
}
