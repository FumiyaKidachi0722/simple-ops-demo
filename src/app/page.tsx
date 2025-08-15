"use client";

import { useEffect, useState } from "react";

import type { MenuItem } from "@/components/organisms/menu-grid";
import { HomeTemplate } from "@/components/templates/home-template";
import { loadCurrentUser } from "@/lib/auth";
import { REGISTER_LINKS } from "@/lib/constants";

export default function Home() {
  const [currentUser, setCurrentUser] =
    useState<ReturnType<typeof loadCurrentUser>>(null);

  useEffect(() => {
    setCurrentUser(loadCurrentUser());
  }, []);

  const menuItems: MenuItem[] = currentUser
    ? [
        ...REGISTER_LINKS.filter((l) => l.href !== "/login").map((l) => ({
          href: l.href,
          label: l.label.replace("はこちら", ""),
        })),
        { href: "/users", label: "ユーザー管理" },
        { href: "/customers", label: "顧客管理" },
        { href: "/bottles", label: "ボトル管理" },
        { href: "/sales", label: "売上伝票" },
        { href: "/attendance", label: "勤怠打刻" },
        { href: "/logout", label: "ログアウト" },
      ]
    : [
        { href: "/login", label: "ログイン" },
        { href: "/logout", label: "ログアウト", disabled: true },
      ];

  return <HomeTemplate menuItems={menuItems} />;
}
