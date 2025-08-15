import type { Customer, User } from "@/lib/types";

export interface CustomerRepository {
  list(currentUser: User): Promise<Customer[]>;
  add(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  addVisit(id: number, date: string): Promise<void>;
}
