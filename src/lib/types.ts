export const ROLES = {
  OWNER: "owner",
  MANAGER: "manager",
  STAFF: "staff",
  CAST: "cast",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type Cast = {
  id: string;
  name: string;
};

export type Customer = {
  id: number;
  name: string;
  tags: string[];
  visits: string[];
  birthday?: string;
  favoriteDrink?: string;
  seatPreference?: string;
  bottle?: string;
  castId: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
};

export type Keep = {
  id: number;
  customerId: number;
  productId: number;
};

export type BillItem = {
  id: number;
  description: string;
  amount: number;
};

export type Bill = {
  id: number;
  customerId: number;
  cast: string;
  items: BillItem[];
  createdAt: string;
};

export type AttendanceRecord = {
  id: number;
  userId: string;
  date: string;
  start?: string;
  end?: string;
  breaks: { start: string; end?: string }[];
  manualStart?: string;
  manualEnd?: string;
  manualBreaks?: { start?: string; end?: string }[];
  plannedStart?: string;
  plannedEnd?: string;
};

export type LinkItem = {
  href: string;
  label: string;
};
