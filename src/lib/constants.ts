import type { LinkItem } from "@/lib/types";

export const LOGIN_LINK: LinkItem = {
  href: "/login",
  label: "ログインはこちら",
};

export const STAFF_REGISTER_LINK: LinkItem = {
  href: "/staff/register",
  label: "スタッフ登録はこちら",
};

export const CAST_REGISTER_LINK: LinkItem = {
  href: "/cast/register",
  label: "キャスト登録はこちら",
};

export const MANAGER_REGISTER_LINK: LinkItem = {
  href: "/manager/register",
  label: "管理者登録はこちら",
};

export const REGISTER_LINKS = [
  LOGIN_LINK,
  STAFF_REGISTER_LINK,
  CAST_REGISTER_LINK,
  MANAGER_REGISTER_LINK,
] as const;
