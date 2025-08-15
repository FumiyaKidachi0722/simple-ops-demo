import type { User } from "@/lib/types";

export interface AuthRepository {
  createUser(email: string, password: string): Promise<string>;
  saveUser(user: User): Promise<void>;
  listUsers(): Promise<User[]>;
  listSamples(): Promise<Record<string, unknown>[]>;
}
